import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopBar } from "@/components/app-shell/top-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] gap-4 p-4">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <TopBar email={user.email ?? ""} firstName={profile?.first_name} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
