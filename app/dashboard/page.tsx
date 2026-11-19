import { prisma } from "@/lib/db";
import { parseSkills } from "@/lib/skills";
import AgentsTable, { type AgentRow } from "@/components/dashboard/agents-table";
import CreateAgentButton from "@/components/dashboard/create-agent-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          leads: true,
          appointments: true,
          orders: true,
          handoffs: true,
          pendingReplies: true,
        },
      },
    },
  });

  const rows: AgentRow[] = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    agentName: b.agentName,
    skills: parseSkills(b.enabledSkills).length,
    leads: b._count.leads,
    inbox:
      b._count.leads +
      b._count.appointments +
      b._count.orders +
      b._count.handoffs +
      b._count.pendingReplies,
    createdAt: b.createdAt.toISOString(),
  }));

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

      {/* Table */}
      <AgentsTable data={rows} action={<CreateAgentButton />} />
    </div>
  );
}
