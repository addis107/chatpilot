import Anthropic from "@anthropic-ai/sdk";
import type { Business } from "@prisma/client";
import { parseSkills } from "@/lib/skills";
import {
  createLead,
  createAppointment,
  createOrder,
  createHandoff,
  createPendingReply,
  askBusinessWebhook,
  lookupStatus,
} from "@/lib/capture";

const MODEL = "claude-sonnet-4-6";

// Read the key from CHATPILOT_ANTHROPIC_KEY (NOT ANTHROPIC_API_KEY) so the SDK
// doesn't auto-attach the legacy x-api-key header from the environment - newer
// "personal" keys (sk-ant-usr-...) must use Authorization: Bearer instead, and
// if they aren't scoped to a workspace they also need anthropic-workspace-id.
const RAW_KEY =
  process.env.CHATPILOT_ANTHROPIC_KEY ?? process.env.ANTHROPIC_API_KEY ?? "";
const WORKSPACE_ID = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
const isUserKey = RAW_KEY.startsWith("sk-ant-usr-");

const anthropic = isUserKey
  ? new Anthropic({
      authToken: RAW_KEY,
      ...(WORKSPACE_ID
        ? { defaultHeaders: { "anthropic-workspace-id": WORKSPACE_ID } }
        : {}),
    })
  : new Anthropic({ apiKey: RAW_KEY });

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Identity passed in by the host website (if the visitor is logged in there). */
export type Visitor = { name?: string; email?: string };

export type AgentEvent = { type: string; ref?: string };

export type AgentResult = {
  reply: string;
  events: AgentEvent[];
};

