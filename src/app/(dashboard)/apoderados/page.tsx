import { ApoderadosManager } from "@/components/phase2/apoderados-manager";
import { getApoderadosPageData } from "@/lib/phase2/server";

interface ApoderadosPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ApoderadosPage({ searchParams }: ApoderadosPageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { apoderados, pagination } = await getApoderadosPageData({ page });

  return <ApoderadosManager apoderados={apoderados} pagination={pagination} />;
}
