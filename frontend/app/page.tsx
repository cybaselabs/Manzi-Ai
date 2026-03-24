// "use client";

// import { useState, useRef, useEffect } from "react";
// import { Plus, Search, Settings, BookOpen, Sun, Moon, ArrowUp } from "lucide-react";
// import dynamic from "next/dynamic";
// const ChatMessage = dynamic(() => import("@/components/ChatMessage"), { ssr: false });
// const TypingIndicator = dynamic(() => import("@/components/TypingIndicator"), { ssr: false });
// import { sendMessage, type Message, type Source } from "@/lib/api";

// interface DisplayMessage {
//   role: "user" | "assistant";
//   content: string;
//   sources?: Source[];
// }

// const CHIPS = [
//   { label: "Swamplands", text: "What activities are prohibited in protected swampland areas?" },
//   { label: "Road Use", text: "What are the penalties for illegal road use in Kigali?" },
//   { label: "Taxation", text: "Quelles sont les obligations fiscales pour les entreprises à Kigali?" },
//   { label: "Urban Planning", text: "What are the rules for construction in Kigali city?" },
//   { label: "Land Use", text: "Ni izihe nzego zishobora gukoresha ubutaka bw'akayange?" },
// ];

// function SidebarBtn({
//   icon, dark, onClick, title,
// }: {
//   icon: React.ReactNode;
//   dark: boolean;
//   onClick?: () => void;
//   title?: string;
// }) {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <button
//       onClick={onClick}
//       title={title}
//       style={{
//         width: 36, height: 36, borderRadius: 9, border: "none",
//         background: hovered
//           ? dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"
//           : "transparent",
//         color: hovered
//           ? dark ? "#e8e4d8" : "#1a1a16"
//           : dark ? "#5c5c50" : "#9a9888",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         cursor: "pointer", transition: "all 0.15s", marginBottom: 2,
//         flexShrink: 0,
//       }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {icon}
//     </button>
//   );
// }

// export default function Home() {
//   const [messages, setMessages] = useState<DisplayMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [dark, setDark] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   // ── Palette (use neutral values until mounted to avoid hydration mismatch) ──
//   const d = mounted ? dark : true; // always treat as dark during SSR
//   const bg        = d ? "#1f1f1c" : "#f5f4f0";
//   const sidebarBg = d ? "#161614" : "#eae8e3";
//   const sideBorder = d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";
//   const text      = d ? "#e8e4d8" : "#1a1a16";
//   const textMuted = d ? "#6e6e60" : "#8a8872";
//   const inputBg   = d ? "#2a2a27" : "#ffffff";
//   const inputBorder = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
//   const inputFocusBorder = "#068ece";
//   const chipBg    = d ? "#2a2a27" : "#e8e6e0";
//   const chipBorder = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
//   const chipText  = d ? "#a8a898" : "#5a5848";
//   const scrollCls = d ? "manzi-scroll manzi-scroll-dark" : "manzi-scroll";

//   useEffect(() => { setMounted(true); }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   useEffect(() => {
//     const el = textareaRef.current;
//     if (!el) return;
//     el.style.height = "auto";
//     el.style.height = Math.min(el.scrollHeight, 160) + "px";
//   }, [input]);

//   const handleSend = async (text?: string) => {
//     const msg = (text || input).trim();
//     if (!msg || loading) return;
//     setInput("");
//     setMessages((prev) => [...prev, { role: "user", content: msg }]);
//     setLoading(true);
//     try {
//       const history: Message[] = messages.map((m) => ({ role: m.role, content: m.content }));
//       const res = await sendMessage(msg, history);
//       setMessages((prev) => [...prev, { role: "assistant", content: res.answer, sources: res.sources }]);
//     } catch (err) {
//       const errMsg = err instanceof Error ? err.message : "Something went wrong";
//       // Keep user message, append an error assistant message
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: `⚠️ ${errMsg}. Reba niba backend irashyira (http://localhost:8000).` },
//       ]);
//     } finally {
//       setLoading(false);
//       textareaRef.current?.focus();
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//   };

//   const isEmpty  = messages.length === 0;
//   const canSend  = input.trim().length > 0 && !loading;

//   return (
//     <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: bg, transition: "background 0.3s" }}>

