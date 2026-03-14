import { NivelesGradosManager } from "@/components/phase2/niveles-grados-manager";
import { getNivelesGradosPageData } from "@/lib/phase2/server";

export default async function NivelesGradosPage() {
  const { niveles, grados, nivelOptions } = await getNivelesGradosPageData();

  return <NivelesGradosManager grados={grados} nivelOptions={nivelOptions} niveles={niveles} />;
}
