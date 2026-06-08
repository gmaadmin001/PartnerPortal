import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard - Global Mobility Adviser",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/register");

  const { data: reg } = await supabase
    .from("service_registrations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  async function signOut() {
    "use server";
    const sb = await createClient();
    await sb.auth.signOut();
    redirect("/register");
  }

  return (
    <div className="bg-white min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gma-navy">Portal Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="px-6 py-2 rounded border-2 border-gma-primary text-gma-primary text-sm font-semibold uppercase tracking-widest hover:bg-gma-primary hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>

        {/* Auth check */}
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 mb-6 text-sm text-green-700 font-medium">
          ✓ Signed in successfully as <strong>{user.email}</strong>
        </div>

        {/* Registration data */}
        {reg ? (
          <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gma-surface border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Registration Record</h2>
              <p className="text-xs text-gray-400 mt-0.5">ID: {reg.id}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                ["Registered As",       reg.register_as],
                ["Company Name",        reg.company_name],
                ["Website URL",         reg.website_url],
                ["Primary Category",    reg.primary_category],
                ["Sub Category",        reg.sub_category],
                ["Headquarters",        [reg.headquarters_city, reg.headquarters_country].filter(Boolean).join(", ")],
                ["Countries Served",    Array.isArray(reg.countries_served) ? reg.countries_served.join(", ") : reg.countries_served],
                ["Delivery Model",      reg.delivery_model],
                ["Company Size",        reg.company_size],
                ["Certifications",      reg.certifications],
                ["Primary Contact",     reg.primary_contact_name],
                ["Contact Email",       reg.primary_contact_email],
                ["Contact Phone",       reg.primary_contact_phone],
                ["Membership Plan",     reg.membership_plan],
                ["Status",              reg.status],
                ["Created",             new Date(reg.created_at).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label as string} className="flex px-6 py-3 text-sm">
                  <span className="w-44 shrink-0 text-gray-400 font-medium">{label}</span>
                  <span className="text-gray-800">{value || <span className="text-gray-300 italic">—</span>}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm text-yellow-700">
            No registration record found for this account. If you just registered, it may take a moment.
          </div>
        )}

      </div>
    </div>
  );
}
