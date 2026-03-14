"use client";

import { useEffect, useState } from "react";

import type { AppUser } from "@/lib/types";

export function useUser(initialUser: AppUser | null) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return { user };
}
