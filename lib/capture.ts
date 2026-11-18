import type { Business } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Short human-friendly reference code, e.g. "AP-7F3K9". */
export function makeRef(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${code}`;
}

/** Fire the business's n8n webhook with an event (fire-and-forget). */
export async function notifyBusiness(
  business: Business,
  event: string,
  payload: Record<string, unknown>
) {
  if (!business.n8nWebhookUrl) return;
  try {
    await fetch(business.n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        business: business.name,
        source: "ChatPilot",
        capturedAt: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch (err) {
    console.error(`n8n webhook failed for event ${event}:`, err);
  }
}

/**
 * Ask the business's n8n webhook a question and read its reply (synchronous).
 * Used for live calendar availability checks — n8n queries Google Calendar and
 * responds (via a "Respond to Webhook" node). Returns null if no webhook is set,
 * it times out, or it errors — callers should fall back gracefully.
 */
export async function askBusinessWebhook(
  business: Business,
  payload: Record<string, unknown>
): Promise<unknown | null> {
  if (!business.n8nWebhookUrl) return null;
  try {
    const res = await fetch(business.n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        business: business.name,
        source: "ChatPilot",
        capturedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error("askBusinessWebhook failed:", err);
    return null;
  }
}

export async function createLead(
  business: Business,
  data: {
    name: string;
    email: string;
    interest: string;
    notes?: string;
    qualification?: string;
    qualificationReason?: string;
  }
) {
  const valid = ["qualified", "follow_up", "not_fit"];
  const qualification = valid.includes(data.qualification ?? "")
    ? (data.qualification as string)
    : "unknown";
  await prisma.lead.create({
    data: {
      businessId: business.id,
      name: data.name,
      email: data.email,
      interest: data.interest,
      notes: data.notes ?? "",
      qualification,
      qualificationReason: data.qualificationReason ?? "",
    },
  });
  await notifyBusiness(business, "lead.created", { ...data, qualification });
}

export async function createAppointment(
  business: Business,
  data: {
    name: string;
    email: string;
    requestedTime: string;
    notes?: string;
    // Exact ISO datetimes (if the agent resolved them) so n8n can create a
    // precise Google Calendar event. Forwarded in the webhook payload.
    isoStart?: string;
    isoEnd?: string;
  }
) {
  const ref = makeRef("AP");
  await prisma.appointment.create({
    data: {
      businessId: business.id,
      ref,
      customerName: data.name,
      customerEmail: data.email,
      requestedTime: data.requestedTime,
      notes: data.notes ?? "",
    },
  });
  await notifyBusiness(business, "appointment.created", { ...data, ref });
  return ref;
}

export async function createOrder(
  business: Business,
  data: {
    name: string;
    email: string;
    items: string;
    total?: string;
    notes?: string;
  }
) {
  const ref = makeRef("OR");
  await prisma.order.create({
    data: {
      businessId: business.id,
      ref,
      customerName: data.name,
      customerEmail: data.email,
      items: data.items,
      total: data.total ?? "",
      notes: data.notes ?? "",
    },
  });
  await notifyBusiness(business, "order.created", { ...data, ref });
  return ref;
}

export async function createPendingReply(
  business: Business,
  data: { question: string; draft: string; customerEmail: string }
) {
  await prisma.pendingReply.create({
    data: {
      businessId: business.id,
      question: data.question,
      draft: data.draft,
      customerEmail: data.customerEmail,
    },
  });
  // Hand off to n8n: it posts the draft to Slack for approval/edit, then emails
  // the final reply to the customer.
  await notifyBusiness(business, "reply.draft", data);
}

export async function createHandoff(
  business: Business,
  data: { name: string; email: string; question: string }
) {
  await prisma.handoff.create({
    data: {
      businessId: business.id,
      customerName: data.name,
      customerEmail: data.email,
      question: data.question,
    },
  });
  await notifyBusiness(business, "handoff.requested", data);
}

/**
 * Look up a customer's orders/appointments for the "check status" skill,
 * by reference code or email. Returns a short human-readable summary.
 */
export async function lookupStatus(
  business: Business,
  query: { ref?: string; email?: string }
): Promise<string> {
  const ref = query.ref?.trim();
  const email = query.email?.trim().toLowerCase();

  const [appts, orders] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: business.id,
        ...(ref ? { ref } : {}),
        ...(email ? { customerEmail: { equals: email } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        businessId: business.id,
        ...(ref ? { ref } : {}),
        ...(email ? { customerEmail: { equals: email } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  if (appts.length === 0 && orders.length === 0) {
    return "No matching orders or appointments were found.";
  }

  const lines: string[] = [];
  for (const a of appts) {
    lines.push(
      `Appointment ${a.ref}: ${a.requestedTime} — status: ${a.status}.`
    );
  }
  for (const o of orders) {
    lines.push(`Order ${o.ref}: ${o.items} — status: ${o.status}.`);
  }
  return lines.join("\n");
}
