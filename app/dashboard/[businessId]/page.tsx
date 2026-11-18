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
        select: { leads: true, appointments: true, orders: true, handoffs: true },
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
    business._count.handoffs;

  return (
    <div className="dash">
      <div className="dash-top">
        <Link href="/" className="brand">
          <span className="logo">✦</span> ChatPilot
        </Link>
        <Link href={`/dashboard/${business.id}/inbox`} className="btn-ghost">
          Inbox ({inboxCount})
        </Link>
      </div>

      <div className="crumb">
        <Link href="/dashboard">← All agents</Link>
      </div>

      <form action={updateBusiness} className="card">
        <h2>Agent settings</h2>
        <p className="hint">The basics and the brain of your agent.</p>
        <input type="hidden" name="id" value={business.id} />

        <div className="row2">
          <div>
            <label>Business name</label>
            <input type="text" name="name" defaultValue={business.name} required />
          </div>
          <div>
            <label>Agent name</label>
            <input type="text" name="agentName" defaultValue={business.agentName} />
          </div>
        </div>

        <div className="row2">
          <div>
            <label>Greeting message</label>
            <input type="text" name="greeting" defaultValue={business.greeting} />
          </div>
          <div>
            <label>Theme color (hex)</label>
            <input type="text" name="themeColor" defaultValue={business.themeColor} />
          </div>
        </div>

        {/* Skills */}
        <label>Agent skills — turn on what this business needs</label>
        <div className="skill-grid">
          {SKILLS.map((sk) => (
            <label key={sk.key} className="skill">
              <input
                type="checkbox"
                name={`skill:${sk.key}`}
                defaultChecked={enabled.includes(sk.key)}
              />
              <span>
                <strong>
                  {sk.icon} {sk.label}
                </strong>
                <small>{sk.description}</small>
              </span>
            </label>
          ))}
        </div>

        <label>Business knowledge (prices, services, hours, FAQs…)</label>
        <textarea
          name="knowledgeBase"
          defaultValue={business.knowledgeBase}
          placeholder={"Example:\nWe are open Mon–Sat 9am–6pm.\nDelivery is free over $50."}
        />

        <div className="row2">
          <div>
            <label>Product list — used by “Take orders” (one per line)</label>
            <textarea
              name="products"
              defaultValue={business.products}
              style={{ minHeight: 120 }}
              placeholder={"Chocolate cake | $40 | serves 8\nCroissant | $3 each"}
            />
          </div>
          <div>
            <label>Availability — used by “Book appointments”</label>
            <textarea
              name="availabilityNote"
              defaultValue={business.availabilityNote}
              style={{ minHeight: 120 }}
              placeholder={"Mon–Sat 9am–5pm. 30-minute slots. Closed holidays."}
            />
          </div>
        </div>

        <div className="row2">
          <div>
            <label>Notify email (optional)</label>
            <input
              type="email"
              name="notifyEmail"
              defaultValue={business.notifyEmail ?? ""}
              placeholder="you@business.com"
            />
          </div>
          <div>
            <label>n8n webhook URL (optional) — receives every captured item</label>
            <input
              type="url"
              name="n8nWebhookUrl"
              defaultValue={business.n8nWebhookUrl ?? ""}
              placeholder="https://you.app.n8n.cloud/webhook/chatpilot"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit">
            Save changes
          </button>
          {saved && <span className="saved-tag">✓ Saved</span>}
        </div>
      </form>

      {/* Documents */}
      <div className="card">
        <h2>Knowledge documents</h2>
        <p className="hint">
          Upload a .pdf, .txt, or .md file. The agent will learn from its text.
        </p>
        <form action={uploadDocument} className="form-actions" style={{ marginTop: 0 }}>
          <input type="hidden" name="businessId" value={business.id} />
          <input type="file" name="file" accept=".pdf,.txt,.md" required />
          <button className="btn-ghost" type="submit">
            Upload
          </button>
        </form>

        {business.documents.length > 0 && (
          <div className="biz-list" style={{ marginTop: 16 }}>
            {business.documents.map((d) => (
              <div key={d.id} className="biz-row">
                <div>
                  <strong>📄 {d.filename}</strong>
                  <div className="meta">
                    {d.content.length.toLocaleString()} characters learned
                  </div>
                </div>
                <form action={deleteDocument}>
                  <input type="hidden" name="docId" value={d.id} />
                  <input type="hidden" name="businessId" value={business.id} />
                  <button className="btn-danger" type="submit">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embed snippet */}
      <div className="card">
        <h2>Add it to your website</h2>
        <p className="hint">
          Paste this one line just before the closing &lt;/body&gt; tag on your site.
        </p>
        <div className="snippet">{snippet}</div>
        <div className="form-actions">
          <CopyButton text={snippet} />
          <Link
            className="btn-ghost"
            href={`/embed/${business.widgetId}`}
            target="_blank"
          >
            Preview the chat →
          </Link>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card">
        <h2>Danger zone</h2>
        <p className="hint">Deleting an agent also deletes all its data.</p>
        <form action={deleteBusiness}>
          <input type="hidden" name="id" value={business.id} />
          <button className="btn-danger" type="submit">
            Delete this agent
          </button>
        </form>
      </div>
    </div>
  );
}
