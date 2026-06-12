import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/admin-auth";
import AdminClaimsClient from "./AdminClaimsClient";

export const dynamic = "force-dynamic";

export interface Claim {
  id: string;
  company_name: string | null;
  slug: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  claimant_email: string | null;
}

export default async function AdminClaimsPage() {
  const admin = await requireAdmin();
  if (admin.role !== "admin") redirect("/admin");

  const service = createServiceClient();

  const { data: rows } = await service
    .from("service_registrations")
    .select("id, company_name, slug, claimed_by, claimed_at")
    .eq("claim_status", "pending")
    .order("claimed_at", { ascending: true });

  const claims: Claim[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      let claimant_email: string | null = null;
      if (row.claimed_by) {
        const { data } = await service.auth.admin.getUserById(row.claimed_by);
        claimant_email = data?.user?.email ?? null;
      }
      return { ...row, claimant_email };
    })
  );

  return <AdminClaimsClient claims={claims} />;
}
