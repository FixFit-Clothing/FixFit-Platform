import { ExecutiveAvatar } from "@/components/home/ExecutiveAvatar";

export function HeroVisual() {
  return (
    <div className="hero-visual">
      <svg
        className="hero-stitch"
        viewBox="0 0 400 24"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Stitch divider"
      >
        <path
          d="M0 12h400"
          stroke="#E7DFD3"
          strokeWidth="2"
          strokeDasharray="10 8"
        />
        <circle cx="200" cy="12" r="4" fill="#F97316" />
      </svg>
      <div className="live-badge">
        <span className="live-dot" aria-hidden="true" />
        Priya is on duty — Sector 4
      </div>
      <div className="exec-mini">
        <div className="exec-mini-photo">
          <ExecutiveAvatar size={40} label="Executive avatar" />
        </div>
        <div>
          <div className="name">Priya Sharma</div>
          <div className="id">ID: FX-BLR-001 · 4.9★</div>
        </div>
      </div>
      <div className="float-chip float-chip-1">
        ⚡ Priya is on duty — HSR Layout Sectors 2–6
      </div>
      <div className="float-chip float-chip-2">
        ⏱️ Average Pickup Time: 12 minutes
      </div>
    </div>
  );
}
