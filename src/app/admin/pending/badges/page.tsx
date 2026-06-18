import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";
import PendingBadgesClient from "./PendingBadgesClient";

export const dynamic = "force-dynamic";

export default async function PendingBadgesPage() {
  const admin = await requireAdmin();
  const service = createServiceClient();

  const { count: regCount } = await service
    .from("service_registrations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .not("user_id", "is", null);

  const { count: claimCount } = await service
    .from("service_registrations")
    .select("*", { count: "exact", head: true })
    .eq("claim_status", "pending");

  const { data: listings } = await service
    .from("service_registrations")
    .select("id,company_name,primary_contact_name,primary_contact_email,slug,website_url,membership_plan,headquarters_country,headquarters_city,created_at")
    .eq("badge_purchased", true)
    .order("created_at", { ascending: true });

  return (
    <PendingBadgesClient
      admin={admin}
      listings={listings ?? []}
      counts={{ registrations: regCount ?? 0, claims: claimCount ?? 0, badges: listings?.length ?? 0 }}
    />
  );
}
