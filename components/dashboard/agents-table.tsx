"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

export type AgentRow = {
  id: string;
  name: string;
  agentName: string;
  skills: number;
  leads: number;
  inbox: number;
  createdAt: string; // ISO
};

const col = createColumnHelper<AgentRow>();

const columns = [
  col.accessor("name", {
    header: "Business",
    cell: (c) => (
      <Link
        href={`/dashboard/${c.row.original.id}`}
        className="font-semibold text-[#234e4b] hover:text-[#ec6745]"
      >
        {c.getValue()}
      </Link>
    ),
  }),
  col.accessor("agentName", {
    header: "Assistant",
    cell: (c) => <span className="text-[#6c817e]">{c.getValue()}</span>,
  }),
  col.accessor("skills", {
    header: "Skills",
    cell: (c) => <span className="tabular-nums text-[#234e4b]">{c.getValue()} on</span>,
  }),
  col.accessor("leads", {
    header: "Leads",
    cell: (c) => <span className="tabular-nums text-[#234e4b]">{c.getValue()}</span>,
  }),
  col.accessor("inbox", {
    header: "Inbox",
    cell: (c) => <span className="tabular-nums text-[#234e4b]">{c.getValue()}</span>,
  }),
  col.accessor("createdAt", {
    header: "Created",
    cell: (c) => (
      <span className="text-[#6c817e]">
        {new Date(c.getValue()).toLocaleDateString()}
      </span>
    ),
  }),
  col.display({
    id: "actions",
    header: "",
    cell: (c) => (
      <Link
        href={`/dashboard/${c.row.original.id}`}
        className="text-[15px] font-medium text-[#6c817e] hover:text-[#ec6745]"
      >
        Manage →
      </Link>
    ),
  }),
];

export default function AgentsTable({
  data,
  action,
}: {
  data: AgentRow[];
  action?: ReactNode;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search agents…"
          className="h-11 w-full max-w-xs rounded-full border border-[#e3d9d3] bg-[#faf6f4] px-4 text-[14px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:ring-2 focus:ring-[#ec6745]/20"
        />
        {action}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#e3d9d3]">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-[#faf6f4]">
                {hg.headers.map((h) => {
                  const sortable = h.column.getCanSort();
                  const dir = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      onClick={sortable ? h.column.getToggleSortingHandler() : undefined}
                      className={`border-b border-[#e3d9d3] px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6c817e] ${
                        sortable ? "cursor-pointer select-none hover:text-[#234e4b]" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {dir === "asc" && <span className="text-[#ec6745]">▲</span>}
                        {dir === "desc" && <span className="text-[#ec6745]">▼</span>}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[#6c817e]"
                >
                  No agents found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="bg-white transition-colors hover:bg-[#faf6f4]">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-[#e3d9d3] px-4 py-2.5 text-[14px] last:text-right"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-[#6c817e]">
        {table.getFilteredRowModel().rows.length} of {data.length} agent
        {data.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
