import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const service = createServiceClient();

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: total },
    { count: newThisWeek },
    { count: pendingClaims },
    { count: pendingVerified },
    { data: registrations },
    { data: byTypeRows },
  ] = await Promise.all([
    service.from("service_registrations").select("*", { count: "exact", head: true }),
    service.from("service_registrations").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    service.from("service_registrations").select("*", { count: "exact", head: true }).eq("claim_status", "pending"),
    service.from("service_registrations").select("*", { count: "exact", head: true }).eq("status", "pending").eq("is_verified", true),
    service.from("service_registrations")
      .select("id,company_name,register_as,membership_plan,status,is_verified,created_at,primary_contact_email,primary_contact_name,primary_category,sub_category,delivery_model,company_size,headquarters_country,headquarters_city,short_description,website_url,slug,logo_url")
      .order("is_verified", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500),
    service.from("service_registrations").select("register_as"),
  ]);

  const byType: Record<string, number> = {};
  for (const row of byTypeRows ?? []) {
    const t = (row.register_as as string) || "unknown";
    byType[t] = (byType[t] ?? 0) + 1;
  }

  return (
    <AdminDashboardClient
      admin={admin}
      registrations={registrations ?? []}
      stats={{ total: total ?? 0, newThisWeek: newThisWeek ?? 0, pendingClaims: pendingClaims ?? 0, pendingVerified: pendingVerified ?? 0, byType }}
    />
  );
}
