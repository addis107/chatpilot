import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  updateBusiness,
  deleteBusiness,
  uploadDocument,
  deleteDocument,
} from "@/app/actions";
import { SKILLS, parseSkills } from "@/lib/skills";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

const CARD = "rounded-2xl border border-[#e3d9d3] bg-white p-6";
const LABEL = "mb-1.5 block text-sm font-medium text-[#234e4b]";
const FIELD =
  "w-full rounded-xl border border-[#e3d9d3] bg-[#faf6f4] px-3.5 py-2.5 text-[15px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:ring-2 focus:ring-[#ec6745]/20";
const BTN_PRIMARY =
  "inline-flex h-11 items-center rounded-full bg-[#ec6745] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]";
const BTN_GHOST =
  "inline-flex h-11 items-center rounded-full border border-[#234e4b]/20 px-5 text-[15px] font-medium text-[#234e4b] transition-colors hover:bg-[#234e4b] hover:text-white";
const BTN_DANGER =
  "inline-flex h-10 items-center rounded-full border border-[#e3b4ab] px-4 text-sm font-medium text-[#d9542f] transition-colors hover:bg-[#ec6745] hover:text-white";

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
  const inboxCount =
    business._count.leads +
    business._count.appointments +
    business._count.orders +
    business._count.handoffs +
    business._count.pendingReplies;

  return (
    <div className="space-y-6">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-[#6c817e] transition-colors hover:text-[#234e4b]">
          ← All agents
        </Link>
        <Link href={`/dashboard/${business.id}/inbox`} className={BTN_GHOST}>
          Inbox ({inboxCount})
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#234e4b]">
          {business.name}
        </h1>
        <p className="mt-1 text-[15px] text-[#6c817e]">Configure your agent.</p>
      </div>

      {/* Settings */}
      <form action={updateBusiness} className={CARD}>
        <h2 className="text-lg font-semibold text-[#234e4b]">Agent settings</h2>
        <p className="mt-1 text-sm text-[#6c817e]">
          The knowledge is your agent&apos;s brain — it only answers from what you
          put here.
        </p>
        <input type="hidden" name="id" value={business.id} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Business name</label>
            <input type="text" name="name" defaultValue={business.name} required className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Agent name</label>
            <input type="text" name="agentName" defaultValue={business.agentName} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Greeting message</label>
            <input type="text" name="greeting" defaultValue={business.greeting} className={FIELD} />
          </div>
          <div>
            <label className={LABEL}>Theme color (hex)</label>
            <input type="text" name="themeColor" defaultValue={business.themeColor} className={FIELD} />
          </div>
        </div>

        {/* Skills */}
        <label className={`${LABEL} mt-6`}>
          Agent skills — turn on what this business needs
        </label>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SKILLS.map((sk) => (
            <label
              key={sk.key}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e3d9d3] bg-[#faf6f4] p-3.5 transition-colors hover:border-[#ec6745]"
            >
              <input
                type="checkbox"
                name={`skill:${sk.key}`}
                defaultChecked={enabled.includes(sk.key)}
                className="mt-0.5 size-4 accent-[#ec6745]"
              />
              <span className="flex flex-col">
                <strong className="text-sm font-semibold text-[#234e4b]">
                  {sk.icon} {sk.label}
                </strong>
                <small className="mt-0.5 text-[12.5px] text-[#6c817e]">
                  {sk.description}
                </small>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6">
          <label className={LABEL}>Business knowledge (prices, services, hours, FAQs…)</label>
          <textarea
            name="knowledgeBase"
            defaultValue={business.knowledgeBase}
            className={`${FIELD} min-h-40 leading-relaxed`}
            placeholder={"Example:\nWe are open Mon–Sat 9am–6pm.\nDelivery is free over $50."}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Product list — used by “Take orders” (one per line)</label>
            <textarea
              name="products"
              defaultValue={business.products}
              className={`${FIELD} min-h-28`}
              placeholder={"Chocolate cake | $40 | serves 8\nCroissant | $3 each"}
            />
          </div>
          <div>
            <label className={LABEL}>Availability — used by “Book appointments”</label>
            <textarea
              name="availabilityNote"
              defaultValue={business.availabilityNote}
              className={`${FIELD} min-h-28`}
              placeholder={"Mon–Sat 9am–5pm. 30-minute slots. Closed holidays."}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL}>
            Lead qualification rules — what makes a <em>serious</em> lead? (the AI
            qualifies before booking)
          </label>
          <textarea
            name="qualificationRules"
            defaultValue={business.qualificationRules}
            className={`${FIELD} min-h-28`}
            placeholder={
              "Example:\nA good lead is in our service area (CA, AZ, TX), owns their home, and wants a quote in the next 3 months.\nTreat 'just curious' / renters / out-of-area as not a fit."
            }
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Notify email (optional)</label>
            <input type="email" name="notifyEmail" defaultValue={business.notifyEmail ?? ""} className={FIELD} placeholder="you@business.com" />
          </div>
          <div>
            <label className={LABEL}>n8n webhook URL (optional) — receives every captured item</label>
            <input type="url" name="n8nWebhookUrl" defaultValue={business.n8nWebhookUrl ?? ""} className={FIELD} placeholder="https://you.app.n8n.cloud/webhook/chatpilot" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="submit" className={BTN_PRIMARY}>
            Save changes
          </button>
          {saved && <span className="text-sm font-medium text-[#1f8a5b]">✓ Saved</span>}
        </div>
      </form>

      {/* Documents */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-[#234e4b]">Knowledge documents</h2>
        <p className="mt-1 text-sm text-[#6c817e]">
          Upload a .pdf, .txt, or .md file. The agent will learn from its text.
        </p>
        <form action={uploadDocument} className="mt-5 flex flex-wrap items-center gap-3">
          <input type="hidden" name="businessId" value={business.id} />
          <input
            type="file"
            name="file"
            accept=".pdf,.txt,.md"
            required
            className="text-sm text-[#6c817e] file:mr-3 file:rounded-full file:border-0 file:bg-[#234e4b] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
          <button type="submit" className={BTN_GHOST}>
            Upload
          </button>
        </form>

        {business.documents.length > 0 && (
          <div className="mt-4 grid gap-3">
            {business.documents.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-[#e3d9d3] bg-[#faf6f4] px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-[#234e4b]">📄 {d.filename}</p>
                  <p className="mt-0.5 text-[13px] text-[#6c817e]">
                    {d.content.length.toLocaleString()} characters learned
                  </p>
                </div>
                <form action={deleteDocument}>
                  <input type="hidden" name="docId" value={d.id} />
                  <input type="hidden" name="businessId" value={business.id} />
                  <button type="submit" className={BTN_DANGER}>
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embed */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-[#234e4b]">Add it to your website</h2>
        <p className="mt-1 text-sm text-[#6c817e]">
          Paste this one line just before the closing &lt;/body&gt; tag on your site.
        </p>
        <div className="mt-4 whitespace-pre-wrap break-all rounded-xl border border-[#234e4b] bg-[#163230] p-4 font-mono text-[13px] text-[#d7e6e3]">
          {snippet}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <CopyButton text={snippet} />
          <Link className={BTN_GHOST} href={`/embed/${business.widgetId}`} target="_blank">
            Preview the chat →
          </Link>
        </div>
      </div>

      {/* Danger */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-[#234e4b]">Danger zone</h2>
        <p className="mt-1 text-sm text-[#6c817e]">
          Deleting an agent also deletes all its data.
        </p>
        <form action={deleteBusiness} className="mt-4">
          <input type="hidden" name="id" value={business.id} />
          <button type="submit" className={BTN_DANGER}>
            Delete this agent
          </button>
        </form>
      </div>
    </div>
  );
}
