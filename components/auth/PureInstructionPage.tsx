import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";

export function PureInstructionPage({
  eyebrow,
  title,
  description,
  content,
}: {
  eyebrow: string;
  title: string;
  description: string;
  content: string; // HTML string from redstraw
}) {
  return (
    <AuthShell 
      layout="single" 
      containerClassName="max-w-5xl" 
      panelClassName="bg-transparent border-none backdrop-blur-none shadow-none rounded-none"
      contentClassName="p-0 sm:p-0 lg:p-0"
    >
      <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <p className="font-brachial text-[11px] uppercase tracking-[0.3em] text-sq-brand-action/80">
              {eyebrow}
            </p>
            <h1 className="font-brachial mt-4 text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            <div className="mt-6 flex items-center gap-4">
              <div className="h-px w-12 bg-sq-brand-action/40" />
              <p className="max-w-2xl text-[13px] leading-relaxed text-white/50">
                {description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <Link href="/session/access" className="transition-all hover:text-sq-brand-action hover:tracking-[0.3em]">
              Access
            </Link>
            <div className="h-1 w-1 rounded-full bg-white/10" />
            <Link href="/guide" className="transition-all hover:text-sq-brand-action hover:tracking-[0.3em]">
              Guide
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div 
          className="instruction-content font-sans"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
        
        {/* Bottom Navigation */}
        <div className="mt-20 flex items-center justify-between border-t border-white/5 pt-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            Internal Operations Documentation
          </p>
          <Link 
            href="/session/new" 
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-sq-brand-action"
          >
            <span className="h-px w-6 bg-white/10 transition-all group-hover:w-10 group-hover:bg-sq-brand-action" />
            Request Account
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
