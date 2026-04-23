import { LegalDocumentPage } from "@/components/auth/PublicDocumentPage";

export const dynamic = "force-dynamic";

export default async function TermsOfServicePage() {
  return (
    <LegalDocumentPage
      type="terms"
      eyebrow="Public Terms"
      title="Terms of Service"
      description="Read the governing service terms for Square Experience platforms, commercial engagements, usage boundaries, liability allocation, billing expectations, and support obligations."
    />
  );
}
