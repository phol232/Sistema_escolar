import { VinculosManager } from "@/components/phase2/vinculos-manager";
import { getVinculosPageData } from "@/lib/phase2/server";

export default async function ApoderadosVinculacionesPage() {
  const { vinculos, alumnoOptions, apoderadoOptions } = await getVinculosPageData();

  return <VinculosManager alumnoOptions={alumnoOptions} apoderadoOptions={apoderadoOptions} vinculos={vinculos} />;
}
