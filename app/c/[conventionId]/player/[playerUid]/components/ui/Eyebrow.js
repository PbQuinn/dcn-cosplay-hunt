// ---------------------------------------------------------------------------
// Small shared pieces — reuse these instead of re-typing the same utility
// strings in every modal. Tweak spacing/color here once and it applies
// everywhere.
// ---------------------------------------------------------------------------
export function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-wide text-gold ${className}`}
    >
      {children}
    </p>
  );
}