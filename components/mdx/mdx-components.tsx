import Image from "next/image";
import * as runtime from "react/jsx-runtime";
import { Callout } from "./callout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Code } from "./code";


const useMDXComponent = (code: string) => {
  const fn = new Function(code);
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
      className="mt-0 mb-4 pb-[0.3em] hover:underline text-[2em] font-semibold border-b border-gray-200 dark:border-gray-700"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="mt-6 mb-4 pb-[0.3em] hover:underline text-[1.5em] font-semibold border-b border-gray-200 dark:border-gray-700"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="mt-6 mb-4 text-[1.25em] font-semibold hover:underline"
      {...props}
    />
  ),
  h4: (props: any) => (
    <h4
      className="mt-6 mb-4 text-[1em] font-semibold hover:underline"
      {...props}
    />
  ),
  h5: (props: any) => (
    <h5
      className="mt-6 mb-4 text-[0.875em] font-semibold hover:underline"
      {...props}
    />
  ),
  h6: (props: any) => (
    <h6
      className="mt-6 mb-4 text-[0.85em] font-semibold text-gray-600 dark:text-gray-400 hover:underline"
      {...props}
    />
  ),
  p: (props: any) => <p className="mt-0 mb-4" {...props} />,
  ul: (props: any) => <ul className="mt-0 mb-4 pl-8 list-disc" {...props} />,
  ol: (props: any) => <ol className="mt-0 mb-4 pl-8 list-decimal" {...props} />,
  li: (props: any) => <li className="mt-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="mt-0 mb-4 pl-4 border-l-4 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
      {...props}
    />
  ),
  table: (props: any) => (
    <div className="mt-0 mb-4 overflow-x-auto">
      <table className="border-collapse border-spacing-0 w-full" {...props} />
    </div>
  ),
  thead: (props: any) => <thead {...props} />,
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => (
    <tr className="border-t border-gray-300 dark:border-gray-600" {...props} />
  ),
  th: (props: any) => (
    <th
      className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="border border-gray-300 dark:border-gray-600 px-3 py-2"
      {...props}
    />
  ),
  hr: (props: any) => (
    <hr
      className="my-6 border-0 border-t border-gray-300 dark:border-gray-600"
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 no-underline hover:underline"
      {...props}
    />
  ),
  strong: (props: any) => <strong className="font-semibold" {...props} />,
  em: (props: any) => <em className="italic" {...props} />,
  code: (props: any) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[85%] font-mono"
      {...props}
    />
  ),
};

interface MdxProps {
  code: string;
}

export function MDXContent({ code }: MdxProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