//       {/* ═══════════════ ICON-ONLY SIDEBAR ═══════════════ */}
//       <aside style={{
//         width: 50, flexShrink: 0, display: "flex", flexDirection: "column",
//         alignItems: "center", paddingTop: 12, paddingBottom: 12,
//         background: sidebarBg,
//         borderRight: `1px solid ${sideBorder}`,
//         transition: "background 0.3s",
//       }}>
//         {/* Logo mark */}
//         <div style={{
//           width: 32, height: 32, borderRadius: 9, marginBottom: 12,
//           background: "linear-gradient(135deg, #068ece 0%, #0459a0 100%)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           boxShadow: "0 2px 10px rgba(6,142,206,0.35)", overflow: "hidden",
//           flexShrink: 0,
//         }}>
//           <img
//             src="/kigali-logo.png" alt="K"
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//             onError={(e) => {
//               e.currentTarget.style.display = "none";
//               const p = e.currentTarget.parentElement;
//               if (p) p.innerHTML = '<span style="color:#fdfe00;font-size:15px;font-weight:900;font-family:sans-serif">M</span>';
//             }}
//           />
//         </div>

//         {/* Top actions */}
//         <SidebarBtn
//           icon={<Plus size={17} />} dark={d} title="Ikiganiro gishya"
//           onClick={() => { setMessages([]); setInput(""); }}
//         />
//         <SidebarBtn icon={<Search size={17} />} dark={d} title="Shakisha" />

//         <div style={{ flex: 1 }} />

//         {/* Bottom actions */}
//         <SidebarBtn icon={<BookOpen size={17} />} dark={d} title="Amategeko (3)" />
//         <SidebarBtn icon={<Settings size={17} />} dark={d} title="Igenamiterere" />

//         {/* Theme toggle */}
//         <SidebarBtn
//           icon={dark ? <Sun size={16} /> : <Moon size={16} />}
//           dark={d}
//           onClick={() => setDark(!dark)}
//           title={dark ? "Urumuri" : "Umwijima"}
//         />
//       </aside>

//       {/* ═══════════════ MAIN AREA ═══════════════ */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

//         {isEmpty ? (
//           /* ──────── WELCOME STATE ──────── */
//           <div style={{
//             flex: 1, display: "flex", flexDirection: "column",
//             alignItems: "center", justifyContent: "center",
//             padding: "0 24px 60px",
//           }}>

//             {/* Greeting */}
//             <div style={{ textAlign: "center", marginBottom: 28 }}>
//               <div style={{
//                 width: 52, height: 52, borderRadius: 15, margin: "0 auto 18px",
//                 background: "linear-gradient(135deg, #068ece 0%, #0459a0 100%)",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 boxShadow: "0 6px 24px rgba(6,142,206,0.3)", overflow: "hidden",
//               }}>
//                 <img
//                   src="/kigali-logo.png" alt="Kigali"
//                   style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                   onError={(e) => {
//                     e.currentTarget.style.display = "none";
//                     const p = e.currentTarget.parentElement;
//                     if (p) p.innerHTML = '<span style="color:#fdfe00;font-size:22px;font-weight:900;font-family:sans-serif">M</span>';
//                   }}
//                 />
//               </div>
//               <h1 style={{
//                 fontFamily: "'AvenirBlack', 'DM Sans', sans-serif",
//                 fontSize: 32, fontWeight: 900, color: text,
//                 letterSpacing: "-0.02em", margin: "0 0 8px",
//                 transition: "color 0.3s",
//               }}>
//                 Murakaza neza kuri{" "}
//                 <span style={{ color: "#068ece" }}>Manzi</span>
//               </h1>
//               <p style={{ fontSize: 14.5, color: textMuted, margin: 0, transition: "color 0.3s" }}>
//                 Baza ikibazo cy&apos;amategeko y&apos;Umujyi wa Kigali
//               </p>
//             </div>

