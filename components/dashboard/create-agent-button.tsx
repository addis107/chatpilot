"use client";

import { useEffect, useState } from "react";
import { createBusiness } from "@/app/actions";

export default function CreateAgentButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-11 shrink-0 items-center rounded-full bg-[#ec6745] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
      >
        + New agent
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#234e4b]/35"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl border border-[#e3d9d3] bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-[#234e4b]">
              Create a new agent
            </h2>
            <p className="mt-1 text-sm text-[#6c817e]">
              Each agent is for one business. Give it a name to get started.
            </p>

            <form action={createBusiness} className="mt-5">
              <input
                type="text"
                name="name"
                placeholder="e.g. Bella's Bakery"
                required
                autoFocus
                className="h-11 w-full rounded-full border border-[#e3d9d3] bg-[#faf6f4] px-4 text-[15px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:ring-2 focus:ring-[#ec6745]/20"
              />
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center rounded-full border border-[#234e4b]/20 px-5 text-[15px] font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-full bg-[#ec6745] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
                >
                  Create agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
