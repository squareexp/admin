import { StaticDocumentPage } from "@/components/auth/PublicDocumentPage";

const GUIDE_CONTENT = `# Access Guide

## 1. First-time registration

1. Create your admin account with your work email.
2. Check your inbox for the 6-digit verification code.
3. Open the verification screen and confirm the code before signing in.

## 2. Signing in

- Use your verified email and password on the access page.
- If two-factor authentication is enabled on your account, you will be asked for a 6-digit authenticator code before the session opens.
- Session access is role-bound, so only approved admin roles can enter the operations workspace.

## 3. Password recovery

- Use the reset password screen if you lose access to your password.
- Reset links are time-bound and only sent to the registered inbox.
- Choose a strong password with uppercase, lowercase, and at least one number.

## 4. Enable two-factor authentication

- Sign in to the admin workspace.
- Open the Settings workspace and launch the 2FA setup workspace.
- Scan the QR code with your authenticator app.
- Enter the generated code to finish activation.

## 5. When you need help

- Check the Terms of Service for platform usage boundaries.
- Review the Privacy Policy for data handling expectations.
- Contact the Square Experience support team if you cannot access your inbox or authenticator device.

## 6. Security expectations

- Never share your password or authenticator code.
- Avoid reusing credentials across other services.
- Sign out on shared or unmanaged devices.
- Report suspicious login activity immediately.`;

export default function GuidePage() {
  return (
    <StaticDocumentPage
      eyebrow="Public Guide"
      title="Access & Security Guide"
      description="A quick public reference for registration, verification, password recovery, and two-factor authentication inside the Square Experience admin environment."
      content={GUIDE_CONTENT}
    />
  );
}
