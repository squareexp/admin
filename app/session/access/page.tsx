import { redirect } from "next/navigation";
import { sanitizeReturnTo } from "@/lib/auth/shared";

export default async function SessionAccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ return_to?: string }>;
}) {
  const resolvedParams = await searchParams;
  const returnTo = sanitizeReturnTo(resolvedParams?.return_to);
  redirect(`/api/auth/login?return_to=${encodeURIComponent(returnTo)}`);
}
