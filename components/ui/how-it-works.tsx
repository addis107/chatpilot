"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "motion/react";

const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif";

interface CardProps {
  number: string;
  title: string;
  description: string;
  className?: string;
  rotate?: string;
  colors: {
    bg: string;
    text: string;
    border: string;
  };
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({ number, title, description, className, rotate, colors }: CardProps) => {
  return (
    <div
      className={`relative w-full md:w-[280px] transition-transform duration-300 hover:z-30 hover:scale-105 ${rotate} ${className}`}
    >
      <div className="rounded-[25px] border border-[#e3d9d3] bg-white p-2">
        <Pin className={`mx-auto mb-6 z-20 h-8 w-8 ${colors.text}`} />
        <div
          className={`${colors.bg} border ${colors.border} rounded-[15px] p-[15px] h-full flex flex-col relative overflow-hidden`}
        >
          <span
            className={`${colors.text} text-4xl mb-5`}
            style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
          >
            {number}
          </span>
          <h3 className="mb-[10px] text-2xl font-semibold leading-none text-[#234e4b]">
            {title}
          </h3>
          <p className="text-sm/5 tracking-tight text-[#6c817e]">{description}</p>
        </div>
      </div>
    </div>
  );
};

export interface Step {
  title: string;
  description: string;
  colors: { bg: string; text: string; border: string };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const CORAL = { bg: "bg-[#fdeee9]", text: "text-[#ec6745]", border: "border-[#f6d7cc]" };
const TEAL = { bg: "bg-[#e9efed]", text: "text-[#234e4b]", border: "border-[#cfe0db]" };

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-[8deg]" },
  { className: "md:absolute md:top-[120px] md:right-[15%]", rotate: "-rotate-[8deg]" },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "rotate-[8deg]" },
  { className: "md:absolute md:top-[570px] md:right-[10%]", rotate: "-rotate-[8deg]" },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "rotate-[8deg]" },
];

export default function HowItWorks({ features, className, stepPositions }: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Add your business info",
      description:
        "Paste your prices, hours and FAQs - or upload a PDF. That becomes your agent's brain.",
      colors: CORAL,
    },
    {
      title: "Copy one line of code",
      description:
        "Drop the snippet onto your site. The chat widget appears instantly - no developer needed.",
      colors: TEAL,
    },
    {
      title: "Collect leads on autopilot",
      description:
        "Your agent answers customers 24/7 and sends every lead, booking and order to your tools.",
      colors: CORAL,
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 1130;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 450;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 900;
  else height = 1130;

  return (
    <LazyMotion features={domAnimation}>
      <div
        id="how"
        style={{ fontFamily: FONT }}
        className={`relative bg-[#f3ece9] px-8 max-md:pt-10 max-md:pb-24 md:py-20 ${className ?? ""}`}
      >
        {/* Ruled-paper lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(#234e4b 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
        />
        {/* Side fades to ivory */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#f3ece9]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#f3ece9]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Heading */}
          <div className="mx-auto mb-14 max-w-2xl text-center md:mb-6">
            <h2 className="text-3xl font-semibold tracking-tight text-[#234e4b] sm:text-[2.6rem] sm:leading-[1.08]">
              Live in three simple steps.
            </h2>
          </div>

          <div
            className="relative mx-auto flex h-auto w-full max-w-[1000px] flex-col space-y-8 md:block md:h-[var(--md-height)] md:space-y-0"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {data.length > 1 && (
              <svg
                className="pointer-events-none absolute left-0 top-0 z-0 hidden h-full w-full md:block"
                viewBox={`0 0 1000 ${height}`}
                preserveAspectRatio="none"
              >
                {(() => {
                  const pathD = data.reduce((acc, _, index) => {
                    if (index >= data.length - 1) return acc;
                    if (index === 0) return "M 290 150 C 500 150, 550 270, 710 270";
                    if (index === 1) return acc + " C 850 270, 500 350, 290 450";
                    if (index === 2) return acc + " C 290 600, 550 720, 750 720";
                    if (index === 3) return acc + " C 950 720, 500 800, 290 850";
                    return acc;
                  }, "");
                  return (
                    <m.path
                      d={pathD}
                      stroke="currentColor"
                      className="text-[#ec6745]/50"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -140 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  );
                })()}
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % positions.length];
              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
