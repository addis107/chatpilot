"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteBusiness } from "@/app/actions";

export default function DeleteAgentButton({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
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
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-[#c0462a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a53a21]"
      >
        <Trash2 className="size-4" />
        Delete
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
            <div className="flex items-start gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f6ded6] text-[#c0462a]">
                <AlertTriangle className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[#234e4b]">
                  Delete {businessName}?
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#6c817e]">
                  This permanently deletes the agent and all its data - leads,
                  orders, bookings and documents. This can&apos;t be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center rounded-full border border-[#234e4b]/20 px-5 text-sm font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white"
              >
                Cancel
              </button>
              <form action={deleteBusiness}>
                <input type="hidden" name="id" value={businessId} />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#c0462a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a53a21]"
                >
                  <Trash2 className="size-4" />
                  Delete agent
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
