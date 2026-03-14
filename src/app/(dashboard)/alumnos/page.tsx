import { AlumnosManager } from "@/components/phase2/alumnos-manager";
import { getAlumnosPageData } from "@/lib/phase2/server";

interface AlumnosPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AlumnosPage({ searchParams }: AlumnosPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { alumnos, pagination } = await getAlumnosPageData({ page });

  return <AlumnosManager alumnos={alumnos} pagination={pagination} />;
}
