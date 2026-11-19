import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import InboxTabs from "@/components/dashboard/inbox-tabs";

export const dynamic = "force-dynamic";

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

  // Format on the server (dates etc.) so the client table is pure display.
  const data = {
    leads: business.leads.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      interest: l.interest,
      qualification: l.qualification,
      qualificationReason: l.qualificationReason,
      when: l.createdAt.toLocaleString(),
    })),
    appointments: business.appointments.map((a) => ({
      id: a.id,
      ref: a.ref,
      name: a.customerName,
      email: a.customerEmail,
      requestedTime: a.requestedTime,
      status: a.status,
    })),
    orders: business.orders.map((o) => ({
      id: o.id,
      ref: o.ref,
      name: o.customerName,
      email: o.customerEmail,
      items: o.items,
      total: o.total,
      status: o.status,
    })),
    handoffs: business.handoffs.map((h) => ({
      id: h.id,
      name: h.customerName,
      email: h.customerEmail,
      question: h.question,
      when: h.createdAt.toLocaleString(),
    })),
    pendingReplies: business.pendingReplies.map((r) => ({
      id: r.id,
      question: r.question,
      draft: r.draft,
      email: r.customerEmail,
      status: r.status,
      when: r.createdAt.toLocaleString(),
    })),
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-[#6c817e] transition-colors hover:text-[#234e4b]"
        >
          Agents
        </Link>
        <span className="text-[#d8cbc4]">/</span>
        <Link
          href={`/dashboard/${business.id}`}
          className="text-[#6c817e] transition-colors hover:text-[#234e4b]"
        >
          {business.name}
        </Link>
        <span className="text-[#d8cbc4]">/</span>
        <span className="font-medium text-[#234e4b]">Inbox</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#234e4b]">
            Inbox
          </h1>
          <p className="mt-1 text-[15px] text-[#6c817e]">
            Everything {business.name}&apos;s agent has captured.
          </p>
        </div>
        <Link
          href={`/dashboard/${business.id}`}
          className="inline-flex h-11 items-center rounded-full border border-[#234e4b]/20 px-5 text-[15px] font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white"
        >
          Agent settings
        </Link>
      </div>

      <InboxTabs data={data} />
    </div>
  );
}