//             {/* Input box */}
//             <div style={{ width: "100%", maxWidth: 660, marginBottom: 14 }}>
//               <div
//                 style={{
//                   background: inputBg,
//                   border: `1.5px solid ${inputBorder}`,
//                   borderRadius: 18,
//                   padding: "16px 14px 12px 20px",
//                   boxShadow: dark
//                     ? "0 4px 32px rgba(0,0,0,0.4)"
//                     : "0 4px 24px rgba(0,0,0,0.08)",
//                   transition: "border-color 0.2s, box-shadow 0.2s, background 0.3s",
//                 }}
//                 onFocusCapture={(e) => {
//                   (e.currentTarget as HTMLElement).style.borderColor = inputFocusBorder;
//                   (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 32px rgba(6,142,206,0.12)";
//                 }}
//                 onBlurCapture={(e) => {
//                   (e.currentTarget as HTMLElement).style.borderColor = inputBorder;
//                   (e.currentTarget as HTMLElement).style.boxShadow = dark
//                     ? "0 4px 32px rgba(0,0,0,0.4)"
//                     : "0 4px 24px rgba(0,0,0,0.08)";
//                 }}
//               >
//                 <textarea
//                   ref={textareaRef}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   placeholder="Baza ikibazo cy'amategeko..."
//                   rows={1}
//                   style={{
//                     width: "100%", background: "transparent", border: "none", outline: "none",
//                     fontSize: 15.5, color: text, lineHeight: 1.55,
//                     resize: "none", minHeight: 28, maxHeight: 160,
//                     fontFamily: "inherit", transition: "color 0.3s",
//                   }}
//                 />
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 8, gap: 8 }}>
//                   <span style={{ fontSize: 11.5, color: textMuted, marginRight: "auto" }}>
//                     Enter to send · Shift+Enter for new line
//                   </span>
//                   <button
//                     onClick={() => handleSend()}
//                     disabled={!canSend}
//                     style={{
//                       width: 36, height: 36, borderRadius: 10, border: "none",
//                       background: canSend
//                         ? "#068ece"
//                         : d ? "#2e2e2b" : "#d8d6d0",
//                       color: canSend
//                         ? "#fdfe00"
//                         : d ? "#4a4a42" : "#a8a898",
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       cursor: canSend ? "pointer" : "not-allowed",
//                       boxShadow: canSend ? "0 2px 10px rgba(6,142,206,0.35)" : "none",
//                       transition: "all 0.2s", flexShrink: 0,
//                     }}
//                   >
//                     <ArrowUp size={17} strokeWidth={2.5} />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Category chips */}
//             <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 660 }}>
//               {CHIPS.map((chip, i) => (
//                 <button
//                   key={i}
//                   onClick={() => handleSend(chip.text)}
//                   style={{
//                     padding: "8px 18px", borderRadius: 99,
//                     background: chipBg,
//                     border: `1px solid ${chipBorder}`,
//                     color: chipText, fontSize: 13.5, fontWeight: 500,
//                     cursor: "pointer", fontFamily: "inherit",
//                     transition: "all 0.18s",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.borderColor = "#068ece";
//                     e.currentTarget.style.color = "#068ece";
//                     e.currentTarget.style.background = d ? "#313130" : "#dff0fa";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.borderColor = chipBorder;
//                     e.currentTarget.style.color = chipText;
//                     e.currentTarget.style.background = chipBg;
//                   }}
//                 >
//                   {chip.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//         ) : (
//           /* ──────── CHAT STATE ──────── */
//           <>
//             {/* Slim top bar */}
//             <header style={{
//               display: "flex", alignItems: "center", padding: "11px 20px", gap: 10,
//               borderBottom: `1px solid ${sideBorder}`,
//               flexShrink: 0, background: bg, transition: "background 0.3s",
//             }}>
//               <span style={{
//                 fontFamily: "'AvenirBlack', 'DM Sans', sans-serif",
//                 fontSize: 15, fontWeight: 900, color: text, transition: "color 0.3s",
//               }}>
//                 Manzi
//               </span>
//               <span style={{
//                 fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
//                 background: "#fdfe00", color: "#1a1500", letterSpacing: "0.02em",
//               }}>
//                 KIGALI
//               </span>
//               <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
//                 <div style={{
//                   display: "flex", alignItems: "center", gap: 5, fontSize: 11.5,
//                   padding: "4px 10px", borderRadius: 16,
//                   background: d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
//                   color: textMuted,
//                 }}>
//                   <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
//                   3 amategeko
//                 </div>
//               </div>
//             </header>

//             {/* Messages */}
//             <main style={{ flex: 1, overflowY: "auto" }} className={scrollCls}>
//               <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//                   {messages.map((msg, i) => (
//                     <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} dark={d} />
//                   ))}
//                   {loading && <TypingIndicator dark={d} />}
//                   <div ref={bottomRef} />
//                 </div>
//               </div>
//             </main>

