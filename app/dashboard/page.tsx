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
    <div className="dash">
      <div className="dash-top">
        <Link href="/" className="brand">
          <span className="logo">✦</span> ChatPilot
        </Link>
      </div>

      <div className="card">
        <h2>Create a new agent</h2>
        <p className="hint">
          Each agent is for one business. Give it a name to get started.
        </p>
        <form action={createBusiness}>
          <div className="form-actions" style={{ marginTop: 0 }}>
            <input
              type="text"
              name="name"
              placeholder="e.g. Bella's Bakery"
              required
              style={{ maxWidth: 320 }}
            />
            <button className="btn-primary" type="submit">
              Create agent
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Your agents</h2>
        <p className="hint">{businesses.length} total</p>
        {businesses.length === 0 ? (
          <div className="empty">No agents yet — create your first one above.</div>
        ) : (
          <div className="biz-list">
            {businesses.map((b) => (
              <Link key={b.id} href={`/dashboard/${b.id}`} className="biz-row">
                <div>
                  <strong>{b.name}</strong>
                  <div className="meta">
                    Agent: {b.agentName} · {b._count.leads} lead
                    {b._count.leads === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="btn-ghost">Manage →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
