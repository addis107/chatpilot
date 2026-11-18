"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { Award, ShieldCheck, Sparkles, Star, StarHalf } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif";

const BADGES = [
  { icon: Award, full: 5, half: false },
  { icon: Sparkles, full: 5, half: false },
  { icon: ShieldCheck, full: 4, half: true },
];

const WORKS_WITH = ["Slack", "Google Sheets", "Notion", "n8n", "Gmail", "Zapier"];

export default function CtaBand() {
  return (
    <LazyMotion features={domAnimation}>
      <section
        id="get-started"
        style={{ fontFamily: FONT }}
        className="relative overflow-hidden bg-[#f3ece9] px-6 py-28 sm:py-32"
      >
        {/* Grid-pattern background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 w-[1200px] -translate-x-1/2">
            <svg
              className="absolute inset-0 text-[#234e4b] opacity-[0.10] [mask-image:linear-gradient(#000,transparent),radial-gradient(#000,transparent)] [mask-composite:intersect]"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern id="cp-cta-grid" x="-1" y="-1" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="transparent" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect fill="url(#cp-cta-grid)" width="100%" height="100%" />
            </svg>
          </div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          {/* Rating badges */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-7">
            {BADGES.map(({ icon: Icon, full, half }, b) => (
              <div key={b} className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
                  <Icon className="size-4 text-[#234e4b]" strokeWidth={1.8} />
                </div>
                <div className="flex items-center text-[#ec6745]">
                  {Array.from({ length: full }).map((_, i) => (
                    <Star key={i} className="size-4 shrink-0" fill="currentColor" strokeWidth={0} />
                  ))}
                  {half && <StarHalf className="size-4 shrink-0" fill="currentColor" strokeWidth={0} />}
                </div>
              </div>
            ))}
          </div>

          {/* Headline + description */}
          <h2 className="max-w-lg text-balance text-4xl font-semibold tracking-tight text-[#234e4b] sm:text-5xl sm:leading-[1.05]">
            Give your website an AI agent today.
          </h2>
          <p className="mt-6 max-w-[560px] text-lg font-medium text-[#6c817e] sm:text-xl">
            Add your info, paste one line of code, and start answering customers
            and capturing leads around the clock.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex h-12 items-center rounded-full bg-[#ec6745] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
            >
              Create your agent →
            </a>
            <a
              href="#top"
              className="inline-flex h-12 items-center rounded-full border border-[#234e4b]/20 px-6 text-[15px] font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white"
            >
              See it in action
            </a>
          </div>

          {/* Works-with strip */}
          <p className="mt-14 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9aa8a4]">
            Works with your stack
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {WORKS_WITH.map((name) => (
              <span key={name} className="text-[15px] font-semibold text-[#5f7571]">
                {name}
              </span>
            ))}
          </div>
        </m.div>
      </section>
    </LazyMotion>
  );
}
