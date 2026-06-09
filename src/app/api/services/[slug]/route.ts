import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: provider, error } = await supabase
    .from("service_registrations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !provider) {
    return NextResponse.json({ error: "Provider not found." }, { status: 404 });
  }

  const { data: reviews } = await supabase
    .from("provider_reviews")
    .select("id, rating, body, reviewer_name, created_at")
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ data: { ...provider, reviews: reviews ?? [] } });
}
