/**
 * The catalog of agent skills a business can turn on. "lead" is a sensible
 * default. Each key maps to a tool the agent gains in lib/agent.ts.
 */
export type SkillKey =
  | "lead"
  | "appointment"
  | "order"
  | "status"
  | "handoff"
  | "review";

export const SKILLS: {
  key: SkillKey;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    key: "lead",
    label: "Capture leads",
    icon: "🧲",
    description: "Collect name & email from interested visitors.",
  },
  {
    key: "appointment",
    label: "Book appointments",
    icon: "📅",
    description: "Let visitors request a booking/reservation time.",
  },
  {
    key: "order",
    label: "Take orders",
    icon: "🛒",
    description: "Let visitors place an order from your product list.",
  },
  {
    key: "status",
    label: "Check status",
    icon: "🔎",
    description: "Answer 'where's my order/booking?' using their email or ref code.",
  },
  {
    key: "handoff",
    label: "Hand off to a human",
    icon: "🙋",
    description: "Route questions the agent can't answer to your team.",
  },
  {
    key: "review",
    label: "Draft replies for approval",
    icon: "📝",
    description:
      "For tricky questions, the agent drafts a reply for a human to approve & edit (via n8n → Slack) instead of answering live.",
  },
];

export function parseSkills(csv: string): SkillKey[] {
  const valid = new Set(SKILLS.map((s) => s.key));
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is SkillKey => valid.has(s as SkillKey));
}

export function hasSkill(csv: string, key: SkillKey): boolean {
  return parseSkills(csv).includes(key);
}
