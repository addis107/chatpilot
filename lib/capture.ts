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

export async function createLead(
  business: Business,
  data: { name: string; email: string; interest: string; notes?: string }
) {
  await prisma.lead.create({
    data: {
      businessId: business.id,
      name: data.name,
      email: data.email,
      interest: data.interest,
      notes: data.notes ?? "",
    },
  });
  await notifyBusiness(business, "lead.created", data);
}

export async function createAppointment(
  business: Business,
  data: {
    name: string;
    email: string;
    requestedTime: string;
    notes?: string;
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
