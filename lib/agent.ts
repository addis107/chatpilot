import Anthropic from "@anthropic-ai/sdk";
import type { Business } from "@prisma/client";
import { parseSkills } from "@/lib/skills";
import {
  createLead,
  createAppointment,
  createOrder,
  createHandoff,
  lookupStatus,
} from "@/lib/capture";

const MODEL = "claude-sonnet-4-6";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type AgentEvent = { type: string; ref?: string };

export type AgentResult = {
  reply: string;
  events: AgentEvent[];
};

/** Build the per-business system prompt from its config + knowledge. */
function buildSystemPrompt(business: Business, docsText: string): string {
  const skills = parseSkills(business.enabledSkills);
  const parts: string[] = [];

  parts.push(
    `You are "${business.agentName}", the friendly AI assistant for the business "${business.name}".`
  );

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
  if (skillLines.length)
    parts.push(`What you can do (use the matching tool):\n${skillLines.join("\n")}`);

  if (skills.includes("order")) {
    parts.push(
      `# Product List\n${business.products || "(No products listed — do not take orders until the owner adds products.)"}`
    );
  }
  if (skills.includes("appointment")) {
    parts.push(
      `# Availability\n${business.availabilityNote || "(No availability given — collect a preferred time and let the team confirm.)"}`
    );
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
        "Save an interested visitor as a lead. Use when they're interested but not placing an order or booking. Requires name AND email.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          interest: { type: "string", description: "What they're interested in." },
          notes: { type: "string" },
        },
        required: ["name", "email", "interest"],
      },
    });
  }

  if (skills.includes("appointment")) {
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

  return tools;
}

/** Execute one tool call, persist via capture helpers, return a result string. */
async function runTool(
  business: Business,
  name: string,
  input: Record<string, unknown>,
  events: AgentEvent[]
): Promise<string> {
  const s = (v: unknown) => String(v ?? "").trim();
  switch (name) {
    case "capture_lead":
      await createLead(business, {
        name: s(input.name),
        email: s(input.email),
        interest: s(input.interest),
        notes: s(input.notes),
      });
      events.push({ type: "lead" });
      return "Lead saved and the business was notified.";
    case "book_appointment": {
      const ref = await createAppointment(business, {
        name: s(input.name),
        email: s(input.email),
        requestedTime: s(input.requestedTime),
        notes: s(input.notes),
      });
      events.push({ type: "appointment", ref });
      return `Appointment request saved with reference ${ref}. Tell the visitor the team will confirm, and give them this code.`;
    }
    case "place_order": {
      const ref = await createOrder(business, {
        name: s(input.name),
        email: s(input.email),
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
        name: s(input.name),
        email: s(input.email),
        question: s(input.question),
      });
      events.push({ type: "handoff" });
      return "A team member has been notified and will follow up by email.";
    default:
      return "Unknown tool.";
  }
}

/** Run the agent for one business against the running conversation. */
export async function runAgent(
  business: Business,
  messages: ChatMessage[],
  docsText: string
): Promise<AgentResult> {
  const convo: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const tools = buildTools(business);
  const events: AgentEvent[] = [];

  for (let step = 0; step < 5; step++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(business, docsText),
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
        events
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
