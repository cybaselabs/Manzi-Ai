interface TypingIndicatorProps {
  dark?: boolean;
}

export default function TypingIndicator({ dark = false }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3">
      <div
        className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 flex items-center justify-center"
        style={{ background: "#068ece" }}
      >
        <img
          src="/kigali-logo.png"
          alt="Manzi"
          className="w-full h-full object-cover"
          onError={(e) => {
            const el = e.currentTarget.parentElement!;
            el.innerHTML = '<span style="color:#fefd05;font-weight:800;font-size:11px">K</span>';
          }}
        />
      </div>
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "#068ece" }}>Manzi</p>
        <div
          className="animate-msgIn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "10px 18px",
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
            border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(6,142,206,0.1)"}`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="typing-dot"
              style={{ background: "#068ece", animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}