import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef } from "react";

type MarkdownComponentProps<T extends React.ElementType> =
  ComponentPropsWithoutRef<T>;

const components = {
  h1: (p: MarkdownComponentProps<"h1">) => (
    <h1 className="mb-2 mt-4 text-lg font-semibold text-zinc-100 first:mt-0" {...p} />
  ),
  h2: (p: MarkdownComponentProps<"h2">) => (
    <h2 className="mb-2 mt-4 text-base font-semibold text-zinc-100 first:mt-0" {...p} />
  ),
  h3: (p: MarkdownComponentProps<"h3">) => (
    <h3 className="mb-1.5 mt-3 text-sm font-semibold text-zinc-100 first:mt-0" {...p} />
  ),
  p: (p: MarkdownComponentProps<"p">) => (
    <p className="mb-2 leading-relaxed last:mb-0" {...p} />
  ),
  ul: (p: MarkdownComponentProps<"ul">) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...p} />
  ),
  ol: (p: MarkdownComponentProps<"ol">) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...p} />
  ),
  li: (p: MarkdownComponentProps<"li">) => (
    <li className="text-zinc-200" {...p} />
  ),
  strong: (p: MarkdownComponentProps<"strong">) => (
    <strong className="font-semibold text-emerald-300" {...p} />
  ),
  em: (p: MarkdownComponentProps<"em">) => (
    <em className="italic text-zinc-200" {...p} />
  ),
  code: (p: MarkdownComponentProps<"code">) => {
    const { className, ...rest } = p as MarkdownComponentProps<"code"> & {
      className?: string;
    };
    const isInline = !className?.includes("language-");
    if (isInline) {
      return (
        <code
          className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-xs text-emerald-200"
          {...rest}
        />
      );
    }
    return (
      <code
        className="block overflow-x-auto rounded-lg bg-zinc-800 p-3 text-xs text-zinc-200"
        {...rest}
      />
    );
  },
  pre: (p: MarkdownComponentProps<"pre">) => (
    <pre className="mb-2 overflow-x-auto last:mb-0" {...p} />
  ),
  blockquote: (p: MarkdownComponentProps<"blockquote">) => (
    <blockquote
      className="mb-2 border-l-2 border-emerald-500/40 pl-3 italic text-zinc-300 last:mb-0"
      {...p}
    />
  ),
  a: (p: MarkdownComponentProps<"a">) => (
    <a
      className="text-emerald-400 underline hover:text-emerald-300"
      target="_blank"
      rel="noopener noreferrer"
      {...p}
    />
  ),
  table: (p: MarkdownComponentProps<"table">) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-xs" {...p} />
    </div>
  ),
  thead: (p: MarkdownComponentProps<"thead">) => (
    <thead className="border-b border-zinc-700" {...p} />
  ),
  th: (p: MarkdownComponentProps<"th">) => (
    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-400" {...p} />
  ),
  td: (p: MarkdownComponentProps<"td">) => (
    <td className="px-3 py-2 text-zinc-200" {...p} />
  ),
  tr: (p: MarkdownComponentProps<"tr">) => (
    <tr className="border-b border-zinc-800 last:border-0" {...p} />
  ),
  hr: (p: MarkdownComponentProps<"hr">) => (
    <hr className="my-3 border-zinc-700" {...p} />
  ),
};

type Props = {
  content: string;
  isStreaming?: boolean;
};

export default function AIMessageContent({ content, isStreaming }: Props) {
  if (!content) {
    return (
      <span className="flex gap-1">
        <span
          className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </span>
    );
  }

  return (
    <div className="text-sm text-zinc-200">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
      {isStreaming && (
        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-emerald-400 align-text-bottom" />
      )}
    </div>
  );
}
