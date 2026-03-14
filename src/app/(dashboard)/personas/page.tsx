import { PersonasManager } from "@/components/phase2/personas-manager";
import { getPersonasPageData } from "@/lib/phase2/server";

interface PersonasPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PersonasPage({ searchParams }: PersonasPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { personas, pagination } = await getPersonasPageData({ page });

  return <PersonasManager personas={personas} pagination={pagination} />;
}
