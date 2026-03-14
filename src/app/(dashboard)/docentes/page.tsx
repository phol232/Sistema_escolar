import { DocentesManager } from "@/components/phase2/docentes-manager";
import { getDocentesPageData } from "@/lib/phase2/server";

interface DocentesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DocentesPage({ searchParams }: DocentesPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { docentes, pagination } = await getDocentesPageData({ page });

  return <DocentesManager docentes={docentes} pagination={pagination} />;
}
