export function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm"
      role="img"
      aria-label="Illustration of a person working on a laptop with a radar chart display"
    >
      {/* Ground shadow */}
      <ellipse cx="200" cy="300" rx="120" ry="12" className="fill-[var(--ios-blue)]" opacity="0.08" />

      {/* Floating radar card, top right */}
      <g transform="translate(275,20)">
        <rect width="88" height="88" rx="16" className="fill-[var(--ios-indigo)]" opacity="0.12" />
        <circle cx="44" cy="44" r="26" className="stroke-[var(--ios-indigo)]" strokeWidth="2" opacity="0.55" fill="none" />
        <circle cx="44" cy="44" r="15" className="stroke-[var(--ios-indigo)]" strokeWidth="2" opacity="0.55" fill="none" />
        <circle cx="44" cy="44" r="3" className="fill-[var(--ios-indigo)]" />
        <line x1="44" y1="44" x2="63" y2="28" className="stroke-[var(--ios-indigo)]" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* Floating checkmark card, top left */}
      <g transform="translate(30,45)">
        <rect width="66" height="66" rx="16" className="fill-[var(--ios-green)]" opacity="0.14" />
        <path
          d="M20 34 L30 44 L47 22"
          className="stroke-[var(--ios-green)]"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Desk */}
      <rect x="80" y="240" width="240" height="8" rx="4" className="fill-[var(--foreground)]" opacity="0.12" />
      <rect x="100" y="248" width="8" height="40" rx="3" className="fill-[var(--foreground)]" opacity="0.12" />
      <rect x="292" y="248" width="8" height="40" rx="3" className="fill-[var(--foreground)]" opacity="0.12" />

      {/* Chair back, behind person */}
      <path
        d="M120 285 C112 200 130 150 175 148 C185 148 190 156 189 165 L186 235 C186 265 165 285 140 285 Z"
        className="fill-[var(--ios-indigo)]"
        opacity="0.15"
      />

      {/* Person torso + head, seated, facing the laptop */}
      <g>
        {/* torso */}
        <path
          d="M148 240 C144 190 158 168 188 168 C218 168 230 192 226 240 Z"
          className="fill-[var(--ios-indigo)]"
        />
        {/* head */}
        <circle cx="187" cy="140" r="26" className="fill-[var(--ios-blue)]" />
        {/* near arm, resting toward laptop keyboard */}
        <path
          d="M206 190 C226 196 236 210 234 226"
          className="stroke-[var(--ios-indigo)]"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* far arm */}
        <path
          d="M168 190 C150 196 142 210 144 226"
          className="stroke-[var(--ios-indigo)]"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Laptop, in front of the torso, sitting on the desk */}
      <g transform="translate(148,200)">
        <path d="M2 42 L-8 58 L88 58 L78 42 Z" className="fill-[var(--ios-blue)]" />
        <rect x="2" y="0" width="76" height="44" rx="6" className="fill-[var(--ios-blue)]" />
        <rect x="8" y="6" width="64" height="32" rx="3" className="fill-[var(--background)]" opacity="0.92" />
      </g>
    </svg>
  );
}
