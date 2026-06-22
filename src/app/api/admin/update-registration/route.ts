import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const EDITABLE_FIELDS = new Set([
  "company_name", "register_as", "membership_plan", "status", "is_verified", "is_featured",
  "primary_category", "sub_category", "delivery_model", "company_size",
  "headquarters_country", "headquarters_city", "primary_contact_name",
  "primary_contact_email", "primary_contact_phone", "short_description",
  "website_url",
]);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data: adminRow } = await service
    .from("admins")
    .select("role")
    .eq("email", user.email)
    .single();
  if (!adminRow) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (adminRow.role === "search") return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const body = await req.json();
  const { id, ...raw } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Whitelist editable fields
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (EDITABLE_FIELDS.has(k)) update[k] = v;
  }

  const { error } = await service
    .from("service_registrations")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
