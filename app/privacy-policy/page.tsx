import { privacy } from "@/.redstraw";
import { MDXComponent } from "@/components/mdx/mdx-components";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const doc = privacy[0];

  return (
    <article className="container py-10 max-w-4xl mx-auto">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white">{doc.title}</h1>
      {doc.description ? (
        <p className="text-lg mt-0 mb-8 text-slate-300 bg-white/5 p-4 border border-white/10 rounded-md">
          {doc.description}
        </p>
      ) : null}
      <MDXComponent code={doc.content} />
    </article>
  );
}