/** Build the per-business system prompt from its config + knowledge. */
function buildSystemPrompt(
  business: Business,
  docsText: string,
  visitor?: Visitor
): string {
  const skills = parseSkills(business.enabledSkills);
  const parts: string[] = [];

  parts.push(
    `You are "${business.agentName}", the friendly AI assistant for the business "${business.name}". Today's date is ${new Date().toISOString().slice(0, 10)} - use it to resolve days like "Tuesday" or "tomorrow" into real dates.`
  );

  // If the host site already identified the visitor (they're logged in there),
  // tell the agent so it greets by name and never re-asks for known details.
  const vName = visitor?.name?.trim();
  const vEmail = visitor?.email?.trim();
  if (vName || vEmail) {
    parts.push(`# Signed-in visitor (already known - do NOT ask for these)
This visitor is logged in on the website. Their details are already known:
- Name: ${vName || "(not provided)"}
- Email: ${vEmail || "(not provided)"}
Greet them by first name if you have it. When you capture a lead, order, booking
or handoff, REUSE these details automatically - only ask for a contact detail that
is marked "(not provided)" above.`);
  }

  parts.push(`Your rules:
- Answer ONLY using the Business Knowledge below. If something isn't covered, say
  you're not sure and (if the handoff skill is on) offer to pass it to the team.
- Never invent prices, availability, policies, or facts.
- Keep replies short, warm, and in plain language. Ask for details one or two at
  a time, not all at once.`);

  // Describe the skills the agent is allowed to perform.
  const skillLines: string[] = [];
  if (skills.includes("lead"))
    skillLines.push(
      "- Capture a lead (name + email) when a visitor is interested but not ordering/booking."
    );
  if (skills.includes("appointment"))
    skillLines.push(
      "- Book an appointment when a visitor wants to reserve a time. Collect name, email, and preferred time."
    );
  if (skills.includes("order"))
    skillLines.push(
      "- Take an order from the Product List. Confirm items before placing. Collect name + email."
    );
  if (skills.includes("status"))
    skillLines.push(
      "- Check status of an existing order/appointment using their reference code or email."
    );
  if (skills.includes("handoff"))
    skillLines.push(
      "- Hand off to a human when you cannot help. Collect name, email, and their question."
    );
  if (skills.includes("review"))
    skillLines.push(
      "- For TRICKY questions, draft a reply for a human to approve instead of answering live (see Review rules)."
    );
  if (skillLines.length)
    parts.push(`What you can do (use the matching tool):\n${skillLines.join("\n")}`);

  if (skills.includes("lead")) {
    parts.push(`# Getting a way to follow up (do this naturally)
When a visitor shows real interest, get ONE way to reach them so the team can follow up:
- Frame it as a benefit to THEM ("so our team can send your confirmation / get back to you about this"), never a cold demand for data.
- Email is best, but accept a phone number if they'd prefer - either is fine.
- Ask once, warmly, one detail at a time. If they decline, DON'T push - still capture whatever you have and keep helping.
- If a detail is already known (signed-in visitor above), never ask for it again.`);
  }

  if (skills.includes("order")) {
    parts.push(
      `# Product List\n${business.products || "(No products listed - do not take orders until the owner adds products.)"}`
    );
  }
  if (skills.includes("appointment")) {
    parts.push(
      `# Availability\n${business.availabilityNote || "(No availability given - collect a preferred time and let the team confirm.)"}

Booking rules:
- ALWAYS resolve the requested time into isoStart (full ISO 8601, using today's
  date) and pass it to book_appointment, with isoEnd 30 minutes later, so the
  booking can be added to the calendar. Example: isoStart "2026-11-26T16:00:00".
- Only book within the Availability hours above when they are given.
- Collect a preferred time, book it, and tell the visitor the team will confirm.`
    );
  }

  if (business.qualificationRules && business.qualificationRules.trim()) {
    parts.push(`# Qualifying leads (important)
Decide whether each visitor is a QUALIFIED lead using these rules:
${business.qualificationRules}

Judge every captured visitor as one of:
- "qualified" - matches the rules; a serious, ready lead.
- "follow_up" - interested but missing info, budget, fit or timing.
- "not_fit" - clearly not a match, or just browsing / not serious.

How to act on it:
- Ask a question or two to figure this out first - don't interrogate.
- ONLY book an appointment for a "qualified" visitor.
- For "follow_up" or "not_fit", still capture the lead so the team can see it
  (with the matching qualification and a short reason), but do NOT book.
- Stay warm - never tell the visitor they are "not a fit".
- Always pass "qualification" and a short "qualificationReason" to capture_lead.`);
  }

  if (skills.includes("review")) {
    parts.push(`# Review rules (draft tricky replies for approval)
Answer SIMPLE, factual questions (hours, location, basic FAQs) directly and live.
But for TRICKY questions - anything you're unsure about, or about pricing/quotes,
refunds, discounts, availability promises, or sensitive topics (medical, legal,
money) - do NOT answer the visitor directly. Instead:
1. If you don't have it yet, ask for the visitor's email ("so our team can get
   back to you").
2. Write your single best DRAFT answer to their question.
3. Call draft_for_review with { question, draft, customerEmail }.
4. Tell the visitor a team member will review and email them shortly.
Never send the draft text straight to the visitor - it must be approved first.`);
  }

  const knowledge = [business.knowledgeBase, docsText]
    .filter((s) => s && s.trim())
    .join("\n\n");
  parts.push(`# Business Knowledge\n${knowledge || "(No information provided yet.)"}`);

  return parts.join("\n\n");
}

