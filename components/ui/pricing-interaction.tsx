"use client";

import NumberFlow from "@number-flow/react";
import React from "react";

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
}) {
  const [active, setActive] = React.useState(0);
  const [period, setPeriod] = React.useState(0);
  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);

  const handleChangePlan = (index: number) => setActive(index);
  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
    }
  };

  const radio = (on: boolean) => (
    <div
      className="mt-0.5 flex size-6 items-center justify-center rounded-full border-2 p-1"
      style={{ borderColor: on ? "#ec6745" : "#b9c3bf", transition: "border-color 0.3s" }}
    >
      <div
        className="size-3 rounded-full bg-[#ec6745]"
        style={{ opacity: on ? 1 : 0, transition: "opacity 0.3s" }}
      />
    </div>
  );

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-[32px] border border-[#e3d9d3] bg-white p-3 shadow-[0_14px_40px_-12px_rgba(35,78,75,0.18)]">
      {/* Monthly / Yearly toggle */}
      <div className="relative flex w-full items-center rounded-full bg-[#f1ebe7] p-1.5">
        <button
          className="z-20 w-full rounded-full p-1.5 font-semibold text-[#234e4b]"
          onClick={() => handleChangePeriod(0)}
        >
          Monthly
        </button>
        <button
          className="z-20 w-full rounded-full p-1.5 font-semibold text-[#234e4b]"
          onClick={() => handleChangePeriod(1)}
        >
          Yearly
        </button>
        <div
          className="absolute inset-0 z-10 flex w-1/2 items-center justify-center p-1.5"
          style={{ transform: `translateX(${period * 100}%)`, transition: "transform 0.3s" }}
        >
          <div className="h-full w-full rounded-full bg-white shadow-sm" />
        </div>
      </div>

      {/* Plans */}
      <div className="relative flex w-full flex-col items-center justify-center gap-3">
        {/* Free */}
        <div
          className="flex w-full cursor-pointer justify-between rounded-2xl border-2 border-[#e3d9d3] p-4"
          onClick={() => handleChangePlan(0)}
        >
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold text-[#234e4b]">Free</p>
            <p className="text-md text-[#6c817e]">
              <span className="font-medium text-[#234e4b]">$0</span>/month
            </p>
          </div>
          {radio(active === 0)}
        </div>

        {/* Starter */}
        <div
          className="flex w-full cursor-pointer justify-between rounded-2xl border-2 border-[#e3d9d3] p-4"
          onClick={() => handleChangePlan(1)}
        >
          <div className="flex flex-col items-start">
            <p className="flex items-center gap-2 text-xl font-semibold text-[#234e4b]">
              Starter{" "}
              <span className="block rounded-lg bg-[#fdeee9] px-2 py-1 text-sm text-[#ec6745]">
                Popular
              </span>
            </p>
            <p className="text-md flex text-[#6c817e]">
              <span className="flex items-center font-medium text-[#234e4b]">
                ${" "}
                <NumberFlow className="font-medium text-[#234e4b]" value={starter} />
              </span>
              /month
            </p>
          </div>
          {radio(active === 1)}
        </div>

        {/* Pro */}
        <div
          className="flex w-full cursor-pointer justify-between rounded-2xl border-2 border-[#e3d9d3] p-4"
          onClick={() => handleChangePlan(2)}
        >
          <div className="flex flex-col items-start">
            <p className="text-xl font-semibold text-[#234e4b]">Pro</p>
            <p className="text-md flex text-[#6c817e]">
              <span className="flex items-center font-medium text-[#234e4b]">
                ${" "}
                <NumberFlow className="font-medium text-[#234e4b]" value={pro} />
              </span>
              /month
            </p>
          </div>
          {radio(active === 2)}
        </div>

        {/* Sliding selection border */}
        <div
          className="absolute top-0 h-[88px] w-full rounded-2xl border-[3px] border-[#ec6745]"
          style={{
            transform: `translateY(${active * 88 + 12 * active}px)`,
            transition: "transform 0.3s",
          }}
        />
      </div>

      <a
        href="/dashboard"
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#ec6745] text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
      >
        Create your agent →
      </a>
    </div>
  );
}
