"use client";

import { useRef, useTransition } from "react";
import { BookOpen, Upload, FileText, X, Loader2 } from "lucide-react";
import { uploadDocument, deleteDocument } from "@/app/actions";

type Doc = { id: string; filename: string; chars: number };

export default function KnowledgeManager({
  businessId,
  defaultValue,
  documents,
}: {
  businessId: string;
  defaultValue: string;
  documents: Doc[];
}) {
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("businessId", businessId);
    fd.set("file", file);
    start(() => uploadDocument(fd));
    e.target.value = ""; // allow re-uploading the same filename
  }

  function remove(id: string) {
    const fd = new FormData();
    fd.set("docId", id);
    fd.set("businessId", businessId);
    start(() => deleteDocument(fd));
  }

  return (
    <div className="rounded-xl border border-[#e3d9d3] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#ece3de] px-3.5 py-2.5">
        <BookOpen className="size-4 text-[#ec6745]" strokeWidth={1.75} />
        <span className="text-[13px] font-semibold text-[#234e4b]">Business knowledge</span>
        <span className="ml-auto rounded-full bg-[#f3ece9] px-2.5 py-0.5 text-[11px] font-medium text-[#6c817e]">
          Type or upload
        </span>
      </div>

      {/* Type */}
      <div className="px-3.5 py-3">
        <textarea
          name="knowledgeBase"
          defaultValue={defaultValue}
          rows={6}
          placeholder={
            "Type what the agent should know - prices, services, hours, FAQs…\n\nExample:\nWe are open Mon–Sat 9am–6pm.\nDelivery is free over $50."
          }
          className="block w-full resize-y rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 py-2 text-[14px] leading-relaxed text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:shadow-none"
        />
      </div>

      {/* Upload */}
      <div className="space-y-3 border-t border-[#ece3de] px-3.5 py-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#c9bcb4] px-4 py-2.5 text-[13px] font-medium text-[#6c817e] transition-colors hover:border-[#ec6745] hover:text-[#ec6745] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" strokeWidth={1.75} />
          )}
          {pending ? "Reading file…" : "Upload a file - .pdf, .txt or .md"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={onFile}
          className="hidden"
        />

        {documents.length > 0 && (
          <ul className="space-y-2">
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 py-2"
              >
                <FileText className="size-4 shrink-0 text-[#ec6745]" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#234e4b]">
                  {d.filename}
                  <span className="ml-2 font-normal text-[#9aa8a4]">
                    {d.chars.toLocaleString()} chars
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  disabled={pending}
                  aria-label={`Remove ${d.filename}`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#9aa8a4] transition-colors hover:bg-[#ec6745] hover:text-white disabled:opacity-60"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
