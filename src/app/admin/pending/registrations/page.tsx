import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";
import PendingRegistrationsClient from "./PendingRegistrationsClient";

export const dynamic = "force-dynamic";

export default async function PendingRegistrationsPage() {
  const admin = await requireAdmin();
  const service = createServiceClient();

  const { count: claimCount } = await service
    .from("service_registrations")
    .select("*", { count: "exact", head: true })
    .eq("claim_status", "pending");

  const { count: badgeCount } = await service
    .from("service_registrations")
    .select("*", { count: "exact", head: true })
    .eq("badge_purchased", true);

  const { data: listings } = await service
    .from("service_registrations")
    .select("id,company_name,primary_contact_name,primary_contact_email,register_as,membership_plan,headquarters_country,headquarters_city,website_url,primary_category,short_description,created_at")
    .eq("status", "pending")
    .not("user_id", "is", null)
    .order("created_at", { ascending: true });

  return (
    <PendingRegistrationsClient
      admin={admin}
      listings={listings ?? []}
      counts={{ registrations: listings?.length ?? 0, claims: claimCount ?? 0, badges: badgeCount ?? 0 }}
    />
  );
}
