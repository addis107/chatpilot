import Link from "next/link";

const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif";

// The ChatPilot pinwheel mark — identical to the main-site navbar.
const LEAF =
  "M11 0H19A3 3 0 0 1 22 3V11A11 11 0 0 1 11 22H3A3 3 0 0 1 0 19V11A11 11 0 0 1 11 0Z";
const TURNS = [0, 90, 180, 270];
const LEAF_OPACITY = [1, 0.9, 0.8, 0.9];

function Mark() {
  return (
    <svg viewBox="-27 -27 54 54" className="size-8" aria-hidden>
      <defs>
        <linearGradient id="cp-dash-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f08d70" />
          <stop offset="1" stopColor="#ec6745" />
        </linearGradient>
      </defs>
      {TURNS.map((t, i) => (
        <path
          key={t}
          d={LEAF}
          transform={`rotate(${t}) translate(-25 -25)`}
          fill="url(#cp-dash-mark)"
          opacity={LEAF_OPACITY[i]}
        />
      ))}
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ fontFamily: FONT }}
      className="min-h-screen bg-[#f3ece9] text-[#234e4b]"
    >
      <header className="sticky top-0 z-20 border-b border-[#e3d9d3] bg-[#f3ece9]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ChatPilot home">
            <Mark />
            <span className="text-[22px] font-medium tracking-[-0.03em] text-[#234e4b]">
              ChatPilot
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#6c817e] transition-colors hover:text-[#234e4b]"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
