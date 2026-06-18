import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import PhotoCarousel from "@/components/services/PhotoCarousel";
import ClaimSection from "@/components/services/ClaimSection";

// ── Icons ─────────────────────────────────────────────────────────────────────

const PhoneIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MailIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const GlobeIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>;
const PinIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ShareIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const ShieldIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const GearIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const InfoIcon = () => <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LockIcon = () => <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const ArrowIcon = () => <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>;

// ── Section card ──────────────────────────────────────────────────────────────

function SCard({
  icon, label, color = "#1C66AD", iconBg = "#eff6ff", children,
}: {
  icon: React.ReactNode; label: string; color?: string; iconBg?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dde3ee", borderTop: `3px solid ${color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>
          {icon}
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ── Locked placeholder ────────────────────────────────────────────────────────

function LockedField({ plan }: { plan: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#9ca3af", fontSize: 12.5 }}>
      <LockIcon />
      <span>Available on <strong style={{ color: "#1C66AD" }}>{plan}</strong> plan</span>
    </div>
  );
}

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

  const hasOwner = !!provider.user_id;

  const photos = Array.isArray(provider.photos) ? (provider.photos as string[]) : [];
  const certs = (provider.certifications ?? "").split(",").map((c: string) => c.trim()).filter(Boolean);
  const diversityFlags = (provider.diversity_flags ?? []) as string[];
  const coreServices = (provider.core_services ?? []) as string[];
  const countries = (provider.countries_served ?? []) as string[];
  const states = (provider.states_served ?? []) as string[];
  const serviceAreas = [...countries, ...states];
  const social = (provider.social_profiles ?? {}) as Record<string, string>;
  const PLAN_RANK: Record<string, number> = { Basic: 0, Professional: 1, Premier: 2 };
  const rank = PLAN_RANK[provider.membership_plan ?? "Basic"] ?? 0;
  const isPro = rank >= 1;
  const isPremier = rank >= 2;
  const websiteDisplay = (provider.website_url ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const initial = (provider.company_name ?? "?")[0].toUpperCase();

  return (
    <div style={{ background: "#eef1f8", minHeight: "100vh" }}>

      {/* ── Preview banner ──────────────────────────────────────────────────── */}
      {isOwner && provider.status !== "active" && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width="16" height="16" fill="none" stroke="#d97706" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            Preview mode — your listing is <span style={{ textTransform: "capitalize" }}>{provider.status}</span> and not yet visible to the public.
          </p>
          <Link href="/dashboard" style={{ fontSize: 12, fontWeight: 700, color: "#b45309", textDecoration: "underline" }}>
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0a1628 0%,#1E2E61 55%,#1C66AD 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* dot pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />
        {/* glow orbs */}
        <div style={{ position: "absolute", top: "-40%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(67,180,227,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "10%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(28,102,173,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 44px", position: "relative" }}>
          {/* Back link */}
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 28, transition: "color 0.15s" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to results
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
            {/* Logo / Avatar */}
            {isPro && provider.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.logo_url}
                alt={provider.company_name}
                style={{ width: 88, height: 88, borderRadius: 18, objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: 18, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                <span className="dsp" style={{ color: "#fff", fontWeight: 800, fontSize: 36, lineHeight: 1 }}>{initial}</span>
              </div>
            )}

            {/* Company info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {isPremier && provider.is_verified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(22,163,74,0.2)", border: "1px solid rgba(22,163,74,0.4)", color: "#86efac", borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    VERIFIED
                  </span>
                )}
                {isPremier && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.35)", color: "#fcd34d", borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 700 }}>
                    ⭐ RECOMMENDED
                  </span>
                )}
                {isPremier && provider.is_featured && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(67,180,227,0.2)", border: "1px solid rgba(67,180,227,0.35)", color: "#7dd3fc", borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 700 }}>
                    👍 BEST MATCH
                  </span>
                )}
              </div>

              <h1 className="dsp" style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 10, letterSpacing: "-0.01em" }}>
                {provider.company_name}
              </h1>

              {provider.short_description && (
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 16, maxWidth: 620 }}>
                  {provider.short_description}
                </p>
              )}

              {/* Meta chips */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                {provider.primary_category && (
                  <span style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "4px 13px", fontSize: 12, fontWeight: 600 }}>
                    {provider.primary_category}{provider.sub_category ? ` · ${provider.sub_category}` : ""}
                  </span>
                )}
                {(provider.headquarters_city || provider.headquarters_country) && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                    <PinIcon />
                    {[provider.headquarters_city, provider.headquarters_country].filter(Boolean).join(", ")}
                  </span>
                )}
                {provider.register_as && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.5)", fontSize: 12.5, textTransform: "capitalize" }}>
                    · {provider.register_as}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
              {provider.website_url && (
                <a
                  href={provider.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "#fff", color: "#1E2E61", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}
                >
                  <GlobeIcon />
                  Visit Website
                </a>
              )}
              <button
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                <ShareIcon />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 40px 60px", display: "flex", gap: 28, alignItems: "flex-start" }}>

        {/* ── Main column ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Company Bio */}
          {(isPro && provider.company_bio) && (
            <SCard icon={<InfoIcon />} label="About" color="#1C66AD" iconBg="#eff6ff">
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>{provider.company_bio}</p>
            </SCard>
          )}

          {/* Service Coverage */}
          {serviceAreas.length > 0 && (
            <SCard icon={<PinIcon />} label="Service Coverage" color="#ea580c" iconBg="#fff7ed">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {countries.length > 0 && (
                  <div style={{ width: "100%", marginBottom: 8 }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>Countries</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {countries.map(c => <span key={c} className="country-chip">{c}</span>)}
                    </div>
                  </div>
                )}
                {states.length > 0 && (
                  <div style={{ width: "100%" }}>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>States / Provinces</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {states.map(s => <span key={s} className="country-chip">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </SCard>
          )}

          {/* Service Details */}
          {(provider.register_as || provider.delivery_model || provider.company_size) && (
            <SCard icon={<InfoIcon />} label="Service Details" color="#7c3aed" iconBg="#f5f3ff">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {provider.register_as && (
                  <div>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Type</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1628", textTransform: "capitalize" }}>{provider.register_as}</p>
                  </div>
                )}
                {provider.delivery_model && (
                  <div>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Delivery</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1628", textTransform: "capitalize" }}>{provider.delivery_model}</p>
                  </div>
                )}
                {provider.company_size && (
                  <div>
                    <p style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Company Size</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1628" }}>{provider.company_size}</p>
                  </div>
                )}
              </div>
            </SCard>
          )}

          {/* Photo Gallery */}
          {isPremier && photos.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #dde3ee", borderTop: "3px solid #43B4E3", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#0891b2" }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>Photo Gallery</span>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <PhotoCarousel photos={photos} />
              </div>
            </div>
          )}

          {/* Core Services */}
          {isPremier && coreServices.length > 0 && (
            <SCard icon={<GearIcon />} label="Core Services" color="#16a34a" iconBg="#f0fdf4">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {coreServices.map((svc, idx) => (
                  <div key={svc} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: idx < coreServices.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#0a1628" }}>{svc}</span>
                    </div>
                    <Link
                      href={`/services?coreService=${encodeURIComponent(svc)}`}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "#1E2E61", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "6px 14px", borderRadius: 20, textDecoration: "none", flexShrink: 0, letterSpacing: "0.04em" }}
                    >
                      Find More <ArrowIcon />
                    </Link>
                  </div>
                ))}
              </div>
            </SCard>
          )}

          {/* Claim Section */}
          {!hasOwner && !isOwner && (
            <ClaimSection slug={provider.slug ?? slug} />
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 112, alignSelf: "flex-start" }}>

          {/* Contact Details — always show for Pro+; for Basic show only to owner */}
          {(isPro || isOwner) && <SCard icon={<PhoneIcon />} label="Contact Details" color="#1C66AD" iconBg="#eff6ff">
            {isPro ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {provider.primary_contact_phone ? (
                  <a href={`tel:${provider.primary_contact_phone}`} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "#374151", fontSize: 13.5 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1C66AD" }}><PhoneIcon /></span>
                    {provider.primary_contact_phone}
                  </a>
                ) : null}
                {provider.primary_contact_email ? (
                  <a href={`mailto:${provider.primary_contact_email}`} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "#374151", fontSize: 13.5, wordBreak: "break-all" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1C66AD" }}><MailIcon /></span>
                    {provider.primary_contact_email}
                  </a>
                ) : null}
                {provider.website_url ? (
                  <a href={provider.website_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "#1C66AD", fontSize: 13.5 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1C66AD" }}><GlobeIcon /></span>
                    {websiteDisplay || "Website"}
                  </a>
                ) : null}
                {!provider.primary_contact_phone && !provider.primary_contact_email && !provider.website_url && (
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>No contact info provided.</p>
                )}
              </div>
            ) : isOwner ? (
              <LockedField plan="Professional" />
            ) : null}
          </SCard>}

          {/* Quick Info */}
          <SCard icon={<InfoIcon />} label="Company Info" color="#7c3aed" iconBg="#f5f3ff">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Plan", value: provider.membership_plan ?? "Basic" },
                { label: "Type", value: provider.register_as, cap: true },
                { label: "Delivery", value: provider.delivery_model, cap: true },
                { label: "Size", value: provider.company_size },
              ].filter(r => r.value).map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f9fafb" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af" }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0a1628", textTransform: r.cap ? "capitalize" : "none" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </SCard>

          {/* Certifications + Diversity */}
          {(certs.length > 0 || diversityFlags.length > 0) ? (
            <SCard icon={<ShieldIcon />} label="Certifications & Diversity" color="#16a34a" iconBg="#f0fdf4">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {[...new Set([...certs, ...diversityFlags])].map(item => (
                  <span key={item} style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 11px", fontSize: 11.5, fontWeight: 600 }}>
                    {item}
                  </span>
                ))}
              </div>
            </SCard>
          ) : null}

          {/* Social Profiles */}
          {(social?.linkedin || social?.discord) && (
            <SCard icon={<ShareIcon />} label="Social Profiles" color="#0891b2" iconBg="#ecfeff">
              <div style={{ display: "flex", gap: 10 }}>
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #dde3ee", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", textDecoration: "none" }}
                    aria-label="LinkedIn">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {social.discord && (
                  <a href={social.discord} target="_blank" rel="noopener noreferrer"
                    style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid #dde3ee", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", textDecoration: "none" }}
                    aria-label="Discord">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057c.002.018.012.036.027.047a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                    </svg>
                  </a>
                )}
              </div>
            </SCard>
          )}

          {/* Upgrade prompt for Basic — owner only */}
          {!isPro && isOwner && (
            <div style={{ background: "linear-gradient(135deg,#1E2E61,#1C66AD)", borderRadius: 16, padding: "22px 20px", boxShadow: "0 4px 16px rgba(28,102,173,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LockIcon />
                </div>
                <span className="dsp" style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Unlock More</span>
              </div>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.55, marginBottom: 14 }}>
                Upgrade to Professional or Premier to show contact details, company bio, and more.
              </p>
              <Link href="/dashboard/plans" style={{ display: "block", textAlign: "center", background: "#fff", color: "#1E2E61", fontSize: 12.5, fontWeight: 800, padding: "9px 0", borderRadius: 9, textDecoration: "none" }}>
                View Plans →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
