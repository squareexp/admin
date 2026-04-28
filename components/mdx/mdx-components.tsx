import Image from "next/image";
import * as runtime from "react/jsx-runtime";
import { Callout } from "./callout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Code } from "./code";

const useMDXComponent = (code: string) => {
  const source = String(code ?? "").trim();

  // Redstraw docs in ops currently provide HTML string in `content`.
  // If it's HTML (starts with a tag), render safely as HTML fallback.
  if (source.startsWith("<")) {
    return function HtmlFallback() {
      return (
        <div
          className="instruction-content"
          dangerouslySetInnerHTML={{ __html: source }}
        />
      );
    };
  }

  const fn = new Function(source);
  return fn({ ...runtime }).default;
};

const components = {
  Image,
  Callout,
  Code,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  h1: (props: any) => (
    <h1
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 mt-2 text-white"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="scroll-m-20 border-b border-white/10 pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-12 mb-4 text-white"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 text-white"
      {...props}
    />
  ),
  h4: (props: any) => (
    <h4
      className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4 text-white"
      {...props}
    />
  ),
  h5: (props: any) => (
    <h5 className="mt-8 mb-4 text-lg font-semibold text-white" {...props} />
  ),
  h6: (props: any) => (
    <h6
      className="mt-8 mb-4 text-base font-semibold text-slate-400"
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      className="leading-7 [&:not(:first-child)]:mt-6 text-slate-300"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-slate-300" {...props} />
  ),
  ol: (props: any) => (
    <ol
      className="my-6 ml-6 list-decimal [&>li]:mt-2 text-slate-300"
      {...props}
    />
  ),
  li: (props: any) => <li className="mt-2" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="mt-6 border-l-2 border-primary pl-6 italic text-slate-400"
      {...props}
    />
  ),
  table: (props: any) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: any) => <thead className="bg-[#1c1c1c]" {...props} />,
  tbody: (props: any) => <tbody className="bg-[#111]" {...props} />,
  tr: (props: any) => (
    <tr
      className="m-0 border-t border-white/10 p-0 even:bg-[#161616]"
      {...props}
    />
  ),
  th: (props: any) => (
    <th
      className="border border-white/10 px-4 py-2 text-left font-bold text-white [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="border border-white/10 px-4 py-2 text-slate-300 [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  hr: (props: any) => <hr className="my-8 border-white/10" {...props} />,
  a: (props: any) => (
    <a
      className="font-medium text-primary/80 hover:text-primary/60 transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
      {...props}
    />
  ),
  strong: (props: any) => (
    <strong className="font-bold text-white" {...props} />
  ),
  em: (props: any) => <em className="italic text-slate-200" {...props} />,
  code: (props: any) => (
    <code
      className="relative rounded bg-white/10 px-[0.4rem] py-[0.2rem] font-mono text-sm font-semibold text-primary/60"
      {...props}
    />
  ),
};

interface MdxProps {
  code: string;
}

export function MDXComponent({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}

export const MDXContent = MDXComponent;
