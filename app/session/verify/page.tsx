import { redirect } from "next/navigation";

export default function SessionVerifyPage() {
  redirect("/api/auth/start?return_to=/");
}
