"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownContent({ content, dark }: { content: string; dark?: boolean }) {
  return (
    <div className={dark ? "prose-law prose-law-dark text-sm leading-relaxed" : "prose-law text-sm leading-relaxed"}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