//             {/* Input bar */}
//             <div style={{
//               padding: "10px 20px 16px",
//               borderTop: `1px solid ${sideBorder}`,
//               background: bg, transition: "background 0.3s",
//             }}>
//               <div style={{ maxWidth: 720, margin: "0 auto" }}>
//                 <div
//                   style={{
//                     background: inputBg,
//                     border: `1.5px solid ${inputBorder}`,
//                     borderRadius: 16,
//                     padding: "11px 11px 9px 17px",
//                     transition: "border-color 0.2s, background 0.3s",
//                   }}
//                   onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = inputFocusBorder; }}
//                   onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = inputBorder; }}
//                 >
//                   <textarea
//                     ref={textareaRef}
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     placeholder="Baza ikibazo cy'amategeko..."
//                     rows={1}
//                     style={{
//                       width: "100%", background: "transparent", border: "none", outline: "none",
//                       fontSize: 14.5, color: text, lineHeight: 1.5,
//                       resize: "none", minHeight: 24, fontFamily: "inherit",
//                       transition: "color 0.3s",
//                     }}
//                   />
//                   <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
//                     <button
//                       onClick={() => handleSend()}
//                       disabled={!canSend}
//                       style={{
//                         width: 34, height: 34, borderRadius: 9, border: "none",
//                         background: canSend
//                           ? "#068ece"
//                           : d ? "#2c2c29" : "#d8d6d0",
//                         color: canSend
//                           ? "#fdfe00"
//                           : d ? "#3e3e36" : "#a8a898",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         cursor: canSend ? "pointer" : "not-allowed",
//                         boxShadow: canSend ? "0 2px 10px rgba(6,142,206,0.3)" : "none",
//                         transition: "all 0.2s",
//                       }}
//                     >
//                       <ArrowUp size={16} strokeWidth={2.5} />
//                     </button>
//                   </div>
//                 </div>
//                 <p style={{
//                   textAlign: "center", fontSize: 10.5,
//                   color: d ? "#343430" : "#c8c5bc",
//                   marginTop: 7, letterSpacing: "0.01em",
//                 }}>
//                   Manzi answers based on official laws only · Powered by City of Kigali
//                 </p>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, Settings, HelpCircle, Sun, Moon, BookOpen, Search } from "lucide-react";
import dynamic from "next/dynamic";
const ChatMessage = dynamic(() => import("@/components/ChatMessage"), { ssr: false });
const TypingIndicator = dynamic(() => import("@/components/TypingIndicator"), { ssr: false });
import { sendMessage, type Message, type Source } from "@/lib/api";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface Conversation {
  id: string;
  title: string;
  messages: DisplayMessage[];
  createdAt: number;
}

const STORAGE_KEY = "manzi_conversations";

function loadConversations(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos.slice(0, 50)));
}

const CATEGORIES = [
  { emoji: "🌿", label: "Swamplands", desc: "Protected wetland areas", text: "What activities are prohibited in protected swampland areas?" },
  { emoji: "🚗", label: "Road Use", desc: "Traffic & road regulations", text: "What are the penalties for illegal road use in Kigali?" },
  { emoji: "🧾", label: "Taxation", desc: "Tax obligations", text: "Quelles sont les obligations fiscales pour les entreprises?" },
  { emoji: "🏗️", label: "Urban Planning", desc: "Construction rules", text: "What are the rules for construction in Kigali city?" },
  { emoji: "🌳", label: "Environment", desc: "Environmental regulations", text: "What environmental regulations apply to swampland areas?" },
  { emoji: "📍", label: "Land Use", desc: "Land ownership rights", text: "Ni izihe nzego zishobora gukoresha ubutaka bw'akayange?" },
];

function getGreeting(): { emoji: string; text: string } {
  const h = new Date().getHours();
  if (h < 12) return { emoji: "☀️", text: "Good morning" };
  if (h < 17) return { emoji: "🌤", text: "Good afternoon" };
  return { emoji: "🌙", text: "Good evening" };
}

