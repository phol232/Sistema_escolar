import { NivelesGradosManager } from "@/components/phase2/niveles-grados-manager";
import { getAniosPageData, getNivelesGradosPageData } from "@/lib/phase2/server";

export default async function NivelesGradosPage() {
  const [{ anios }, { niveles, grados, nivelOptions }] = await Promise.all([
    getAniosPageData(),
    getNivelesGradosPageData(),
  ]);

  return <NivelesGradosManager anios={anios} grados={grados} nivelOptions={nivelOptions} niveles={niveles} />;
}