/** Build the tool list based on which skills are enabled. */
function buildTools(business: Business): Anthropic.Tool[] {
  const skills = parseSkills(business.enabledSkills);
  const tools: Anthropic.Tool[] = [];

  if (skills.includes("lead")) {
    tools.push({
      name: "capture_lead",
      description:
        "Save an interested visitor as a lead. Use when they're interested but not placing an order or booking. Capture at least ONE contact detail (email OR phone) if they give it - email preferred. Don't block on contact if they decline.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", description: "Their email, if given." },
          phone: { type: "string", description: "Their phone number, if they gave that instead of email." },
          interest: { type: "string", description: "What they're interested in." },
          notes: { type: "string" },
          qualification: {
            type: "string",
            enum: ["qualified", "follow_up", "not_fit"],
            description: "Your qualifier verdict for this visitor.",
          },
          qualificationReason: {
            type: "string",
            description: "One short line explaining the verdict.",
          },
        },
        required: ["name", "interest"],
      },
    });
  }

  if (skills.includes("appointment")) {
    tools.push({
      name: "check_availability",
      description:
        "Check the business's live calendar (via n8n → Google Calendar) for busy times on a given day, BEFORE booking. Returns busy slots; pick a free time within the Availability hours.",
      input_schema: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description:
              "The day the visitor wants as an ISO date, YYYY-MM-DD (resolve 'Tuesday'/'tomorrow' using today's date).",
          },
        },
        required: ["date"],
      },
    });
    tools.push({
      name: "book_appointment",
      description:
        "Book an appointment/reservation. Requires name, email, and a requested time.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          requestedTime: {
            type: "string",
            description: "The time the visitor asked for, e.g. 'Tuesday 3pm'.",
          },
          isoStart: {
            type: "string",
            description: "Exact start as ISO 8601 if known, e.g. 2026-11-20T15:00:00.",
          },
          isoEnd: {
            type: "string",
            description: "Exact end as ISO 8601 if known, e.g. 2026-11-20T15:30:00.",
          },
          notes: { type: "string" },
        },
        required: ["name", "email", "requestedTime"],
      },
    });
  }

  if (skills.includes("order")) {
    tools.push({
      name: "place_order",
      description:
        "Place an order using items from the Product List. Confirm with the visitor first. Requires name, email, and items.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          items: {
            type: "string",
            description: "Human-readable list of ordered items and quantities.",
          },
          total: { type: "string", description: "Total price if known." },
          notes: { type: "string" },
        },
        required: ["name", "email", "items"],
      },
    });
  }

  if (skills.includes("status")) {
    tools.push({
      name: "check_status",
      description:
        "Look up an existing order or appointment by reference code or email.",
      input_schema: {
        type: "object",
        properties: {
          ref: { type: "string", description: "Reference code, if they have one." },
          email: { type: "string", description: "Their email, if no ref code." },
        },
        required: [],
      },
    });
  }

  if (skills.includes("handoff")) {
    tools.push({
      name: "request_handoff",
      description:
        "Escalate to a human when you can't answer. Requires name, email, and their question.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          question: { type: "string" },
        },
        required: ["name", "email", "question"],
      },
    });
  }

  if (skills.includes("review")) {
    tools.push({
      name: "draft_for_review",
      description:
        "For a tricky question, submit your DRAFT answer for a human to approve/edit before it is sent. Requires the question, your draft, and the customer's email. Do not reveal the draft to the visitor.",
      input_schema: {
        type: "object",
        properties: {
          question: { type: "string", description: "The visitor's question." },
          draft: { type: "string", description: "Your best proposed answer." },
          customerEmail: {
            type: "string",
            description: "The visitor's email, so the approved reply can be sent.",
          },
        },
        required: ["question", "draft", "customerEmail"],
      },
    });
  }

  return tools;
}

