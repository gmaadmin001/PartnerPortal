import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient, { Panel, ServiceReg } from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Global Mobility Adviser",
};

const VALID_PANELS: Panel[] = ["overview", "profile", "listing", "plans", "reviews", "settings"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/register");

  const sp = await searchParams;
  const rawPanel = sp.panel as Panel | undefined;
  const initialPanel: Panel = VALID_PANELS.includes(rawPanel as Panel) ? (rawPanel as Panel) : "overview";

  const { data: reg } = await supabase
    .from("service_registrations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "" }}
      reg={reg as ServiceReg | null}
      initialPanel={initialPanel}
    />
  );
}
