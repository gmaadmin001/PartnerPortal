import { redirect } from "next/navigation";

export default function AdminClaimsLegacyPage() {
  redirect("/admin/pending/claims");
}
