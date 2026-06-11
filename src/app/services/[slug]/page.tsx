import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import PhotoCarousel from "@/components/services/PhotoCarousel";
import ClaimSection from "@/components/services/ClaimSection";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SideCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gma-surface border-b border-gray-100">
        <span className="text-gma-primary w-4 h-4 shrink-0">{icon}</span>
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">{label}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SectionCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-5 py-3 bg-gma-surface border-b border-gray-100">
        <span className="text-gma-primary w-4 h-4 shrink-0">{icon}</span>
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const PhoneIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MailIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PinIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const GlobeIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>;
const InfoIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ShareIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const ShieldIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const GearIcon = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: provider, error } = await supabase
    .from("service_registrations")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !provider) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === provider.user_id;

  if (provider.status !== "active" && !isOwner) notFound();

  if (!isOwner) {
    const serviceClient = createServiceClient();
    await serviceClient.rpc("increment_profile_view", { supplier_id: provider.id });
  }

  // Claim state — only relevant when the listing has no current owner
  const hasOwner = !!provider.user_id;
  const userClaimStatus = !hasOwner && user
    ? provider.claimed_by === user.id
      ? (provider.claim_status as "pending" | "rejected" | null) ?? "none"
      : "none"
    : "none";

  const photos = Array.isArray(provider.photos) ? (provider.photos as string[]) : [];
  const certs = (provider.certifications ?? "").split(",").map((c: string) => c.trim()).filter(Boolean);
  const diversityFlags = (provider.diversity_flags ?? []) as string[];
  const coreServices = (provider.core_services ?? []) as string[];
  const serviceAreas = [
    ...((provider.countries_served ?? []) as string[]),
    ...((provider.states_served ?? []) as string[]),
  ];
  const social = (provider.social_profiles ?? {}) as Record<string, string>;
  const PLAN_RANK: Record<string, number> = { Basic: 0, Professional: 1, Premier: 2 };
  const rank = PLAN_RANK[provider.membership_plan ?? "Basic"] ?? 0;
  const isPro = rank >= 1;
  const isPremier = rank >= 2;
  const websiteDisplay = (provider.website_url ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-gma-surface">

      {/* ── Preview banner (owner only, non-active listing) ──────────────── */}
      {isOwner && provider.status !== "active" && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-center gap-3">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p className="text-sm font-semibold text-amber-800">
            Preview mode — your listing is <span className="capitalize">{provider.status}</span> and not yet visible to the public.
          </p>
          <Link href="/dashboard" className="text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900">
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="flex items-start gap-6">
            {/* Logo */}
            {isPro && provider.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.logo_url}
                alt={provider.company_name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gma-navy flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white font-bold text-2xl font-display">
                  {provider.company_name.charAt(0)}
                </span>
              </div>
            )}

            {/* Company info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <h1 className="font-display text-2xl font-bold text-gma-navy">
                  {provider.company_name}
                </h1>
                {isPremier && provider.is_verified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    VERIFIED
                  </span>
                )}
                {isPremier && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide">
                    ⭐ RECOMMENDED
                  </span>
                )}
                {isPremier && provider.is_featured && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide">
                    👍 BEST MATCH
                  </span>
                )}
              </div>

              {provider.short_description && (
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                  Company Statement{" "}
                  <strong className="text-gray-800">{provider.short_description}</strong>
                </p>
              )}

              {/* Category + location — visible on all plans */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {provider.primary_category && (
                  <span className="bg-gma-blue-pale text-gma-navy text-xs font-bold px-3 py-1 rounded-full">
                    {provider.primary_category}
                    {provider.sub_category ? ` · ${provider.sub_category}` : ""}
                  </span>
                )}
                {(provider.headquarters_city || provider.headquarters_country) && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {[provider.headquarters_city, provider.headquarters_country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>

            </div>

            {/* Back link */}
            <Link
              href="/services"
              className="shrink-0 text-sm text-gma-primary hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to results
            </Link>
          </div>
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-8 flex gap-8 items-start">

        {/* ── Left sidebar (Professional+ only) ───────────────────────────── */}
        {isPro && <aside className="w-72 shrink-0 space-y-4 sticky top-6">

          {/* Contact Details */}
          <SideCard label="Contact Details" icon={<PhoneIcon />}>
            <div className="space-y-3">
              {provider.primary_contact_phone && (
                <a href={`tel:${provider.primary_contact_phone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-gma-primary transition-colors">
                  <span className="w-4 h-4 text-gma-primary shrink-0"><PhoneIcon /></span>
                  {provider.primary_contact_phone}
                </a>
              )}
              {provider.primary_contact_email && (
                <a href={`mailto:${provider.primary_contact_email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-gma-primary transition-colors break-all">
                  <span className="w-4 h-4 text-gma-primary shrink-0"><MailIcon /></span>
                  {provider.primary_contact_email}
                </a>
              )}
              {provider.company_address && (
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-4 h-4 text-gma-primary shrink-0 mt-0.5"><PinIcon /></span>
                  {provider.company_address}
                </div>
              )}
              {provider.website_url && (
                <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gma-primary hover:underline">
                  <span className="w-4 h-4 shrink-0"><GlobeIcon /></span>
                  {websiteDisplay}
                </a>
              )}
            </div>
          </SideCard>

          {/* Service Areas */}
          {serviceAreas.length > 0 && (
            <SideCard label="Service Areas" icon={<PinIcon />}>
              <div className="flex flex-col gap-1.5">
                {serviceAreas.map((area) => (
                  <div key={area} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-3 h-3 text-gma-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {area}
                  </div>
                ))}
              </div>
            </SideCard>
          )}

          {/* Extra Info */}
          {(provider.service_scope || provider.industry_focus || provider.company_size) && (
            <SideCard label="Extra Info" icon={<InfoIcon />}>
              <div className="space-y-2">
                {provider.service_scope && (
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="font-semibold text-gray-700 shrink-0">Service scope:</span>
                    <span className="text-gray-600">{provider.service_scope}</span>
                  </div>
                )}
                {provider.industry_focus && (
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="font-semibold text-gray-700 shrink-0">Industry focus:</span>
                    <span className="text-gray-600">{provider.industry_focus}</span>
                  </div>
                )}
                {provider.company_size && (
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="font-semibold text-gray-700 shrink-0">Company size:</span>
                    <span className="text-gray-600">{provider.company_size}</span>
                  </div>
                )}
              </div>
            </SideCard>
          )}

          {/* Social Profiles */}
          {(social?.linkedin || social?.discord) && (
            <SideCard label="Social Profiles" icon={<ShareIcon />}>
              <div className="flex items-center gap-3">
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gma-primary hover:border-gma-primary transition-colors"
                    aria-label="LinkedIn">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {social.discord && (
                  <a href={social.discord} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gma-primary hover:border-gma-primary transition-colors"
                    aria-label="Discord">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.018.012.036.027.047a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                    </svg>
                  </a>
                )}
              </div>
            </SideCard>
          )}

          {/* Diversity & Compliance */}
          {(certs.length > 0 || diversityFlags.length > 0) && (
            <SideCard label="Diversity & Compliance" icon={<ShieldIcon />}>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set([...certs, ...diversityFlags])].map((item) => (
                  <span key={item} className="bg-gma-blue-pale text-gma-navy text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {item}
                  </span>
                ))}
              </div>
            </SideCard>
          )}
        </aside>}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Service Coverage — visible on all plans */}
          {serviceAreas.length > 0 && (
            <SectionCard label="Service Coverage" icon={<PinIcon />}>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span key={area} className="bg-gma-blue-pale text-gma-navy text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {area}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Service Details — visible on all plans */}
          {(provider.register_as || provider.delivery_model || provider.company_size) && (
            <SectionCard label="Service Details" icon={<InfoIcon />}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {provider.register_as && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                    <p className="text-sm text-gray-700">{provider.register_as}</p>
                  </div>
                )}
                {provider.delivery_model && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery</p>
                    <p className="text-sm text-gray-700">{provider.delivery_model}</p>
                  </div>
                )}
                {provider.company_size && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Company Size</p>
                    <p className="text-sm text-gray-700">{provider.company_size}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* Company Bio */}
          {isPro && provider.company_bio && (
            <SectionCard label="Company Bio" icon={<InfoIcon />}>
              <p className="text-gray-700 text-sm leading-relaxed">{provider.company_bio}</p>
            </SectionCard>
          )}

          {/* Photo Gallery */}
          {isPremier && photos.length > 0 && <PhotoCarousel photos={photos} />}

          {/* Core Services */}
          {isPremier && coreServices.length > 0 && (
            <SectionCard label="Core Services" icon={<GearIcon />}>
              <div className="divide-y divide-gray-100">
                {coreServices.map((svc) => (
                  <div key={svc} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <span className="font-semibold text-gray-800 text-sm">{svc}</span>
                    <Link
                      href={`/services?subService=${encodeURIComponent(svc)}`}
                      className="shrink-0 bg-gma-navy text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gma-primary transition-colors flex items-center gap-1.5 uppercase tracking-wide"
                    >
                      Learn More
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Claim section — only for listings with no current owner */}
          {!hasOwner && !isOwner && (
            <ClaimSection
              providerId={provider.id}
              slug={provider.slug ?? slug}
              isLoggedIn={!!user}
              claimStatus={userClaimStatus as "none" | "pending" | "rejected"}
            />
          )}

        </div>
      </div>
    </div>
  );
}
