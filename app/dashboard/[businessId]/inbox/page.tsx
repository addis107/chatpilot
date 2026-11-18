import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const CARD = "rounded-2xl border border-[#e3d9d3] bg-white p-6";

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e3d9d3] py-10 text-center text-[#6c817e]">
      {label}
    </div>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="border-b border-[#e3d9d3] px-2.5 py-3 text-left text-sm font-semibold text-[#6c817e]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const TD = "border-b border-[#e3d9d3] px-2.5 py-3 text-sm text-[#234e4b]";
const MAIL = "text-[#ec6745] hover:underline";

const QUAL: Record<string, { label: string; cls: string }> = {
  qualified: { label: "Qualified", cls: "bg-[#e3f1ea] text-[#1f8a5b] border-[#bfe0cf]" },
  follow_up: { label: "Follow-up", cls: "bg-[#fdf2e3] text-[#b8771f] border-[#f1dcb6]" },
  not_fit: { label: "Not a fit", cls: "bg-[#f1ece9] text-[#8a8176] border-[#e0d6cf]" },
  unknown: { label: "—", cls: "bg-transparent text-[#9aa8a4] border-transparent" },
};

function QualBadge({ value, reason }: { value: string; reason: string }) {
  const q = QUAL[value] ?? QUAL.unknown;
  return (
    <span
      title={reason || undefined}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${q.cls}`}
    >
      {q.label}
    </span>
  );
}

export default async function InboxPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      leads: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" } },
      handoffs: { orderBy: { createdAt: "desc" } },
      pendingReplies: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!business) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-[#6c817e] transition-colors hover:text-[#234e4b]">
          ← All agents
        </Link>
        <Link
          href={`/dashboard/${business.id}`}
          className="inline-flex h-11 items-center rounded-full border border-[#234e4b]/20 px-5 text-[15px] font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white"
        >
          Agent settings
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#234e4b]">
          Inbox
        </h1>
        <p className="mt-1 text-[15px] text-[#6c817e]">
          Everything {business.name}&apos;s agent has captured.
        </p>
      </div>

      {/* Leads */}
      <div className={CARD}>
        <h2 className="mb-4 text-lg font-semibold text-[#234e4b]">
          🧲 Leads ({business.leads.length})
        </h2>
        {business.leads.length === 0 ? (
          <Empty label="No leads yet." />
        ) : (
          <Table head={["Name", "Email", "Interested in", "Qualified?", "When"]}>
            {business.leads.map((l) => (
              <tr key={l.id}>
                <td className={TD}>{l.name}</td>
                <td className={TD}>
                  <a href={`mailto:${l.email}`} className={MAIL}>{l.email}</a>
                </td>
                <td className={TD}>{l.interest}</td>
                <td className={TD}>
                  <QualBadge value={l.qualification} reason={l.qualificationReason} />
                </td>
                <td className={TD}>{l.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Appointments */}
      <div className={CARD}>
        <h2 className="mb-4 text-lg font-semibold text-[#234e4b]">
          📅 Appointments ({business.appointments.length})
        </h2>
        {business.appointments.length === 0 ? (
          <Empty label="No appointments yet." />
        ) : (
          <Table head={["Ref", "Name", "Email", "Requested time", "Status"]}>
            {business.appointments.map((a) => (
              <tr key={a.id}>
                <td className={TD}>{a.ref}</td>
                <td className={TD}>{a.customerName}</td>
                <td className={TD}>
                  <a href={`mailto:${a.customerEmail}`} className={MAIL}>{a.customerEmail}</a>
                </td>
                <td className={TD}>{a.requestedTime}</td>
                <td className={TD}>{a.status}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Orders */}
      <div className={CARD}>
        <h2 className="mb-4 text-lg font-semibold text-[#234e4b]">
          🛒 Orders ({business.orders.length})
        </h2>
        {business.orders.length === 0 ? (
          <Empty label="No orders yet." />
        ) : (
          <Table head={["Ref", "Name", "Email", "Items", "Total", "Status"]}>
            {business.orders.map((o) => (
              <tr key={o.id}>
                <td className={TD}>{o.ref}</td>
                <td className={TD}>{o.customerName}</td>
                <td className={TD}>
                  <a href={`mailto:${o.customerEmail}`} className={MAIL}>{o.customerEmail}</a>
                </td>
                <td className={TD}>{o.items}</td>
                <td className={TD}>{o.total}</td>
                <td className={TD}>{o.status}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Handoffs */}
      <div className={CARD}>
        <h2 className="mb-4 text-lg font-semibold text-[#234e4b]">
          🙋 Human handoffs ({business.handoffs.length})
        </h2>
        {business.handoffs.length === 0 ? (
          <Empty label="No handoff requests yet." />
        ) : (
          <Table head={["Name", "Email", "Question", "When"]}>
            {business.handoffs.map((h) => (
              <tr key={h.id}>
                <td className={TD}>{h.customerName}</td>
                <td className={TD}>
                  <a href={`mailto:${h.customerEmail}`} className={MAIL}>{h.customerEmail}</a>
                </td>
                <td className={TD}>{h.question}</td>
                <td className={TD}>{h.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Pending replies (draft → approve → send via n8n/Slack) */}
      <div className={CARD}>
        <h2 className="mb-4 text-lg font-semibold text-[#234e4b]">
          📝 Pending replies ({business.pendingReplies.length})
        </h2>
        {business.pendingReplies.length === 0 ? (
          <Empty label="No drafts awaiting approval." />
        ) : (
          <Table head={["Question", "Draft (proposed)", "Customer", "Status", "When"]}>
            {business.pendingReplies.map((r) => (
              <tr key={r.id}>
                <td className={`${TD} max-w-[200px]`}>{r.question}</td>
                <td className={`${TD} max-w-[320px] text-[#6c817e]`}>{r.draft}</td>
                <td className={TD}>
                  <a href={`mailto:${r.customerEmail}`} className={MAIL}>{r.customerEmail}</a>
                </td>
                <td className={TD}>
                  <span className="inline-flex items-center rounded-full border border-[#f1dcb6] bg-[#fdf2e3] px-2.5 py-0.5 text-xs font-medium capitalize text-[#b8771f]">
                    {r.status}
                  </span>
                </td>
                <td className={TD}>{r.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
