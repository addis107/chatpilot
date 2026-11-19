"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2, type LucideIcon } from "lucide-react";
import { extractDocumentText } from "@/app/actions";

export default function UploadableTextField({
  icon: Icon,
  title,
  usedBy,
  name,
  defaultValue,
  placeholder,
  rows = 5,
}: {
  icon: LucideIcon;
  title: string;
  usedBy?: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const text = await extractDocumentText(fd);
      if (text) {
        setValue((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
      }
    });
    e.target.value = ""; // allow re-uploading the same filename
  }

  return (
    <div className="rounded-xl border border-[#e3d9d3] bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-[#ece3de] px-3.5 py-2.5">
        <Icon className="size-4 text-[#ec6745]" strokeWidth={1.75} />
        <span className="text-[13px] font-semibold text-[#234e4b]">{title}</span>
        {usedBy && (
          <span className="ml-auto rounded-full bg-[#f3ece9] px-2.5 py-0.5 text-[11px] font-medium text-[#6c817e]">
            {usedBy}
          </span>
        )}
      </div>

      {/* Type */}
      <div className="px-3.5 py-3">
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="block w-full resize-y rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 py-2 text-[14px] leading-relaxed text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:shadow-none"
        />
      </div>

      {/* Upload */}
      <div className="border-t border-[#ece3de] px-3.5 py-3">
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
          {pending ? "Reading file…" : "Upload a file instead - .pdf, .txt or .md"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={onFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
