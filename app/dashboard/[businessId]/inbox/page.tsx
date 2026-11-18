import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

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
    },
  });
  if (!business) notFound();

  return (
    <div className="dash">
      <div className="dash-top">
        <Link href="/" className="brand">
          <span className="logo">✦</span> ChatPilot
        </Link>
        <Link href={`/dashboard/${business.id}`} className="btn-ghost">
          Agent settings
        </Link>
      </div>

      <div className="crumb">
        <Link href="/dashboard">All agents</Link> ·{" "}
        <Link href={`/dashboard/${business.id}`}>{business.name}</Link> · Inbox
      </div>

      {/* Leads */}
      <div className="card">
        <h2>🧲 Leads ({business.leads.length})</h2>
        {business.leads.length === 0 ? (
          <div className="empty">No leads yet.</div>
        ) : (
          <table className="lead-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Interested in</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {business.leads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>
                    <a href={`mailto:${l.email}`}>{l.email}</a>
                  </td>
                  <td>{l.interest}</td>
                  <td>{l.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Appointments */}
      <div className="card">
        <h2>📅 Appointments ({business.appointments.length})</h2>
        {business.appointments.length === 0 ? (
          <div className="empty">No appointments yet.</div>
        ) : (
          <table className="lead-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Name</th>
                <th>Email</th>
                <th>Requested time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {business.appointments.map((a) => (
                <tr key={a.id}>
                  <td>{a.ref}</td>
                  <td>{a.customerName}</td>
                  <td>
                    <a href={`mailto:${a.customerEmail}`}>{a.customerEmail}</a>
                  </td>
                  <td>{a.requestedTime}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Orders */}
      <div className="card">
        <h2>🛒 Orders ({business.orders.length})</h2>
        {business.orders.length === 0 ? (
          <div className="empty">No orders yet.</div>
        ) : (
          <table className="lead-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Name</th>
                <th>Email</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {business.orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.ref}</td>
                  <td>{o.customerName}</td>
                  <td>
                    <a href={`mailto:${o.customerEmail}`}>{o.customerEmail}</a>
                  </td>
                  <td>{o.items}</td>
                  <td>{o.total}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Handoffs */}
      <div className="card">
        <h2>🙋 Human handoffs ({business.handoffs.length})</h2>
        {business.handoffs.length === 0 ? (
          <div className="empty">No handoff requests yet.</div>
        ) : (
          <table className="lead-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Question</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {business.handoffs.map((h) => (
                <tr key={h.id}>
                  <td>{h.customerName}</td>
                  <td>
                    <a href={`mailto:${h.customerEmail}`}>{h.customerEmail}</a>
                  </td>
                  <td>{h.question}</td>
                  <td>{h.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
