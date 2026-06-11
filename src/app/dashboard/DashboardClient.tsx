"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  rating: number;
  body: string | null;
  reviewer_name: string | null;
  created_at: string;
}

interface CompletionField { label: string; done: boolean; }

export interface ServiceReg {
  id: string;
  slug: string;
  company_name: string | null;
  website_url: string | null;
  company_bio: string | null;
  logo_url: string | null;
  short_description: string | null;
  primary_category: string | null;
  sub_category: string | null;
  headquarters_city: string | null;
  headquarters_country: string | null;
  company_address: string | null;
  countries_served: string[] | null;
  states_served: string[] | null;
  industry_focus: string | null;
  service_scope: string | null;
  company_size: string | null;
  delivery_model: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  certifications: string | null;
  diversity_flags: string[] | null;
  core_services: string[] | null;
  photos: string[] | null;
  social_profiles: Record<string, string> | null;
  membership_plan: string | null;
  membership_billing: string | null;
  status: string | null;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

export type Panel = "overview" | "profile" | "listing" | "plans" | "reviews" | "settings" | "edit";

interface Props {
  user: { id: string; email: string };
  reg: ServiceReg | null;
  reviews: Review[];
  avgRating: number;
  completionFields: CompletionField[];
  completionPct: number;
  initialPanel: Panel;
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`${cls} ${i < rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-gma-surface">
        <h3 className="font-display font-bold text-gray-700 text-sm tracking-wide">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="w-44 shrink-0 text-xs font-bold text-gray-400 uppercase tracking-wider pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value || <span className="text-gray-300 italic">Not set</span>}</span>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gma-navy font-display leading-none mb-1">{value}</p>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Sidebar icons ──────────────────────────────────────────────────────────────

const OverviewIcon  = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ProfileIcon   = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>;
const ListingIcon   = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PlansIcon     = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const ReviewsIcon   = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const SettingsIcon  = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SignOutIcon   = () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

// ── Panel: Overview ───────────────────────────────────────────────────────────

function OverviewPanel({ reg, reviews, avgRating, completionFields, completionPct, setActive }: {
  reg: ServiceReg | null; reviews: Review[]; avgRating: number;
  completionFields: CompletionField[]; completionPct: number;
  setActive: (p: Panel) => void;
}) {
  const plan = reg?.membership_plan ?? "Basic";
  const planBadge: Record<string, string> = {
    Basic:        "bg-gray-100 text-gray-600 border-gray-200",
    Professional: "bg-gma-blue-pale text-gma-primary border-gma-primary/30",
    Premier:      "bg-amber-50 text-amber-700 border-amber-300",
  };

  const quickActions = [
    { icon: "✏️", label: "Edit Company Profile",  desc: "Update your business info",      action: () => setActive("profile"),  href: null },
    { icon: "👁️", label: "View Public Listing",    desc: "See how partners find you",      action: null, href: reg ? `/services/${reg.slug}` : null },
    { icon: "👑", label: "Upgrade Plan",           desc: "Unlock more features",           action: () => setActive("plans"),    href: null },
    { icon: "⭐", label: "Manage Reviews",         desc: "See client feedback",            action: () => setActive("reviews"),  href: null },
    { icon: "📋", label: "Update Listing",         desc: "Edit service categories",        action: () => setActive("listing"),  href: null },
    { icon: "⚙️", label: "Account Settings",      desc: "Password & preferences",        action: () => setActive("settings"), href: null },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gma-navy rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-gma-blue-light text-sm font-semibold mb-1">Welcome back</p>
          <h2 className="font-display text-2xl font-bold text-white">
            {reg?.company_name ?? "Your Company"}
          </h2>
          <span className={`inline-block mt-2.5 text-xs font-bold px-3 py-1 rounded-full border ${planBadge[plan] ?? planBadge.Basic}`}>
            {plan} Plan
          </span>
        </div>
        {reg?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={reg.logo_url} alt="logo" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gma-primary border-2 border-white/20 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-2xl font-display">
              {(reg?.company_name ?? "?").charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Listing Status"
          value={reg?.status ? (reg.status.charAt(0).toUpperCase() + reg.status.slice(1)) : "None"}
          sub={reg ? "Live on directory" : "Not yet registered"}
          color={reg?.status === "active" ? "bg-green-500" : "bg-yellow-400"}
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Current Plan"
          value={plan}
          sub={reg?.membership_billing ? `Billed ${reg.membership_billing}` : "Free tier"}
          color="bg-gma-primary"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
        />
        <StatCard
          label="Client Reviews"
          value={reviews.length}
          sub={reviews.length > 0 ? `${avgRating}.0 avg rating` : "No reviews yet"}
          color="bg-amber-400"
          icon={<svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
        />
        <StatCard
          label="Profile Complete"
          value={`${completionPct}%`}
          sub={completionPct === 100 ? "Fully complete!" : `${completionFields.filter((f) => !f.done).length} items remaining`}
          color="bg-gma-blue-mid"
          icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
      </div>

      {/* Profile completion + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Profile Completion">
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Overall completeness</span>
              <span className="font-bold text-gma-primary">{completionPct}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gma-primary rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {completionFields.map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                {done ? (
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  </svg>
                )}
                <span className={done ? "text-gray-700" : "text-gray-400"}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon, label, desc, action, href }) => {
              const cls = "flex flex-col gap-1.5 p-4 rounded-xl border border-gray-200 bg-gma-surface hover:border-gma-primary hover:bg-gma-blue-pale/30 transition-all text-left";
              const inner = (
                <>
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="text-sm font-bold text-gma-navy">{label}</span>
                  <span className="text-xs text-gray-400">{desc}</span>
                </>
              );
              if (href) return (
                <Link key={label} href={href} target="_blank" className={cls}>{inner}</Link>
              );
              if (action) return (
                <button key={label} onClick={action} className={cls}>{inner}</button>
              );
              return (
                <div key={label} className={cls + " opacity-40 cursor-default"}>{inner}</div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* No listing CTA */}
      {!reg && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <h4 className="font-bold text-amber-800 mb-1">No listing found</h4>
            <p className="text-sm text-amber-700 mb-4">
              You haven&apos;t created a service listing yet. Get listed to start receiving inquiries from global mobility professionals.
            </p>
            <Link href="/add-service" className="bg-gma-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gma-primary transition-colors">
              Create Your Listing →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Panel: Company Profile ────────────────────────────────────────────────────

function ProfilePanel({ reg, setActive }: { reg: ServiceReg | null; setActive: (p: Panel) => void }) {
  if (!reg) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">No profile data found. Create your listing first.</p>
      <Link href="/add-service" className="bg-gma-navy text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-gma-primary transition-colors">
        Get Started
      </Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Your public-facing company information shown in the services directory.</p>
        <button onClick={() => setActive("edit")} className="flex items-center gap-2 bg-gma-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gma-primary transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Business Identity">
          <FieldRow label="Company Name"    value={reg.company_name} />
          <FieldRow label="Website"         value={reg.website_url} />
          <FieldRow label="Short Statement" value={reg.short_description} />
          <FieldRow label="Company Bio"     value={reg.company_bio} />
        </Section>

        <Section title="Contact Details">
          <FieldRow label="Contact Name"  value={reg.primary_contact_name} />
          <FieldRow label="Email"         value={reg.primary_contact_email} />
          <FieldRow label="Phone"         value={reg.primary_contact_phone} />
          <FieldRow label="Address"       value={reg.company_address} />
        </Section>

        <Section title="Service Classification">
          <FieldRow label="Primary Category" value={reg.primary_category} />
          <FieldRow label="Sub-Category"     value={reg.sub_category} />
          <FieldRow label="Industry Focus"   value={reg.industry_focus} />
          <FieldRow label="Service Scope"    value={reg.service_scope} />
          <FieldRow label="Delivery Model"   value={reg.delivery_model} />
          <FieldRow label="Company Size"     value={reg.company_size} />
        </Section>

        <Section title="Geographic Coverage">
          <FieldRow label="HQ City"          value={reg.headquarters_city} />
          <FieldRow label="HQ Country"       value={reg.headquarters_country} />
          <FieldRow label="Countries Served" value={reg.countries_served?.join(", ")} />
          <FieldRow label="States Served"    value={reg.states_served?.join(", ")} />
        </Section>

        <Section title="Credentials & Compliance">
          <FieldRow label="Certifications"  value={reg.certifications} />
          <FieldRow label="Diversity Flags" value={reg.diversity_flags?.join(", ")} />
          <FieldRow label="Verified Badge"  value={reg.is_verified ? "✓ Verified" : "Not verified"} />
        </Section>

        <Section title="Membership">
          <FieldRow label="Plan"         value={reg.membership_plan} />
          <FieldRow label="Billing"      value={reg.membership_billing} />
          <FieldRow label="Status"       value={reg.status} />
          <FieldRow label="Listed Since" value={new Date(reg.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
        </Section>
      </div>
    </div>
  );
}

// ── Panel: My Listing ─────────────────────────────────────────────────────────

function ListingPanel({ reg, setActive }: { reg: ServiceReg | null; setActive: (p: Panel) => void }) {
  if (!reg) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">No listing found.</p>
      <Link href="/add-service" className="bg-gma-navy text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-gma-primary transition-colors">
        Create Your Listing
      </Link>
    </div>
  );

  const coreServices = (reg.core_services ?? []) as string[];
  const statusBadge = reg.status === "active"
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-yellow-50 text-yellow-700 border-yellow-200";

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {reg.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reg.logo_url} alt="logo" className="w-14 h-14 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gma-navy flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl font-display">{(reg.company_name ?? "?").charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-display text-lg font-bold text-gma-navy">{reg.company_name}</h3>
            {reg.short_description && <p className="text-sm text-gray-500 mt-1 max-w-md">{reg.short_description}</p>}
            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${statusBadge} capitalize`}>
              {reg.status ?? "Pending"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/services/${reg.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gma-primary text-gma-primary text-sm font-semibold hover:bg-gma-blue-pale transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Link>
          <button
            onClick={() => setActive("edit")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gma-navy text-white text-sm font-semibold hover:bg-gma-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Listing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section title="Service Categories">
          <div className="space-y-4">
            {reg.primary_category && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary</p>
                <span className="bg-gma-navy text-white text-sm font-semibold px-3 py-1.5 rounded-lg">{reg.primary_category}</span>
              </div>
            )}
            {reg.sub_category && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sub-category</p>
                <span className="bg-gma-blue-pale text-gma-navy text-sm font-semibold px-3 py-1.5 rounded-lg">{reg.sub_category}</span>
              </div>
            )}
            {coreServices.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Core Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {coreServices.map((s) => (
                    <span key={s} className="bg-gma-surface border border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Geographic Coverage">
          <div className="space-y-4">
            {(reg.countries_served?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Countries</p>
                <div className="flex flex-wrap gap-1.5">
                  {(reg.countries_served ?? []).map((c) => (
                    <span key={c} className="bg-gma-surface border border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {(reg.states_served?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">US States</p>
                <div className="flex flex-wrap gap-1.5">
                  {(reg.states_served ?? []).map((s) => (
                    <span key={s} className="bg-gma-surface border border-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Operations">
          <FieldRow label="Delivery Model" value={reg.delivery_model} />
          <FieldRow label="Service Scope"  value={reg.service_scope} />
          <FieldRow label="Industry Focus" value={reg.industry_focus} />
          <FieldRow label="Company Size"   value={reg.company_size} />
        </Section>

        <Section title="Credentials">
          <FieldRow label="Certifications"    value={reg.certifications} />
          <FieldRow label="Verified Badge"    value={reg.is_verified ? "✓ Verified" : "Not verified"} />
          <FieldRow label="Featured Listing"  value={reg.is_featured ? "✓ Active" : "Not featured"} />
          {(reg.diversity_flags?.length ?? 0) > 0 && (
            <div className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
              <span className="w-44 shrink-0 text-xs font-bold text-gray-400 uppercase tracking-wider pt-0.5">Diversity Flags</span>
              <div className="flex flex-wrap gap-1.5">
                {(reg.diversity_flags ?? []).map((f) => (
                  <span key={f} className="bg-gma-blue-pale text-gma-navy text-xs font-semibold px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

// ── Edit panel shared data (mirrors registration form options exactly) ────────

const CATEGORY_MAP: Record<string, string[]> = {
  "Getting Established at the Destination": [
    "Destination Services Providers (DSPs)",
    "School Search & Education Consultants",
  ],
  "Health, Safety & Security": [
    "International Health Insurance",
    "Travel Health & Medical Services",
    "Travel Risk & Security Services",
  ],
  "Housing & Accommodation": [
    "Corporate Housing / Temporary Accommodations",
    "Furniture & Appliance Rental",
    "Home Sale Program Administrators",
    "Property Management Services",
    "Real Estate Brokers & Agents",
    "Title, Appraisal & Closing Services",
  ],
  "Immigration & Work Authorization": [
    "Corporate Immigration Service Providers",
    "Document & Credential Services",
    "Immigration Law Firms",
  ],
  "Moving Belongings": [
    "Freight Forwarders",
    "Household Goods Movers",
    "Pet Relocation Specialists",
    "Vehicle Transport Specialists",
  ],
  "Program Management & Outsourcing": [
    "Lump Sum / Flex Program Administrators",
    "Move Coordination Specialists",
    "Relocation Management Companies (RMCs)",
  ],
  "Strategy, Policy & Advisory": [
    "Benchmarking & Data Service",
    "Mobility Consulting Firms",
  ],
  "Supporting Employees & Families": [
    "Executive Coaching",
    "Intercultural & Cross-Cultural Training",
    "Language Training Providers",
    "Mental Health & Wellbeing Services",
    "Spouse & Partner Career Services",
  ],
  "Tax, Payroll & Compensation": [
    "Compensation & Benefits Consulting",
    "Employer of Record / PEO Services",
    "Expatriate Tax Services",
    "Global Payroll Providers",
  ],
  "Technology & Data": [
    "Compliance & Tracking Tools",
    "Cost of Living & Hardship Data",
    "Expense Management Software",
    "Immigration Technology",
    "Mobility Management Platforms",
    "Tax Technology Platforms",
  ],
};

const DELIVERY_MODEL_OPTIONS = ["Direct", "Aggregator", "Mixed", "Franchise", "Unknown"];
const COMPANY_SIZE_OPTIONS   = ["1–50", "51–500", "500+"];

// ── Panel: Edit Profile ───────────────────────────────────────────────────────
// These constants and EditField are defined at module level so React gets a
// stable function reference across re-renders — prevents focus loss on every keystroke.

const EDIT_INPUT_CLS    = "w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-gma-primary transition-colors";
const EDIT_TEXTAREA_CLS = EDIT_INPUT_CLS + " resize-none";
const EDIT_LABEL_CLS    = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5";

function EditField({ label, value, onChange, placeholder, textarea }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className={EDIT_LABEL_CLS}>{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={EDIT_TEXTAREA_CLS}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={EDIT_INPUT_CLS}
        />
      )}
    </div>
  );
}

function EditSelect({ label, value, onChange, options, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className={EDIT_LABEL_CLS}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={EDIT_INPUT_CLS}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function LogoUpload({ userId, value, onChange }: {
  userId: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    setUploading(false);
    if (upErr) { setUploadError(upErr.message); return; }
    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    onChange(data.publicUrl);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className={EDIT_LABEL_CLS}>Company Logo</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
              aria-label="Remove logo"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 shrink-0 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm font-bold px-4 py-2 rounded-xl border border-gma-primary text-gma-primary hover:bg-gma-blue-pale transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : value ? "Change Logo" : "Upload Logo"}
          </button>
          <span className="text-xs text-gray-400">JPEG, PNG, WebP · max 2 MB</span>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={handleFile} />
      </div>
      {uploadError && <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>}
    </div>
  );
}

function LockedField({ label, plan, textarea }: {
  label: string;
  plan: "Professional" | "Premier";
  textarea?: boolean;
}) {
  const [tip, setTip] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        <div className="relative" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
          <svg className="w-3.5 h-3.5 text-amber-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {tip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gma-navy text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 pointer-events-none">
              Upgrade to <span className="font-bold">{plan}</span> to unlock this field
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gma-navy" />
            </div>
          )}
        </div>
      </div>
      {textarea ? (
        <textarea
          disabled
          rows={3}
          placeholder={`Available on ${plan} plan`}
          className={EDIT_TEXTAREA_CLS + " opacity-50 bg-gray-50 cursor-not-allowed"}
        />
      ) : (
        <input
          disabled
          type="text"
          placeholder={`Available on ${plan} plan`}
          className={EDIT_INPUT_CLS + " opacity-50 bg-gray-50 cursor-not-allowed"}
        />
      )}
    </div>
  );
}

function EditProfilePanel({ reg, userId, setActive, onSaved }: {
  reg: ServiceReg;
  userId: string;
  setActive: (p: Panel) => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState<string[]>(reg.photos ?? []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const [form, setForm] = useState({
    company_name:          reg.company_name          ?? "",
    website_url:           reg.website_url           ?? "",
    short_description:     reg.short_description     ?? "",
    company_bio:           reg.company_bio           ?? "",
    logo_url:              reg.logo_url              ?? "",
    primary_contact_name:  reg.primary_contact_name  ?? "",
    primary_contact_email: reg.primary_contact_email ?? "",
    primary_contact_phone: reg.primary_contact_phone ?? "",
    company_address:       reg.company_address       ?? "",
    headquarters_city:     reg.headquarters_city     ?? "",
    headquarters_country:  reg.headquarters_country  ?? "",
    countries_served:      (reg.countries_served     ?? []).join(", "),
    states_served:         (reg.states_served        ?? []).join(", "),
    primary_category:      reg.primary_category      ?? "",
    sub_category:          reg.sub_category          ?? "",
    industry_focus:        reg.industry_focus        ?? "",
    service_scope:         reg.service_scope         ?? "",
    delivery_model:        reg.delivery_model        ?? "",
    company_size:          reg.company_size          ?? "",
    certifications:        reg.certifications        ?? "",
    diversity_flags:       (reg.diversity_flags      ?? []).join(", "),
    core_services:         (reg.core_services        ?? []).join(", "),
    social_linkedin:       reg.social_profiles?.linkedin ?? "",
    social_discord:        reg.social_profiles?.discord  ?? "",
  });

  const subCategoryOptions = form.primary_category ? (CATEGORY_MAP[form.primary_category] ?? []) : [];

  function set(key: keyof typeof form, value: string) {
    if (key === "primary_category") {
      setForm((f) => ({ ...f, primary_category: value, sub_category: "" }));
    } else {
      setForm((f) => ({ ...f, [key]: value }));
    }
  }

  const PLAN_RANK: Record<string, number> = { Basic: 0, Professional: 1, Premier: 2 };
  const planRank = PLAN_RANK[reg.membership_plan ?? "Basic"] ?? 0;
  const isPro    = planRank >= 1;
  const isPremier = planRank >= 2;

  function splitTrim(s: string): string[] {
    return s.split(",").map((v) => v.trim()).filter(Boolean);
  }

  function addPhoto() {
    const url = newPhotoUrl.trim();
    if (!url) return;
    setPhotos((p) => [...p, url]);
    setNewPhotoUrl("");
  }

  function removePhoto(idx: number) {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("service_registrations")
      .update({
        company_name:          form.company_name          || null,
        website_url:           form.website_url           || null,
        short_description:     form.short_description     || null,
        company_bio:           form.company_bio           || null,
        logo_url:              form.logo_url              || null,
        primary_contact_name:  form.primary_contact_name  || null,
        primary_contact_email: form.primary_contact_email || null,
        primary_contact_phone: form.primary_contact_phone || null,
        company_address:       form.company_address       || null,
        headquarters_city:     form.headquarters_city     || null,
        headquarters_country:  form.headquarters_country  || null,
        countries_served:      splitTrim(form.countries_served),
        states_served:         splitTrim(form.states_served),
        primary_category:      form.primary_category      || null,
        sub_category:          form.sub_category          || null,
        industry_focus:        form.industry_focus        || null,
        service_scope:         form.service_scope         || null,
        delivery_model:        form.delivery_model        || null,
        company_size:          form.company_size          || null,
        certifications:        form.certifications        || null,
        diversity_flags:       splitTrim(form.diversity_flags),
        core_services:         splitTrim(form.core_services),
        photos,
        social_profiles: {
          ...(form.social_linkedin ? { linkedin: form.social_linkedin } : {}),
          ...(form.social_discord  ? { discord:  form.social_discord  } : {}),
        },
      })
      .eq("user_id", userId);

    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSaved(true);
      onSaved();
      setTimeout(() => setActive("profile"), 800);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActive("profile")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gma-navy transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </button>
        <p className="text-sm text-gray-400">·</p>
        <p className="text-sm text-gray-500">Changes are saved directly to your public listing.</p>
      </div>

      {saveError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}

      {/* Business Identity */}
      <Section title="Business Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditField label="Company Name" value={form.company_name} onChange={(v) => set("company_name", v)} placeholder="Acme Relocation Co." />
          <EditField label="Website URL"  value={form.website_url}  onChange={(v) => set("website_url", v)}  placeholder="https://yoursite.com" />
          {isPro
            ? <LogoUpload userId={userId} value={form.logo_url} onChange={(url) => set("logo_url", url)} />
            : <LockedField label="Company Logo" plan="Professional" />
          }
        </div>
        <div className="mt-4">
          <EditField label="Short Statement (1–2 sentences shown on listing card)" value={form.short_description} onChange={(v) => set("short_description", v)} placeholder="We help companies move employees globally..." textarea />
        </div>
        <div className="mt-4">
          {isPro
            ? <EditField label="Company Bio (full description shown on profile page)" value={form.company_bio} onChange={(v) => set("company_bio", v)} placeholder="Founded in..." textarea />
            : <LockedField label="Company Bio (full description shown on profile page)" plan="Professional" textarea />
          }
        </div>
      </Section>

      {/* Contact Details */}
      <Section title="Contact Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditField label="Contact Name"     value={form.primary_contact_name}  onChange={(v) => set("primary_contact_name", v)}  placeholder="Jane Smith" />
          <EditField label="Contact Email"    value={form.primary_contact_email} onChange={(v) => set("primary_contact_email", v)} placeholder="jane@yourco.com" />
          <EditField label="Contact Phone"    value={form.primary_contact_phone} onChange={(v) => set("primary_contact_phone", v)} placeholder="+1 555-000-0000" />
          <EditField label="Company Address"  value={form.company_address}       onChange={(v) => set("company_address", v)}       placeholder="123 Main St, City, State" />
        </div>
      </Section>

      {/* Geographic Coverage */}
      <Section title="Geographic Coverage">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditField label="HQ City"    value={form.headquarters_city}    onChange={(v) => set("headquarters_city", v)}    placeholder="New York" />
          <EditField label="HQ Country" value={form.headquarters_country} onChange={(v) => set("headquarters_country", v)} placeholder="United States" />
          <EditField label="Countries Served (comma-separated)" value={form.countries_served} onChange={(v) => set("countries_served", v)} placeholder="United States, Canada, UK" />
          <EditField label="US States Served (comma-separated)" value={form.states_served}    onChange={(v) => set("states_served", v)}    placeholder="New York, California, Texas" />
        </div>
      </Section>

      {/* Service Classification */}
      <Section title="Service Classification">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditSelect
            label="Primary Category"
            value={form.primary_category}
            onChange={(v) => set("primary_category", v)}
            options={Object.keys(CATEGORY_MAP)}
            placeholder="Select Primary Category"
          />
          <EditSelect
            label="Sub Category"
            value={form.sub_category}
            onChange={(v) => set("sub_category", v)}
            options={subCategoryOptions}
            placeholder={form.primary_category ? "Select Sub Category" : "Select primary first"}
          />
          <EditSelect label="Delivery Model" value={form.delivery_model} onChange={(v) => set("delivery_model", v)} options={DELIVERY_MODEL_OPTIONS} />
          <EditSelect label="Company Size"   value={form.company_size}   onChange={(v) => set("company_size", v)}   options={COMPANY_SIZE_OPTIONS} />
          <EditField  label="Industry Focus" value={form.industry_focus}  onChange={(v) => set("industry_focus", v)}  placeholder="Technology, Finance..." />
          <EditField  label="Service Scope"  value={form.service_scope}   onChange={(v) => set("service_scope", v)}   placeholder="Global, Regional, National..." />
        </div>
        <div className="mt-4">
          {isPremier
            ? <EditField label="Core Services (comma-separated)" value={form.core_services} onChange={(v) => set("core_services", v)} placeholder="Immigration, Tax Advisory, Destination Services" />
            : <LockedField label="Core Services (comma-separated)" plan="Premier" />
          }
        </div>
      </Section>

      {/* Credentials */}
      <Section title="Credentials & Compliance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditField label="Certifications (comma-separated)"  value={form.certifications}  onChange={(v) => set("certifications", v)}  placeholder="ISO 9001, GMS-T, SHRM" />
          <EditField label="Diversity Flags (comma-separated)" value={form.diversity_flags} onChange={(v) => set("diversity_flags", v)} placeholder="Minority-owned, Woman-owned" />
        </div>
      </Section>

      {/* Photo Gallery */}
      <Section title="Photo Gallery">
        {isPremier ? (
          <>
            <p className="text-xs text-gray-400 mb-4">Photos appear in the carousel on your public profile page. Paste a direct image URL and click Add.</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto())}
                placeholder="https://example.com/photo.jpg"
                className={EDIT_INPUT_CLS}
              />
              <button
                onClick={addPhoto}
                disabled={!newPhotoUrl.trim()}
                className="shrink-0 bg-gma-navy text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-gma-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p className="text-sm font-bold text-gma-navy">Available on Premier</p>
            <p className="text-xs text-gray-400">Upgrade your plan to add a photo gallery to your profile.</p>
          </div>
        )}
      </Section>

      {/* Social */}
      <Section title="Social Profiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditField label="LinkedIn URL" value={form.social_linkedin} onChange={(v) => set("social_linkedin", v)} placeholder="https://linkedin.com/company/..." />
          <EditField label="Discord URL"  value={form.social_discord}  onChange={(v) => set("social_discord", v)}  placeholder="https://discord.gg/..." />
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="bg-gma-navy text-white text-sm font-bold px-8 py-3 rounded-xl hover:bg-gma-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saved ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          onClick={() => setActive("profile")}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Panel: Membership Plans ───────────────────────────────────────────────────

const PLANS = [
  {
    name: "Basic",
    monthlyPrice: null as number | null,
    annualPrice: null as number | null,
    annualSavings: null as number | null,
    subtitle: "Get listed in the directory:",
    features: [
      "Company Name & Website URL",
      "1 Service Category",
      "Service Area: HQ City & State only",
      "Standard search placement",
    ],
  },
  {
    name: "Professional",
    monthlyPrice: 25,
    annualPrice: 250,
    annualSavings: 50,
    subtitle: "Everything in Basic, plus:",
    features: [
      "Company Description & Logo",
      "Contact Details",
      "Up to 3 Service Categories",
      "Service Area: Up to 3 cities/states/countries",
      "Self-service profile editing",
      "Auto-renewal subscription",
      "Verified Badge available (+$100 one-time)",
    ],
  },
  {
    name: "Premier",
    monthlyPrice: 50,
    annualPrice: 500,
    annualSavings: 100,
    subtitle: "Everything in Professional, plus:",
    features: [
      "Unlimited Service Categories",
      "Unlimited service areas",
      "Verified Badge — Included",
      "Star Ratings & Reviews",
      "Preferred Search Placement*",
      "Content / Thought Leadership Posting",
      "Media Gallery (photos & documents)",
    ],
  },
];

function PlansPanel({ currentPlan }: { currentPlan: string | null }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const PLAN_ORDER = ["Basic", "Professional", "Premier"];
  const active = PLAN_ORDER.find(n => (currentPlan ?? "").startsWith(n)) ?? "Basic";
  const activeIdx = PLAN_ORDER.indexOf(active);

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-semibold ${billing === "monthly" ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
        <button
          onClick={() => setBilling((b) => b === "monthly" ? "annual" : "monthly")}
          className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${billing === "annual" ? "bg-gma-primary" : "bg-gray-300"}`}
          aria-label="Toggle billing"
        >
          <span className={`inline-block mt-0.5 ml-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${billing === "annual" ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <span className={`text-sm font-semibold ${billing === "annual" ? "text-gray-900" : "text-gray-400"}`}>Annual</span>
        {billing === "annual" && (
          <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">2 months free</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = plan.name === active;
          const isPremier = plan.name === "Premier";
          const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const planIdx = PLAN_ORDER.indexOf(plan.name);
          const ctaVerb = planIdx < activeIdx ? "Downgrade to" : "Upgrade to";

          return (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border-2 overflow-hidden transition-all ${
                isCurrent
                  ? "border-gma-primary shadow-lg shadow-gma-primary/10"
                  : isPremier
                  ? "border-amber-300"
                  : "border-gray-200"
              }`}
            >
              {isCurrent ? (
                <div className="bg-gma-primary text-white text-xs font-bold text-center py-1.5 tracking-widest">✓ CURRENT PLAN</div>
              ) : isPremier ? (
                <div className="bg-amber-400 text-white text-xs font-bold text-center py-1.5 tracking-widest">⭐ RECOMMENDED</div>
              ) : (
                <div className="py-1.5" />
              )}

              <div className="px-6 pt-5 pb-4 text-center border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">{plan.name}</h3>
                {price === null ? (
                  <p className="text-3xl font-light text-gray-900">Free</p>
                ) : (
                  <>
                    <p className="text-3xl font-light text-gray-900">
                      ${price}<span className="text-base text-gray-400 font-normal">/{billing === "annual" ? "yr" : "mo"}</span>
                    </p>
                    {billing === "annual" && plan.annualSavings && (
                      <p className="text-xs text-green-600 font-medium mt-1">Save ${plan.annualSavings}</p>
                    )}
                  </>
                )}
              </div>

              <div className="px-6 py-4 flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{plan.subtitle}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-gma-primary mt-0.5 shrink-0 font-bold">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-6 pb-6 pt-2">
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl bg-gma-surface text-gma-primary border border-gma-primary text-sm font-bold text-center">
                    Current Plan
                  </div>
                ) : (
                  <a
                    href="mailto:info@globalmobilityadviser.com?subject=Plan Change Request"
                    className="block w-full py-2.5 rounded-xl bg-gma-primary text-white text-sm font-bold text-center uppercase tracking-widest hover:bg-gma-navy transition-colors"
                  >
                    {ctaVerb} {plan.name}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 text-center">
        * Preferred placement is a tiebreaker only — relevance always takes precedence.{" "}
        To change your plan, email{" "}
        <a href="mailto:info@globalmobilityadviser.com" className="text-gma-primary hover:underline">
          info@globalmobilityadviser.com
        </a>
      </p>
    </div>
  );
}

// ── Panel: Client Reviews ─────────────────────────────────────────────────────

function ReviewsPanel({ reviews, avgRating, reg }: { reviews: Review[]; avgRating: number; reg: ServiceReg | null }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    if (!reg) return;
    navigator.clipboard.writeText(`${window.location.origin}/services/${reg.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-5xl font-bold text-gma-navy leading-none">
              {reviews.length > 0 ? avgRating : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">out of 5</p>
          </div>
          <div>
            <Stars rating={avgRating} size="lg" />
            <p className="text-sm text-gray-500 mt-2">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {reg && (
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gma-primary text-gma-primary text-sm font-semibold hover:bg-gma-blue-pale transition-colors shrink-0"
          >
            {copied ? "✓ Copied!" : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Profile
              </>
            )}
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="font-display text-lg font-bold text-gma-navy mb-2">No reviews yet</h3>
          <p className="text-gray-500 text-sm mb-5">Share your profile link with clients to start collecting reviews.</p>
          {reg && (
            <button onClick={copyLink} className="bg-gma-navy text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gma-primary transition-colors">
              Copy Profile Link
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gma-blue-pale flex items-center justify-center shrink-0">
                    <span className="text-gma-navy font-bold text-sm">{(r.reviewer_name ?? "A").charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{r.reviewer_name ?? "Anonymous"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <Stars rating={r.rating} />
              </div>
              {r.body && <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Panel: Settings ───────────────────────────────────────────────────────────

function SettingsPanel({ email, signOut }: { email: string; signOut: () => void }) {
  const [resetSent, setResetSent]   = useState(false);
  const [resetting, setResetting]   = useState(false);

  async function sendReset() {
    setResetting(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetSent(true);
    setResetting(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Section title="Account Information">
        <FieldRow label="Email Address" value={email} />
        <p className="text-xs text-gray-400 mt-3">
          To update your email address, please contact{" "}
          <a href="mailto:info@globalmobilityadviser.com" className="text-gma-primary hover:underline">support</a>.
        </p>
      </Section>

      <Section title="Security">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Password</p>
            <p className="text-xs text-gray-400 mt-0.5">Send a reset link to your registered email</p>
          </div>
          <button
            onClick={sendReset}
            disabled={resetting || resetSent}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gma-navy text-white text-sm font-semibold hover:bg-gma-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resetSent ? "✓ Email Sent" : resetting ? "Sending…" : "Reset Password"}
          </button>
        </div>
        {resetSent && (
          <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Password reset email sent to <strong>{email}</strong>. Check your inbox.
          </div>
        )}
      </Section>

      <Section title="Notification Preferences">
        <div className="space-y-4">
          {[
            { label: "New inquiry received",  desc: "Get notified when someone contacts you",    on: true },
            { label: "New review posted",     desc: "Get notified when a client leaves a review", on: true },
            { label: "Plan renewal reminder", desc: "Reminder 7 days before billing date",        on: true },
          ].map(({ label, desc, on }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative cursor-not-allowed opacity-50 ${on ? "bg-gma-primary" : "bg-gray-300"}`}
                title="Email notification preferences coming soon"
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 pt-1">Email notification management coming soon.</p>
        </div>
      </Section>

      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 border-b border-red-100 bg-red-50">
          <h3 className="font-display font-bold text-red-700 text-sm tracking-wide">Danger Zone</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Sign Out</p>
              <p className="text-xs text-gray-400 mt-0.5">End your current session on this device</p>
            </div>
            <button
              onClick={signOut}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Panel; label: string; Icon: () => React.ReactElement }[] = [
  { id: "overview",  label: "Overview",          Icon: OverviewIcon  },
  { id: "profile",   label: "Company Profile",   Icon: ProfileIcon   },
  { id: "listing",   label: "My Listing",        Icon: ListingIcon   },
  { id: "plans",     label: "Membership Plans",  Icon: PlansIcon     },
  { id: "reviews",   label: "Client Reviews",    Icon: ReviewsIcon   },
  { id: "settings",  label: "Settings",          Icon: SettingsIcon  },
];

export default function DashboardClient({
  user, reg, reviews, avgRating, completionFields, completionPct, initialPanel,
}: Props) {
  const [active, setActive] = useState<Panel>(initialPanel);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/register");
  }

  const initials   = (reg?.company_name ?? user.email).charAt(0).toUpperCase();
  const companyName = reg?.company_name ?? user.email.split("@")[0];
  const activeLabel = NAV_ITEMS.find((n) => n.id === active)?.label ?? "Dashboard";

  return (
    <div className="flex min-h-[calc(100vh-100px)]">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-gma-navy sticky top-25 h-[calc(100vh-100px)] overflow-y-auto flex flex-col">

        {/* Company identity */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            {reg?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={reg.logo_url} alt={companyName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gma-primary flex items-center justify-center shrink-0">
                <span className="text-white font-bold font-display">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{companyName}</p>
              {reg?.membership_plan && (
                <p className="text-gma-blue-light text-xs">{reg.membership_plan} Plan</p>
              )}
            </div>
          </div>
          {reg && (
            <Link
              href={`/services/${reg.slug}`}
              target="_blank"
              className="text-xs text-gma-blue-light hover:text-white transition-colors flex items-center gap-1 mt-1"
            >
              Preview Page
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${
                active === id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="w-4 h-4 shrink-0"><Icon /></span>
              {label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-5">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <span className="w-4 h-4 shrink-0"><SignOutIcon /></span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Page header */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-gma-navy flex items-center justify-center shrink-0">
            <span className="text-white font-bold font-display text-sm">{initials}</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-gma-navy">{activeLabel}</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Panel */}
        <div className="flex-1 p-8">
          {active === "overview"  && <OverviewPanel reg={reg} reviews={reviews} avgRating={avgRating} completionFields={completionFields} completionPct={completionPct} setActive={setActive} />}
          {active === "profile"   && <ProfilePanel reg={reg} setActive={setActive} />}
          {active === "listing"   && <ListingPanel reg={reg} setActive={setActive} />}
          {active === "plans"     && <PlansPanel currentPlan={reg?.membership_plan ?? null} />}
          {active === "reviews"   && <ReviewsPanel reviews={reviews} avgRating={avgRating} reg={reg} />}
          {active === "settings"  && <SettingsPanel email={user.email} signOut={signOut} />}
          {active === "edit"      && reg && <EditProfilePanel reg={reg} userId={user.id} setActive={setActive} onSaved={() => router.refresh()} />}
          {active === "edit"      && !reg && (
            <div className="text-center py-20">
              <p className="text-gray-400">No listing found. <button onClick={() => setActive("overview")} className="text-gma-primary underline">Go to Overview</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
