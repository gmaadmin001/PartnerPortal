import { requireAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";
import PendingClaimsClient from "./PendingClaimsClient";

export const dynamic = "force-dynamic";

export interface Claim {
  id: string;
  company_name: string | null;
  slug: string | null;
  website_url: string | null;
  claimed_at: string | null;
  claim_name: string | null;
  claim_email: string | null;
  claim_affiliation: string | null;
  claim_plan: string | null;
  domain_match: boolean | null;
}

function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch { return null; }
}

export default async function PendingClaimsPage() {
  const admin = await requireAdmin();
  const service = createServiceClient();

  const { count: regCount } = await service
    .from("service_registrations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .not("user_id", "is", null);

  const { count: badgeCount } = await service
    .from("service_registrations")
    .select("*", { count: "exact", head: true })
    .eq("badge_purchased", true);

  const { data: rows } = await service
    .from("service_registrations")
    .select("id, company_name, slug, website_url, claimed_at, claim_name, claim_email, claim_affiliation, claim_plan")
    .eq("claim_status", "pending")
    .order("claimed_at", { ascending: true });

  const claims: Claim[] = (rows ?? []).map((row) => {
    const emailDomain = row.claim_email ? (row.claim_email as string).split("@")[1]?.toLowerCase() : null;
    const siteDomain = extractDomain(row.website_url as string | null);
    const domain_match = emailDomain && siteDomain ? emailDomain === siteDomain : null;
    return { ...row, domain_match };
  });

  return (
    <PendingClaimsClient
      admin={admin}
      claims={claims}
      counts={{ registrations: regCount ?? 0, claims: claims.length, badges: badgeCount ?? 0 }}
    />
  );
}
