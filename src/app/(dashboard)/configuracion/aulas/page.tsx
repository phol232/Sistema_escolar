import { AulasManager } from "@/components/phase2/aulas-manager";
import { getAulasPageData } from "@/lib/phase2/server";

export default async function AulasPage() {
  const { aulas } = await getAulasPageData();

  return <AulasManager aulas={aulas} />;
}
