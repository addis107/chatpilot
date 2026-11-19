"use client";

import { useState } from "react";
import {
  Magnet,
  CalendarCheck,
  ShoppingCart,
  Headset,
  PencilLine,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type Row = Record<string, string>;
type Col = { header: string; key: string; cell?: (r: Row) => React.ReactNode; tdClass?: string };

export type InboxData = {
  leads: Row[];
  appointments: Row[];
  orders: Row[];
  handoffs: Row[];
  pendingReplies: Row[];
};

const PAGE_SIZE = 8;
const MAIL = "text-[#ec6745] hover:underline";

const QUAL: Record<string, { label: string; cls: string }> = {
  qualified: { label: "Qualified", cls: "bg-[#e3f1ea] text-[#1f8a5b] border-[#bfe0cf]" },
  follow_up: { label: "Follow-up", cls: "bg-[#fdf2e3] text-[#b8771f] border-[#f1dcb6]" },
  not_fit: { label: "Not a fit", cls: "bg-[#f1ece9] text-[#8a8176] border-[#e0d6cf]" },
  unknown: { label: "-", cls: "bg-transparent text-[#9aa8a4] border-transparent" },
};

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {children}
    </span>
  );
}

function mail(email: string) {
  return <a href={`mailto:${email}`} className={MAIL}>{email}</a>;
}

export default function InboxTabs({ data }: { data: InboxData }) {
  const tabs: {
    key: keyof InboxData;
    label: string;
    icon: LucideIcon;
    empty: string;
    columns: Col[];
    rows: Row[];
  }[] = [
    {
      key: "leads",
      label: "Leads",
      icon: Magnet,
      empty: "No leads yet.",
      rows: data.leads,
      columns: [
        { header: "Name", key: "name" },
        { header: "Email", key: "email", cell: (r) => mail(r.email) },
        { header: "Interested in", key: "interest" },
        {
          header: "Qualified?",
          key: "qualification",
          cell: (r) => {
            const q = QUAL[r.qualification] ?? QUAL.unknown;
            return (
              <span title={r.qualificationReason || undefined}>
                <Badge cls={q.cls}>{q.label}</Badge>
              </span>
            );
          },
        },
        { header: "When", key: "when", tdClass: "text-[#6c817e]" },
      ],
    },
    {
      key: "appointments",
      label: "Appointments",
      icon: CalendarCheck,
      empty: "No appointments yet.",
      rows: data.appointments,
      columns: [
        { header: "Ref", key: "ref", tdClass: "font-mono text-[13px]" },
        { header: "Name", key: "name" },
        { header: "Email", key: "email", cell: (r) => mail(r.email) },
        { header: "Requested time", key: "requestedTime" },
        { header: "Status", key: "status", tdClass: "capitalize text-[#6c817e]" },
      ],
    },
    {
      key: "orders",
      label: "Orders",
      icon: ShoppingCart,
      empty: "No orders yet.",
      rows: data.orders,
      columns: [
        { header: "Ref", key: "ref", tdClass: "font-mono text-[13px]" },
        { header: "Name", key: "name" },
        { header: "Email", key: "email", cell: (r) => mail(r.email) },
        { header: "Items", key: "items" },
        { header: "Total", key: "total" },
        { header: "Status", key: "status", tdClass: "capitalize text-[#6c817e]" },
      ],
    },
    {
      key: "handoffs",
      label: "Human handoffs",
      icon: Headset,
      empty: "No handoff requests yet.",
      rows: data.handoffs,
      columns: [
        { header: "Name", key: "name" },
        { header: "Email", key: "email", cell: (r) => mail(r.email) },
        { header: "Question", key: "question" },
        { header: "When", key: "when", tdClass: "text-[#6c817e]" },
      ],
    },
    {
      key: "pendingReplies",
      label: "Pending replies",
      icon: PencilLine,
      empty: "No drafts awaiting approval.",
      rows: data.pendingReplies,
      columns: [
        { header: "Question", key: "question", tdClass: "max-w-[220px] truncate" },
        { header: "Draft (proposed)", key: "draft", tdClass: "max-w-[320px] truncate text-[#6c817e]" },
        { header: "Customer", key: "email", cell: (r) => mail(r.email) },
        {
          header: "Status",
          key: "status",
          cell: (r) => (
            <Badge cls="bg-[#fdf2e3] text-[#b8771f] border-[#f1dcb6]">
              <span className="capitalize">{r.status}</span>
            </Badge>
          ),
        },
        { header: "When", key: "when", tdClass: "text-[#6c817e]" },
      ],
    },
  ];

  const [activeKey, setActiveKey] = useState<keyof InboxData>("leads");
  const [page, setPage] = useState(0);

  const active = tabs.find((t) => t.key === activeKey)!;
  const total = active.rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const start = safePage * PAGE_SIZE;
  const pageRows = active.rows.slice(start, start + PAGE_SIZE);

  function go(key: keyof InboxData) {
    setActiveKey(key);
    setPage(0);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#e3d9d3]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = t.key === activeKey;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => go(t.key)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                on
                  ? "border-[#ec6745] text-[#234e4b]"
                  : "border-transparent text-[#6c817e] hover:text-[#234e4b]"
              }`}
            >
              <Icon className="size-[16px]" strokeWidth={1.75} />
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                  on ? "bg-[#ec6745] text-white" : "bg-[#ece3de] text-[#6c817e]"
                }`}
              >
                {t.rows.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {total === 0 ? (
        <div className="mt-4 border border-dashed border-[#e3d9d3] py-12 text-center text-[#6c817e]">
          {active.empty}
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto border border-[#e3d9d3]">
            <table className="w-full border-collapse [&_tbody_tr]:bg-white [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[#faf6f4]">
              <thead>
                <tr className="bg-[#faf6f4]">
                  {active.columns.map((c) => (
                    <th
                      key={c.header}
                      className="border-b border-[#e3d9d3] px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6c817e]"
                    >
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    {active.columns.map((c) => (
                      <td
                        key={c.header}
                        className={`border-b border-[#e3d9d3] px-4 py-2.5 text-[14px] text-[#234e4b] ${c.tdClass ?? ""}`}
                      >
                        {c.cell ? c.cell(r) : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[13px] text-[#6c817e]">
              Showing {start + 1}-{start + pageRows.length} of {total}
            </p>
            {pages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-[#e3d9d3] text-[#234e4b] transition-colors hover:border-[#ec6745] hover:text-[#ec6745] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[13px] tabular-nums text-[#6c817e]">
                  {safePage + 1} / {pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                  disabled={safePage >= pages - 1}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-[#e3d9d3] text-[#234e4b] transition-colors hover:border-[#ec6745] hover:text-[#ec6745] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
