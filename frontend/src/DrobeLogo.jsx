export default function DrobeLogo({ light = false }) {
  return (
    <span className={`app-brand${light ? " app-brand-light" : ""}`}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="2.5" y="2.5" width="19" height="19" rx="7" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
          <path d="m10.5 10.5 3 3m0-3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span>Drobe</span>
    </span>
  );
}
