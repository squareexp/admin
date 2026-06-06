import { redirect } from "next/navigation";

export default function SessionNewPage() {
  redirect("/api/auth/start?return_to=/");
}
