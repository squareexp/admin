import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { DocumentRenderer } from "@/components/auth/DocumentRenderer";
import { API_URL } from "@/lib/config";

async function fetchLegalContent(type: "privacy" | "terms") {
  const response = await fetch(`${API_URL}/api/company/legal/${type}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${type} document`);
  }

  const data = (await response.json()) as { content?: string };
  return data.content || "Document unavailable.";
}

export async function LegalDocumentPage({
  type,
  eyebrow,
  title,
  description,
}: {
  type: "privacy" | "terms";
  eyebrow: string;
  title: string;
  description: string;
}) {
  const content = await fetchLegalContent(type);

  return (
    <AuthShell layout="single" containerClassName="max-w-6xl" panelClassName="max-w-6xl">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/75">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/42">
            <Link href="/session/access" className="transition-colors hover:text-sq-brand-action">
              Sign in
            </Link>
            <span className="text-white/18">/</span>
            <Link href="/guide" className="transition-colors hover:text-sq-brand-action">
              Guide
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 sm:p-8 lg:p-10">
          <DocumentRenderer content={content} />
        </div>
      </div>
    </AuthShell>
  );
}

export function StaticDocumentPage({
  eyebrow,
  title,
  description,
  content,
}: {
  eyebrow: string;
  title: string;
  description: string;
  content: string;
}) {
  return (
    <AuthShell layout="single" containerClassName="max-w-6xl" panelClassName="max-w-6xl">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/75">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{description}</p>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/42">
            <Link href="/session/access" className="transition-colors hover:text-sq-brand-action">
              Sign in
            </Link>
            <span className="text-white/18">/</span>
            <Link href="/session/new" className="transition-colors hover:text-sq-brand-action">
              Register
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 sm:p-8 lg:p-10">
          <DocumentRenderer content={content} />
        </div>
      </div>
    </AuthShell>
  );
}