export default function Home() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dark] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const greeting = getGreeting();

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      setConversations(loadConversations());
    }, 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const startNewChat = () => {
    setMessages([]); setError(null); setInput(""); setActiveId(null);
  };

  const loadConversation = (convo: Conversation) => {
    setMessages(convo.messages);
    setActiveId(convo.id);
    setError(null);
  };

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(""); setError(null);
    const newMessages: DisplayMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history: Message[] = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await sendMessage(msg, history);
      const finalMessages: DisplayMessage[] = [...newMessages, { role: "assistant", content: res.answer, sources: res.sources }];
      setMessages(finalMessages);

      // Save to localStorage
      const convos = loadConversations();
      const id = activeId || crypto.randomUUID();
      const title = msg.slice(0, 50) + (msg.length > 50 ? "…" : "");
      const existing = convos.findIndex((c) => c.id === id);
      const updated: Conversation = { id, title, messages: finalMessages, createdAt: Date.now() };
      if (existing >= 0) convos[existing] = updated;
      else convos.unshift(updated);
      saveConversations(convos);
      setConversations(convos);
      setActiveId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isEmpty = messages.length === 0;
  const canSend = input.trim().length > 0 && !loading;

  /* ── Colors ── */
  const bg = "radial-gradient(ellipse at 50% 0%, #0f1d2e 0%, #0a1018 60%, #080c12 100%)";
  const sidebarBg = "#0b1320";
  const sidebarBorder = "#12202f";
  const cardBg = "rgba(6,142,206,0.04)";
  const cardBorder = "rgba(6,142,206,0.12)";
  const cardBorderHover = "rgba(6,142,206,0.3)";
  const inputBg = "#0f1923";
  const inputBorder = "#1a2a3a";
  const muted = "#4a6070";
  const textPrimary = "#e4eaf0";
  const textSecondary = "#6b8090";

  return (
    <div style={{ display: "flex", height: "100dvh", overflow: "hidden" }}>

      {/* ═══════ SIDEBAR ═══════ */}
      <aside
        className="hidden md:flex"
        style={{
          flexDirection: "column", width: 220, flexShrink: 0,
          background: sidebarBg, borderRight: `1px solid ${sidebarBorder}`,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 14px" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: "#068ece",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(6,142,206,0.3)", flexShrink: 0, overflow: "hidden",
          }}>
            <img src="/kigali-logo.png" alt="Kigali" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.parentElement!.innerHTML = '<span style="color:#fefd05;font-family:AvenirBlack,sans-serif;font-size:16px">M</span>'; }} />
          </div>
          <div>
            <p style={{ fontFamily: "'AvenirBlack', sans-serif", fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Manzi</p>
            <p style={{ fontSize: 10, color: muted, lineHeight: 1.2 }}>City of Kigali</p>
          </div>
        </div>

        {/* New Chat */}
        <div style={{ padding: "0 12px 10px" }}>
          <button
            onClick={startNewChat}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#068ece", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Plus size={14} /> New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="scrollbar-thin" style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
          {mounted && conversations.length > 0 ? (
            <>
              <p style={{ fontSize: 9, fontWeight: 700, color: muted, padding: "10px 8px 5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Recent
              </p>
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => loadConversation(convo)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: activeId === convo.id ? "rgba(6,142,206,0.12)" : "transparent",
                    color: activeId === convo.id ? "#068ece" : textSecondary,
                    fontSize: 12, fontFamily: "inherit", textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (activeId !== convo.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { if (activeId !== convo.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <MessageSquare size={13} style={{ flexShrink: 0, color: activeId === convo.id ? "#068ece" : muted }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {convo.title}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p style={{ fontSize: 12, color: muted, padding: "16px 8px", textAlign: "center" }}>No conversations yet</p>
          )}
        </div>

        {/* Bottom */}
        <div style={{ padding: "8px 8px 14px", borderTop: `1px solid ${sidebarBorder}` }}>
          {[
            { icon: BookOpen, label: "Laws", badge: "3" },
            { icon: Settings, label: "Settings" },
            { icon: HelpCircle, label: "Help" },
          ].map((item) => (
            <button key={item.label} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 8, fontSize: 12.5,
              color: muted, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
              transition: "color 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = textSecondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = muted; }}
            >
              <item.icon size={14} />
              {item.label}
              {item.badge && <span style={{ marginLeft: "auto", background: "#068ece", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>{item.badge}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, background: bg }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px", borderBottom: `1px solid ${sidebarBorder}`, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Mobile logo */}
            <div className="md:hidden" style={{
              width: 30, height: 30, borderRadius: 8, background: "#068ece",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              <img src="/kigali-logo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.currentTarget.parentElement!.innerHTML = '<span style="color:#fefd05;font-weight:800;font-size:12px">M</span>'; }} />
            </div>
            {/* Rwanda flag dots */}
            <div style={{ display: "flex", gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00a0dc" }} />
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fad201" }} />
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#20603d" }} />
            </div>
            <span style={{ fontSize: 12.5, color: textSecondary }}>City of Kigali Laws</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.4)" }} />
            <span style={{ fontSize: 12, color: textSecondary }}>Online</span>
          </div>
        </header>

        {/* Content */}
        <main className="scrollbar-thin" style={{ flex: 1, overflowY: "auto" }}>
          {isEmpty ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 80px" }}>

              {/* Logo orb */}
              <div
                className={mounted ? "animate-fadeIn" : ""}
                style={{
                  width: 80, height: 80, borderRadius: 24, background: "#068ece",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 0 0 rgba(6,142,206,0.3), 0 8px 32px rgba(0,0,0,0.3)",
                  animation: mounted ? "orbPulse 3s ease-in-out infinite, fadeIn 0.6s ease-out" : "none",
                  marginBottom: 24, overflow: "hidden",
                  opacity: mounted ? undefined : 0,
                }}
              >
                <img src="/kigali-logo.png" alt="" style={{ width: 52, height: 52, objectFit: "contain" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>

              {/* Greeting */}
              <p className={mounted ? "animate-fadeIn-d1" : ""} style={{ fontSize: 14, color: textSecondary, marginBottom: 8, fontWeight: 500 }}>
                {greeting.emoji} {greeting.text}
              </p>

              {/* Title */}
              <h1
                className={mounted ? "animate-fadeIn-d2" : ""}
                style={{
                  fontFamily: "'AvenirBlack', sans-serif", fontSize: 28, fontWeight: 900,
                  color: "#fff", textAlign: "center", marginBottom: 6,
                }}
              >
                Manzi
              </h1>

              {/* Rwanda flag accent line */}
              <div className={mounted ? "animate-fadeIn-d2" : ""} style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                <span style={{ width: 20, height: 3, borderRadius: 2, background: "#00a0dc" }} />
                <span style={{ width: 20, height: 3, borderRadius: 2, background: "#fad201" }} />
                <span style={{ width: 20, height: 3, borderRadius: 2, background: "#20603d" }} />
              </div>

              <p className={mounted ? "animate-fadeIn-d2" : ""} style={{ fontSize: 14, color: textSecondary, textAlign: "center", maxWidth: 360, lineHeight: 1.6, marginBottom: 32 }}>
                How can I help you today? Ask in Kinyarwanda, English, or French
              </p>

              {/* Topic cards — 2 columns like Road Traffic */}
              <div
                className={mounted ? "animate-fadeIn-d3" : ""}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 520 }}
              >
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(cat.text)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                      background: hovered === i ? "rgba(6,142,206,0.08)" : cardBg,
                      border: `1px solid ${hovered === i ? cardBorderHover : cardBorder}`,
                      borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{cat.emoji}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary, display: "block", lineHeight: 1.3 }}>{cat.label}</span>
                      <span style={{ fontSize: 11, color: textSecondary, lineHeight: 1.4 }}>{cat.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Disclaimer */}
              <p className={mounted ? "animate-fadeIn-d4" : ""} style={{ fontSize: 11, color: muted, marginTop: 20, textAlign: "center" }}>
                ⚖️ Informational tool only, not legal advice
              </p>
            </div>
          ) : (
            /* Messages */
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} dark={dark} />
                ))}
                {loading && <TypingIndicator dark={dark} />}
                {error && (
                  <div style={{
                    padding: "12px 16px", borderRadius: 12,
                    background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)",
                    color: "#f87171", fontSize: 13, textAlign: "center",
                  }}>
                    {error}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          )}
        </main>

        {/* ═══════ INPUT ═══════ */}
        <div
          className={mounted ? "animate-fadeIn-d4" : ""}
          style={{ padding: "12px 20px 18px", flexShrink: 0 }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div
              style={{
                display: "flex", alignItems: "flex-end", gap: 8,
                background: inputBg, border: `1px solid ${inputBorder}`,
                borderRadius: 16, padding: "10px 10px 10px 18px",
                transition: "border-color 0.2s",
              }}
              onFocusCapture={(e) => { e.currentTarget.style.borderColor = "#068ece"; }}
              onBlurCapture={(e) => { e.currentTarget.style.borderColor = inputBorder; }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How can I help you today?"
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 14, color: textPrimary, lineHeight: 1.5,
                  resize: "none", minHeight: 24, fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!canSend}
                style={{
                  width: 38, height: 38, borderRadius: 12, border: "none", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: canSend ? "#068ece" : "rgba(255,255,255,0.04)",
                  color: canSend ? "#fefd05" : "#333",
                  cursor: canSend ? "pointer" : "not-allowed",
                  boxShadow: canSend ? "0 2px 10px rgba(6,142,206,0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 10, color: muted, marginTop: 8 }}>
              Manzi answers based on official laws only · Powered by City of Kigali
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}