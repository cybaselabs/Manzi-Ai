"use client";

import dynamic from "next/dynamic";
import type { Source } from "@/lib/api";

const MarkdownContent = dynamic(() => import("./MarkdownContent"), { ssr: false });

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  dark?: boolean;
}

export default function ChatMessage({ role, content, dark }: Props) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-msgIn">
        <div
          className="max-w-[78%] px-5 py-3.5 text-sm leading-relaxed"
          style={{
            background: "#068ece",
            color: "#fff",
            borderRadius: 18,
            borderBottomRightRadius: 6,
            boxShadow: "0 4px 16px rgba(6,142,206,0.25)",
            padding: "0.4rem 0.7rem",
          }}
        >
          <p className="whitespace-pre-wrap p-2">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-msgIn">
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: "#068ece" }}
        >
          <img
            src="/kigali-logo.png"
            alt="Manzi"
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget.parentElement!;
              el.innerHTML =
                '<span style="color:#fefd05;font-weight:800;font-size:11px">K</span>';
            }}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-2" style={{ color: "#068ece" }}>
          Manzi
        </p>

        <div
          style={{
            padding: "14px 18px",
            borderRadius: 18,
            borderBottomLeftRadius: 6,
            background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
            border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(6,142,206,0.1)"}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            marginTop: "0.8rem",
          }}
        >
          <MarkdownContent content={content} dark={dark} />
        </div>
      </div>
    </div>
  );
}