/** Execute one tool call, persist via capture helpers, return a result string. */
async function runTool(
  business: Business,
  name: string,
  input: Record<string, unknown>,
  events: AgentEvent[],
  visitor?: Visitor
): Promise<string> {
  const s = (v: unknown) => String(v ?? "").trim();
  // Fall back to the signed-in visitor's identity if the model left it blank.
  const vName = (v: unknown) => s(v) || s(visitor?.name);
  const vEmail = (v: unknown) => s(v) || s(visitor?.email);
  switch (name) {
    case "capture_lead": {
      const qualification = s(input.qualification);
      const phone = s(input.phone);
      const notes = [s(input.notes), phone ? `Phone: ${phone}` : ""]
        .filter(Boolean)
        .join(" · ");
      await createLead(business, {
        name: vName(input.name),
        email: vEmail(input.email),
        interest: s(input.interest),
        notes,
        qualification,
        qualificationReason: s(input.qualificationReason),
      });
      events.push({ type: "lead" });
      return qualification === "not_fit"
        ? "Lead saved as not-a-fit. Wrap up warmly without booking."
        : "Lead saved and the business was notified.";
    }
    case "check_availability": {
      const result = await askBusinessWebhook(business, {
        event: "availability.check",
        date: s(input.date),
      });
      if (result == null)
        return "No live calendar is connected. Collect a preferred time with book_appointment and tell the visitor the team will confirm.";
      return `Live calendar for ${s(input.date)} (busy times): ${
        typeof result === "string" ? result : JSON.stringify(result)
      }. Offer a FREE time within the Availability hours, avoiding these.`;
    }
    case "book_appointment": {
      // Bake the business timezone offset onto naive datetimes so n8n's calendar
      // CHECK and CREATE agree on the exact instant. (+03:00 = East Africa Time;
      // this becomes a per-business timezone later.)
      const TZ = "+03:00";
      const withTz = (iso: string) =>
        iso && !/[zZ]$|[+-]\d{2}:\d{2}$/.test(iso) ? iso + TZ : iso;
      const isoStart = withTz(s(input.isoStart)) || undefined;
      let isoEnd = withTz(s(input.isoEnd)) || undefined;
      // Default the end to 30 minutes after the start so the calendar event has a span.
      if (isoStart && !isoEnd) {
        const d = new Date(isoStart);
        if (!isNaN(d.getTime())) {
          isoEnd = new Date(d.getTime() + 30 * 60_000).toISOString();
        }
      }
      const ref = await createAppointment(business, {
        name: vName(input.name),
        email: vEmail(input.email),
        requestedTime: s(input.requestedTime),
        isoStart,
        isoEnd,
        notes: s(input.notes),
      });
      events.push({ type: "appointment", ref });
      return `Appointment request saved with reference ${ref}. Tell the visitor the team will confirm, and give them this code.`;
    }
    case "place_order": {
      const ref = await createOrder(business, {
        name: vName(input.name),
        email: vEmail(input.email),
        items: s(input.items),
        total: s(input.total),
        notes: s(input.notes),
      });
      events.push({ type: "order", ref });
      return `Order placed with reference ${ref}. Give the visitor this code for tracking.`;
    }
    case "check_status":
      return await lookupStatus(business, {
        ref: s(input.ref) || undefined,
        email: s(input.email) || undefined,
      });
    case "request_handoff":
      await createHandoff(business, {
        name: vName(input.name),
        email: vEmail(input.email),
        question: s(input.question),
      });
      events.push({ type: "handoff" });
      return "A team member has been notified and will follow up by email.";
    case "draft_for_review":
      await createPendingReply(business, {
        question: s(input.question),
        draft: s(input.draft),
        customerEmail: vEmail(input.customerEmail),
      });
      events.push({ type: "review" });
      return "Draft submitted for human approval. Tell the visitor a team member will review and email them shortly. Do NOT show them the draft.";
    default:
      return "Unknown tool.";
  }
}

/** Run the agent for one business against the running conversation. */
export async function runAgent(
  business: Business,
  messages: ChatMessage[],
  docsText: string,
  visitor?: Visitor
): Promise<AgentResult> {
  const convo: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const tools = buildTools(business);
  const events: AgentEvent[] = [];
  const system = buildSystemPrompt(business, docsText, visitor);

  for (let step = 0; step < 5; step++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools,
      messages: convo,
    });

    const toolUses = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (toolUses.length === 0) {
      const reply = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { reply, events };
    }

    convo.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tool of toolUses) {
      const result = await runTool(
        business,
        tool.name,
        tool.input as Record<string, unknown>,
        events,
        visitor
      );
      toolResults.push({
        type: "tool_result",
        tool_use_id: tool.id,
        content: result,
      });
    }
    convo.push({ role: "user", content: toolResults });
  }

  return {
    reply: "Sorry, something went wrong. Please try again in a moment.",
    events,
  };
}
