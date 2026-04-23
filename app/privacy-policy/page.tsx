import { LegalDocumentPage } from "@/components/auth/PublicDocumentPage";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      type="privacy"
      eyebrow="Public Policy"
      title="Privacy Policy"
      description="Review how Square Experience collects, stores, protects, and manages personal data across public websites, dashboards, service delivery systems, and support channels."
    />
  );
}
