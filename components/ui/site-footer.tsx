"use client";

import { useState } from "react";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif";

// ChatPilot pinwheel mark (same as the hero navbar).
const LEAF =
  "M11 0H19A3 3 0 0 1 22 3V11A11 11 0 0 1 11 22H3A3 3 0 0 1 0 19V11A11 11 0 0 1 11 0Z";
const TURNS = [0, 90, 180, 270];
const LEAF_OPACITY = [1, 0.9, 0.8, 0.9];

function Mark() {
  return (
    <svg viewBox="-27 -27 54 54" className="w-6" aria-hidden>
      <defs>
        <linearGradient id="cp-footer-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f08d70" />
          <stop offset="1" stopColor="#ec6745" />
        </linearGradient>
      </defs>
      {TURNS.map((t, i) => (
        <path
          key={t}
          d={LEAF}
          transform={`rotate(${t}) translate(-25 -25)`}
          fill="url(#cp-footer-mark)"
          opacity={LEAF_OPACITY[i]}
        />
      ))}
    </svg>
  );
}

const NAV = [
  { label: "Home", href: "#top" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Dashboard", href: "/dashboard" },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
  { icon: Github, label: "GitHub" },
];

export default function SiteFooter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer style={{ fontFamily: FONT }} className="bg-[#234e4b] py-14">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Circular logo badge */}
          <div className="mb-8 rounded-full bg-white/5 p-8">
            <Mark />
          </div>

          {/* Nav */}
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            {NAV.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[15px] text-[#d7e0dd] transition-colors hover:text-[#ec6745]"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Socials */}
          <div className="mb-8 flex gap-4">
            {SOCIALS.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full border border-white/20 text-[#d7e0dd] transition-colors hover:border-[#ec6745] hover:bg-[#ec6745] hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>

          {/* Newsletter */}
          <div className="mb-8 w-full max-w-md">
            {subscribed ? (
              <p className="text-center text-[15px] font-medium text-[#f3ece9]">
                ✓ Thanks — you&apos;re on the list.
              </p>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
              >
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  aria-label="Email"
                  className="h-11 flex-grow rounded-full border border-white/15 bg-white/95 px-4 text-[15px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:ring-2 focus:ring-[#ec6745]/25"
                />
                <button
                  type="submit"
                  className="h-11 shrink-0 rounded-full bg-[#ec6745] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-[#9fbdb7]">
            © 2026 ChatPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
