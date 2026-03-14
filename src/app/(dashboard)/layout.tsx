import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-transparent px-3 py-3 lg:px-4">
      <div className="mx-auto flex max-w-[1680px] gap-4">
        <Sidebar role={user.role} />
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 overflow-visible">
          <Topbar user={user} />
          <main className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-md md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
