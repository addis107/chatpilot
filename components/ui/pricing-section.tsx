"use client";

import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { ArrowRight, CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import { useId, useRef, useState } from "react";

const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif";

const PricingSwitch = ({
  button1,
  button2,
  onSwitch,
  className,
  layoutId,
}: {
  button1: string;
  button2: string;
  onSwitch: (value: string) => void;
  className?: string;
  layoutId?: string;
}) => {
  const [selected, setSelected] = useState("0");
  const uniqueId = useId();
  const switchLayoutId = layoutId || `switch-${uniqueId}`;

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  const pill = (
    <motion.span
      layoutId={switchLayoutId}
      className="absolute left-0 top-0 h-10 w-full rounded-full bg-[#ec6745] sm:h-14"
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  );

  return (
    <div
      className={cn(
        "relative z-10 flex w-full rounded-full border border-[#e3d9d3] bg-[#f8f4f1] p-1",
        className
      )}
    >
      <button
        onClick={() => handleSwitch("0")}
        className={cn(
          "relative z-10 h-10 w-full rounded-full px-3 py-1 font-medium transition-colors sm:h-14 sm:px-6 sm:py-2",
          selected === "0" ? "text-white" : "text-[#6c817e] hover:text-[#234e4b]"
        )}
      >
        {selected === "0" && pill}
        <span className="relative">{button1}</span>
      </button>
      <button
        onClick={() => handleSwitch("1")}
        className={cn(
          "relative z-10 h-10 w-full flex-shrink-0 rounded-full px-3 py-1 font-medium transition-colors sm:h-14 sm:px-6 sm:py-2",
          selected === "1" ? "text-white" : "text-[#6c817e] hover:text-[#234e4b]"
        )}
      >
        {selected === "1" && pill}
        <span className="relative flex items-center justify-center gap-2">{button2}</span>
      </button>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.3, duration: 0.5 },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };
  const timelineVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  const toggleYearly = (v: string) => setIsYearly(Number.parseInt(v) === 1);
  const togglePlan = (v: string) => setIsPro(Number.parseInt(v) === 1);

  const price = isPro ? (isYearly ? 39 : 49) : isYearly ? 15 : 19;
  const original = isPro ? (isYearly ? 49 : 69) : isYearly ? 19 : 29;

  const features = [
    "Your own AI website agent",
    "Answers questions 24/7 from your info",
    "Captures leads, bookings & orders",
    "Upload PDFs & docs for its knowledge",
    "Connect Slack, Sheets, Gmail & n8n",
    "Leads inbox + email alerts",
    "No code - live in minutes",
  ];

  return (
    <section
      id="pricing"
      ref={pricingRef}
      style={{ fontFamily: FONT }}
      className="relative w-full overflow-hidden bg-[#f3ece9] px-4 py-20 sm:py-24"
    >
      <div className="relative z-10">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-semibold leading-[120%] text-[#234e4b] sm:text-4xl md:text-5xl">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-center"
              transition={{ type: "spring", stiffness: 250, damping: 40, delay: 0.4 }}
            >
              Pricing made simple
            </VerticalCutReveal>
          </h1>

          <TimelineContent
            as="p"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-xl text-[#6c817e]"
          >
            Start free. Upgrade when your agent is winning leads - cancel anytime.
          </TimelineContent>
        </div>

        {/* Body */}
        <div className="mt-14 px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-8 sm:grid-cols-2 md:gap-12">
              {/* What's included */}
              <div>
                <TimelineContent
                  as="h3"
                  animationNum={2}
                  timelineRef={pricingRef}
                  customVariants={revealVariants}
                  className="mb-4 text-3xl font-medium text-[#234e4b]"
                >
                  What&apos;s included
                </TimelineContent>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <TimelineContent
                      key={index}
                      as="div"
                      animationNum={3 + index}
                      timelineRef={pricingRef}
                      customVariants={timelineVariants}
                      className="flex items-center"
                    >
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#ec6745]">
                        <CheckCheck className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[#3a5450]">{feature}</span>
                    </TimelineContent>
                  ))}
                </div>
              </div>

              {/* Controls + price */}
              <div className="space-y-10">
                <TimelineContent
                  as="div"
                  animationNum={3}
                  timelineRef={pricingRef}
                  customVariants={revealVariants}
                >
                  <h4 className="mb-2 font-semibold text-[#234e4b]">Billing</h4>
                  <p className="mb-2 text-sm text-[#6c817e]">
                    Pay monthly, or save with yearly.
                  </p>
                  <PricingSwitch
                    button1="Monthly"
                    button2="Yearly"
                    onSwitch={toggleYearly}
                    className="grid w-full grid-cols-2 gap-2"
                  />
                </TimelineContent>

                <TimelineContent
                  as="div"
                  animationNum={4}
                  timelineRef={pricingRef}
                  customVariants={revealVariants}
                >
                  <h4 className="mb-1 font-semibold text-[#234e4b]">Plan</h4>
                  <p className="mb-2 text-sm text-[#6c817e]">
                    Starter for small sites, Pro for busy ones.
                  </p>
                  <PricingSwitch
                    button1="Starter"
                    button2="Pro"
                    onSwitch={togglePlan}
                    className="grid w-full grid-cols-2 gap-2"
                  />
                </TimelineContent>

                <TimelineContent
                  as="div"
                  animationNum={5}
                  timelineRef={pricingRef}
                  customVariants={revealVariants}
                  className="grid grid-cols-2 items-center gap-6 px-2 text-center"
                >
                  <div className="flex items-center">
                    <span className="text-5xl font-semibold text-[#234e4b]">
                      $
                      <NumberFlow value={price} className="text-5xl font-semibold" />
                    </span>
                    <span className="relative ml-2 text-xl text-[#6c817e] line-through before:absolute before:left-0 before:top-3.5 before:z-10 before:h-0.5 before:w-full before:bg-[#6c817e] before:content-['']">
                      $
                      <NumberFlow value={original} className="text-xl font-semibold line-through" />
                    </span>
                  </div>
                  {/* Same button (and flip animation) as the hero. */}
                  <a
                    href="/dashboard"
                    className="n3-flip inline-flex h-13 items-center rounded-full bg-[#ec6745] px-7 text-[16px] font-medium text-white sm:h-14"
                  >
                    <span className="n3-flip-box">
                      <span className="n3-flip-face gap-2.5">
                        Create your agent
                        <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
                      </span>
                      <span aria-hidden className="n3-flip-face n3-flip-back gap-2.5">
                        Create your agent
                        <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
                      </span>
                    </span>
                  </a>
                </TimelineContent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
