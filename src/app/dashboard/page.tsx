import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient, { Panel, ServiceReg } from "./DashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard — Global Mobility Adviser",
};

interface Review {
  id: string;
  rating: number;
  body: string | null;
  reviewer_name: string | null;
  created_at: string;
}

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

  let reviews: Review[] = [];
  if (reg) {
    const { data } = await supabase
      .from("provider_reviews")
      .select("id, rating, body, reviewer_name, created_at")
      .eq("provider_id", reg.id)
      .order("created_at", { ascending: false });
    reviews = (data ?? []) as Review[];
  }

  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const completionFields = [
    { label: "Company name",     done: !!reg?.company_name },
    { label: "Website URL",      done: !!reg?.website_url },
    { label: "Company bio",      done: !!reg?.company_bio },
    { label: "Logo uploaded",    done: !!reg?.logo_url },
    { label: "Primary category", done: !!reg?.primary_category },
    { label: "Countries served", done: !!(Array.isArray(reg?.countries_served) && reg.countries_served.length > 0) },
    { label: "Contact phone",    done: !!reg?.primary_contact_phone },
    { label: "Contact email",    done: !!reg?.primary_contact_email },
    { label: "Photos added",     done: !!(Array.isArray(reg?.photos) && reg.photos.length > 0) },
    { label: "Membership plan",  done: !!reg?.membership_plan },
  ];
  const completionPct = Math.round(
    (completionFields.filter((f) => f.done).length / completionFields.length) * 100
  );

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "" }}
      reg={reg as ServiceReg | null}
      reviews={reviews}
      avgRating={avgRating}
      completionFields={completionFields}
      completionPct={completionPct}
      initialPanel={initialPanel}
    />
  );
}
