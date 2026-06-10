import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export default async function AdminClaimsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const service = createServiceClient();

  // Fetch pending claims
  const { data: rows } = await service
    .from("service_registrations")
    .select("id, company_name, slug, claimed_by, claimed_at")
    .eq("claim_status", "pending")
    .order("claimed_at", { ascending: true });

  // Look up claimant emails from auth.users via admin API
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
