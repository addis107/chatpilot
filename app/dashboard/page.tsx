import Link from "next/link";
import { prisma } from "@/lib/db";
import { createBusiness } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#234e4b]">
          Your agents
        </h1>
        <p className="mt-1 text-[15px] text-[#6c817e]">
          Create and manage the AI agents on your websites.
        </p>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-[#e3d9d3] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#234e4b]">Create a new agent</h2>
        <p className="mt-1 text-sm text-[#6c817e]">
          Each agent is for one business. Give it a name to get started.
        </p>
        <form action={createBusiness} className="mt-5 flex flex-wrap gap-3">
          <input
            type="text"
            name="name"
            placeholder="e.g. Bella's Bakery"
            required
            className="h-11 flex-grow rounded-full border border-[#e3d9d3] bg-[#faf6f4] px-4 text-[15px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:ring-2 focus:ring-[#ec6745]/20 sm:max-w-xs"
          />
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-[#ec6745] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]"
          >
            Create agent
          </button>
        </form>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[#e3d9d3] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#234e4b]">All agents</h2>
          <span className="text-sm text-[#6c817e]">{businesses.length} total</span>
        </div>

        {businesses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e3d9d3] py-12 text-center text-[#6c817e]">
            No agents yet — create your first one above.
          </div>
        ) : (
          <div className="grid gap-3">
            {businesses.map((b) => (
              <Link
                key={b.id}
                href={`/dashboard/${b.id}`}
                className="group flex items-center justify-between rounded-xl border border-[#e3d9d3] bg-[#faf6f4] px-5 py-4 transition-colors hover:border-[#ec6745]"
              >
                <div>
                  <p className="font-semibold text-[#234e4b]">{b.name}</p>
                  <p className="mt-0.5 text-[13px] text-[#6c817e]">
                    Agent: {b.agentName} · {b._count.leads} lead
                    {b._count.leads === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-[15px] font-medium text-[#6c817e] transition-colors group-hover:text-[#ec6745]">
                  Manage →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
