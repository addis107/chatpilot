import Link from "next/link";
import { notFound } from "next/navigation";
import { Code2, ExternalLink, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db";
import { SKILLS, parseSkills } from "@/lib/skills";
import CopyButton from "@/components/CopyButton";
import AgentConfigForm from "@/components/dashboard/agent-config-form";
import DeleteAgentButton from "@/components/dashboard/delete-agent-button";

export const dynamic = "force-dynamic";

const CARD = "rounded-2xl border border-[#e3d9d3] bg-white p-6";
const BTN_GHOST =
  "inline-flex h-11 items-center rounded-full border border-[#234e4b]/20 px-5 text-[15px] font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white";

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { businessId } = await params;
  const { saved } = await searchParams;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
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
  if (!business) notFound();

  const enabled = parseSkills(business.enabledSkills);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const snippet = `<script src="${appUrl}/widget.js" data-widget-id="${business.widgetId}" async></script>`;
  // Optional: if the host site has logged-in users, it can pass their identity so
  // the agent already has name + email (no need to ask in chat).
  const identitySnippet = `<script>
  window.ChatPilot = {
    user: { name: "Sam Rivera", email: "sam@example.com" } // your logged-in user
  };
</script>
<script src="${appUrl}/widget.js" data-widget-id="${business.widgetId}" async></script>`;
  const inboxCount =
    business._count.leads +
    business._count.appointments +
    business._count.orders +
    business._count.handoffs +
    business._count.pendingReplies;

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
        <span className="font-medium text-[#234e4b]">{business.name}</span>
      </nav>

      {/* Settings - config on the left, stats + live preview pinned on the right */}
      <AgentConfigForm
        header={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#234e4b] text-2xl font-semibold text-white">
                {business.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[#234e4b]">
                  {business.name}
                </h1>
                <p className="mt-1 flex items-center gap-2 text-[15px] text-[#6c817e]">
                  <span>
                    Assistant: <span className="text-[#234e4b]">{business.agentName}</span>
                  </span>
                  <span className="text-[#d8cbc4]">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#1f8a5b]" />
                    Widget live
                  </span>
                </p>
              </div>
            </div>
            <Link href={`/dashboard/${business.id}/inbox`} className={BTN_GHOST}>
              Inbox ({inboxCount})
            </Link>
          </div>
        }
        stats={[
          { label: "Leads", value: business._count.leads },
          { label: "Appts", value: business._count.appointments },
          { label: "Orders", value: business._count.orders },
          { label: "Inbox", value: inboxCount },
        ]}
        documents={business.documents.map((d) => ({
          id: d.id,
          filename: d.filename,
          chars: d.content.length,
        }))}
        config={{
          id: business.id,
          name: business.name,
          agentName: business.agentName,
          greeting: business.greeting,
          themeColor: business.themeColor,
          knowledgeBase: business.knowledgeBase,
          products: business.products,
          availabilityNote: business.availabilityNote,
          qualificationRules: business.qualificationRules,
          notifyEmail: business.notifyEmail,
          n8nWebhookUrl: business.n8nWebhookUrl,
          slackWebhookUrl: business.slackWebhookUrl,
          autoReplyMessage: business.autoReplyMessage,
        }}
        skills={SKILLS}
        enabled={enabled}
        saved={Boolean(saved)}
      />

      {/* Embed */}
      <div className={CARD}>
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4f2] text-[#234e4b]">
            <Code2 className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[#234e4b]">Add it to your website</h2>
            <p className="mt-0.5 text-sm text-[#6c817e]">
              Paste this one line just before the closing &lt;/body&gt; tag.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#234e4b] bg-[#163230]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-[#8fb0aa]">
            <span className="size-2 rounded-full bg-[#ec6745]" />
            Embed snippet
          </div>
          <div className="whitespace-pre-wrap break-all px-4 py-3.5 font-mono text-[13px] leading-relaxed text-[#d7e6e3]">
            {snippet}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <CopyButton text={snippet} />
          <Link
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6c817e] transition-colors hover:text-[#ec6745]"
            href={`/embed/${business.widgetId}`}
            target="_blank"
          >
            Preview the chat
            <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {/* Optional: auto-identify logged-in visitors */}
        <details className="group mt-5 rounded-xl border border-[#e3d9d3] bg-[#faf6f4]">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-[#234e4b]">
            Have logged-in users? Skip asking for their details
            <span className="ml-auto text-[#9aa8a4] transition-transform group-open:rotate-90">
              ›
            </span>
          </summary>
          <div className="border-t border-[#ece3de] px-4 py-4">
            <p className="mb-3 text-[13px] leading-relaxed text-[#6c817e]">
              If your site knows who&apos;s signed in, use this version instead - have
              your site fill in the real user&apos;s name and email. The agent then
              already has their contact and won&apos;t ask for it.
            </p>
            <div className="overflow-hidden rounded-xl border border-[#234e4b] bg-[#163230]">
              <div className="whitespace-pre-wrap break-all px-4 py-3.5 font-mono text-[13px] leading-relaxed text-[#d7e6e3]">
                {identitySnippet}
              </div>
            </div>
            <div className="mt-3">
              <CopyButton text={identitySnippet} />
            </div>
          </div>
        </details>
      </div>

      {/* Danger */}
      <div className="rounded-2xl border border-[#e7c9c0] bg-[#fdf5f3] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f6ded6] text-[#c0462a]">
              <AlertTriangle className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#234e4b]">Delete this agent</h2>
              <p className="mt-0.5 max-w-md text-sm text-[#6c817e]">
                Permanently removes the agent and all its data - leads, orders,
                bookings and documents. This can&apos;t be undone.
              </p>
            </div>
          </div>
          <DeleteAgentButton businessId={business.id} businessName={business.name} />
        </div>
      </div>
    </div>
  );
}
