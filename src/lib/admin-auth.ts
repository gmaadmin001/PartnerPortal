import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name: string | null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();
  const { data: adminRow } = await service
    .from("admins")
    .select("id, email, name, role")
    .eq("email", user.email)
    .single();

  if (!adminRow) redirect("/login");

  return adminRow as AdminUser;
}
