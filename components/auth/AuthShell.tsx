"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthFooterLink = {
  href: string;
  label: string;
};

export const AUTH_FOOTER_LINKS: AuthFooterLink[] = [
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/guide", label: "Guide" },
];

export function AuthFooter({
  links = AUTH_FOOTER_LINKS,
  noteTitle = "Fortified Workspace",
  noteBody = "Secured by end-to-end encryption, layered access control, and live threat protection.",
}: {
  links?: AuthFooterLink[];
  noteTitle?: string;
  noteBody?: string;
}) {
  return (
    <footer className="relative z-10 flex w-full flex-col items-center justify-between gap-6 px-2 pb-2 sm:flex-row sm:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sq-brand-action/20 bg-sq-brand-action/10 text-sq-brand-action">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{noteTitle}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-white/50">{noteBody}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-medium uppercase tracking-[0.1em] text-white/35">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

export function AuthShell({
  children,
  layout = "split",
  containerClassName,
  panelClassName,
  contentClassName,
  aside,
  footer,
}: {
  children: ReactNode;
  layout?: "split" | "single";
  containerClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
  aside?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(205,255,4,0.12),transparent_45%),linear-gradient(180deg,#06080f,#090b14)] p-4 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[68px_68px] opacity-20" />

      <header className="relative z-10 w-full pt-2 sm:pl-2 sm:pt-0">
        <Link href="/session/access" className="inline-flex">
          <Image
            src="/logo.svg"
            alt="Square Experience"
            width={50}
            height={15}
            priority
            className="h-3 w-auto opacity-90 invert md:h-4"
          />
        </Link>
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto flex w-full flex-1 items-center justify-center py-10",
          layout === "split" ? "max-w-5xl" : "max-w-6xl",
          containerClassName,
        )}
      >
        <div
          className={cn(
            "w-full overflow-hidden rounded-[34px] border border-white/10 bg-black/35 backdrop-blur-xl",
            layout === "split" ? "grid lg:grid-cols-[1.1fr_1fr]" : "max-w-6xl",
            panelClassName,
          )}
        >
          {layout === "split" ? (
            <>
              <aside className="hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
                {aside}
              </aside>
              <section className={cn("p-7 sm:p-10", contentClassName)}>{children}</section>
            </>
          ) : (
            <section className={cn("p-7 sm:p-10 lg:p-12", contentClassName)}>{children}</section>
          )}
        </div>
      </main>

      {footer ?? <AuthFooter />}
    </div>
  );
}

export function DefaultAuthAside({
  eyebrow = "Square Ops",
  title = "Internal Command Center",
  paragraphs = [
    "Welcome to the secure operational control center. This environment keeps collaboration, approvals, billing, and delivery workflows aligned under one protected workspace.",
    "Every access path is designed around zero-trust principles, session hardening, and role-bound visibility so sensitive operations stay locked to authorized team members only.",
  ],
}: {
  eyebrow?: string;
  title?: string;
  paragraphs?: string[];
}) {
  return (
    <>
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-sq-brand-action/70">{eyebrow}</p>
        <h1 className="mb-4 mt-3 text-xl font-semibold tracking-[-0.04em] text-white">{title}</h1>
        <hr className="divider-dashed" />
      </div>
      <div className="flex gap-8 items-baseline justify-start"> <Image src="/nodes.png" alt="Square Experience" width={400} height={400} priority className="  select-none selection:bg-transparent h-[40px] w-auto opacity-60  " />
        <Image src="/flaredcloud.png" alt="Square Experience" width={400} height={400} priority className=" h-[30px] w-auto select-none selection:bg-transparent  opacity-60  " /> </div>

      <div className="mt-6 max-w-md space-y-6">
        {paragraphs.map((paragraph, index) => (
          <div key={`${paragraph}-${index}`}>
            <p className="text-[13px] leading-relaxed text-white/60">{paragraph}</p>
            {index < paragraphs.length - 1 ? <hr className="divider-dashed mt-6" /> : null}
          </div>
        ))}
      </div>
    </>
  );
}
