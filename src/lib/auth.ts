import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { ALL_ROLES } from "@/lib/constants";
import type { AppRole, AppUser } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_ROLE: AppRole = "apoderado";
const APP_ROLES = new Set<AppRole>(ALL_ROLES);

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.has(value as AppRole);
}

export function isRoleAllowed(role: AppRole, allowedRoles: readonly AppRole[]) {
  return allowedRoles.includes(role);
}

function getRoleFromUser(user: User): AppRole | null {
  const appRole = user.app_metadata.role;

  if (isAppRole(appRole)) {
    return appRole;
  }

  return null;
}

function getPersonaIdFromUser(user: User): string | null {
  return toNonEmptyString(user.user_metadata.persona_id);
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toClaimsObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function getRoleFromClaims(claims: Record<string, unknown>): AppRole | null {
  const appMetadata = toClaimsObject(claims.app_metadata);

  if (!appMetadata) {
    return null;
  }

  return isAppRole(appMetadata.role) ? appMetadata.role : null;
}

function getPersonaIdFromClaims(claims: Record<string, unknown>): string | null {
  const userMetadata = toClaimsObject(claims.user_metadata);

  if (!userMetadata) {
    return null;
  }

  return toNonEmptyString(userMetadata.persona_id);
}

function getDisplayNameFromClaims(claims: Record<string, unknown>): string | null {
  const userMetadata = toClaimsObject(claims.user_metadata);

  if (!userMetadata) {
    return null;
  }

  return toNonEmptyString(userMetadata.full_name);
}

async function getProfileFromRpc(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.rpc("get_user_profile");
  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;
    const profile = toClaimsObject(row);
    return {
      role: profile && isAppRole(profile.role) ? profile.role : null,
      personaId: profile ? toNonEmptyString(profile.persona_id) : null,
    };
  }

  const [roleResponse, personaResponse] = await Promise.all([
    supabase.rpc("get_user_role"),
    supabase.rpc("get_user_persona_id"),
  ]);

  return {
    role: isAppRole(roleResponse.data) ? roleResponse.data : null,
    personaId: toNonEmptyString(personaResponse.data),
  };
}

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();
  const claimsResult = await supabase.auth.getClaims();
  const claims = toClaimsObject(claimsResult.data?.claims);

  if (claims) {
    const userId = toNonEmptyString(claims.sub);
    const email = toNonEmptyString(claims.email);

    if (userId && email) {
      const roleFromClaims = getRoleFromClaims(claims);
      const personaIdFromClaims = getPersonaIdFromClaims(claims);
      const displayName = getDisplayNameFromClaims(claims) ?? email;

      const profile =
        roleFromClaims && personaIdFromClaims
          ? { role: roleFromClaims, personaId: personaIdFromClaims }
          : await getProfileFromRpc(supabase);

      return {
        id: userId,
        email,
        role: profile.role ?? roleFromClaims ?? FALLBACK_ROLE,
        personaId: profile.personaId ?? personaIdFromClaims,
        displayName,
      };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const metadataRole = getRoleFromUser(user);
  const metadataPersonaId = getPersonaIdFromUser(user);
  const profile =
    metadataRole && metadataPersonaId ? { role: metadataRole, personaId: metadataPersonaId } : await getProfileFromRpc(supabase);

  const displayName =
    typeof user.user_metadata.full_name === "string" && user.user_metadata.full_name.length > 0
      ? user.user_metadata.full_name
      : user.email;

  return {
    id: user.id,
    email: user.email,
    role: profile.role ?? metadataRole ?? FALLBACK_ROLE,
    personaId: profile.personaId ?? metadataPersonaId,
    displayName,
  };
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  return user;
}
