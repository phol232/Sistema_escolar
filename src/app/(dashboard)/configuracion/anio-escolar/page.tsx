import { AniosManager } from "@/components/phase2/anios-manager";
import { getAniosPageData } from "@/lib/phase2/server";

export default async function AnioEscolarPage() {
  const { anios } = await getAniosPageData();

  return <AniosManager anios={anios} />;
}
