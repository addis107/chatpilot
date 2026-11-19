"use client";

import { useRef, useState } from "react";
import {
  Magnet,
  CalendarCheck,
  ShoppingCart,
  PackageSearch,
  Headset,
  PencilLine,
  Sparkles,
  Palette,
  Target,
  Mail,
  Webhook,
  Slack,
  Reply,
  type LucideIcon,
} from "lucide-react";
import { updateBusiness } from "@/app/actions";
import KnowledgeManager from "@/components/dashboard/knowledge-manager";
import UploadableTextField from "@/components/dashboard/uploadable-text-field";

const THEME_PRESETS = [
  "#ec6745", // coral (brand)
  "#234e4b", // teal (brand)
  "#2563eb", // blue
  "#7c3aed", // violet
  "#db2777", // pink
  "#059669", // emerald
  "#d97706", // amber
  "#0f172a", // slate
];

type Skill = { key: string; label: string; description: string; icon: string };

const SKILL_ICONS: Record<string, LucideIcon> = {
  lead: Magnet,
  appointment: CalendarCheck,
  order: ShoppingCart,
  status: PackageSearch,
  handoff: Headset,
  review: PencilLine,
};

export type AgentConfig = {
  id: string;
  name: string;
  agentName: string;
  greeting: string;
  themeColor: string;
  knowledgeBase: string;
  products: string;
  availabilityNote: string;
  qualificationRules: string;
  notifyEmail: string | null;
  n8nWebhookUrl: string | null;
  slackWebhookUrl: string | null;
  autoReplyMessage: string | null;
};

const LABEL = "mb-1.5 block text-sm font-medium text-[#234e4b]";
const FIELD =
  "w-full rounded-xl border border-[#e3d9d3] bg-white px-3.5 py-2.5 text-[15px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:ring-2 focus:ring-[#ec6745]/20";
const BTN_PRIMARY =
  "inline-flex h-11 items-center rounded-full bg-[#ec6745] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#d9542f]";

function Group({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#e3d9d3] py-7 first:border-0 first:pt-0">
      <h2 className="text-[15px] font-semibold text-[#234e4b]">{title}</h2>
      {desc && <p className="mt-1 text-[13.5px] text-[#6c817e]">{desc}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

// Small on/off pill for a notification channel.
function StatusChip({ on }: { on: boolean }) {
  return (
    <span
      className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        on ? "bg-[#e6f4ec] text-[#1f8a5b]" : "bg-[#f3ece9] text-[#9aa8a4]"
      }`}
    >
      <span className={`size-1.5 rounded-full ${on ? "bg-[#1f8a5b]" : "bg-[#c9bcb4]"}`} />
      {on ? "On" : "Off"}
    </span>
  );
}

export default function AgentConfigForm({
  config,
  skills,
  enabled,
  saved,
  stats,
  header,
  documents,
}: {
  config: AgentConfig;
  skills: Skill[];
  enabled: string[];
  saved: boolean;
  stats: { label: string; value: number }[];
  header: React.ReactNode;
  documents: { id: string; filename: string; chars: number }[];
}) {
  // Only the fields that drive the live preview need to be controlled.
  const [agentName, setAgentName] = useState(config.agentName);
  const [greeting, setGreeting] = useState(config.greeting);
  const [theme, setTheme] = useState(config.themeColor || "#ec6745");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [notifyEmail, setNotifyEmail] = useState(config.notifyEmail ?? "");
  const [webhook, setWebhook] = useState(config.n8nWebhookUrl ?? "");
  const [slack, setSlack] = useState(config.slackWebhookUrl ?? "");
  const [autoReply, setAutoReply] = useState(config.autoReplyMessage ?? "");

  // Track which skills are on so dependent fields can show/hide live.
  const [activeSkills, setActiveSkills] = useState<Set<string>>(
    () => new Set(enabled)
  );
  const toggleSkill = (key: string, on: boolean) =>
    setActiveSkills((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  const initial = (agentName.trim()[0] || "A").toUpperCase();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,360px)]">
      {/* ── Left: header + the form ── */}
      <div className="min-w-0">
        {header}
        <form action={updateBusiness} className="mt-6">
        <input type="hidden" name="id" value={config.id} />

        <Group
          title="Identity & appearance"
          desc="How the assistant introduces itself and looks in the chat bubble."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Business name</label>
              <input type="text" name="name" defaultValue={config.name} required className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Agent name</label>
              <input
                type="text"
                name="agentName"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className={FIELD}
              />
            </div>
          </div>
          <div>
            <label className={LABEL}>Greeting message</label>
            <input
              type="text"
              name="greeting"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Theme color</label>
            <div className="flex items-center gap-2.5">
              {THEME_PRESETS.map((c) => {
                const active = theme.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTheme(c)}
                    aria-label={`Use ${c}`}
                    aria-pressed={active}
                    style={{ backgroundColor: c }}
                    className={`size-8 shrink-0 appearance-none rounded-full border-0 p-0 align-top transition ${
                      active
                        ? "ring-2 ring-[#234e4b] ring-offset-2 ring-offset-[#f3ece9]"
                        : "hover:scale-110"
                    }`}
                  />
                );
              })}

              {/* Custom color - same <button> box as the presets */}
              <button
                type="button"
                onClick={() => colorInputRef.current?.click()}
                aria-label="Pick a custom color"
                title="Custom color"
                className="grid size-8 shrink-0 appearance-none place-items-center rounded-full border border-dashed border-[#9aa8a4] bg-transparent p-0 align-top text-[#6c817e] transition-colors hover:border-[#ec6745] hover:text-[#ec6745]"
              >
                <Palette className="size-[18px]" strokeWidth={1.75} />
              </button>

              <span className="text-[13px] leading-none tabular-nums text-[#9aa8a4]">
                {theme.toUpperCase()}
              </span>
            </div>

            {/* Off-screen native picker, driven by the custom button above */}
            <input
              ref={colorInputRef}
              type="color"
              name="themeColor"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              aria-hidden
              tabIndex={-1}
              className="pointer-events-none absolute size-0 opacity-0"
            />
          </div>
        </Group>

        <Group
          title="Agent skills"
          desc="Turn on only what this business needs. Each skill unlocks a tool the agent can use."
        >
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {skills.map((sk) => {
              const Icon = SKILL_ICONS[sk.key] ?? Sparkles;
              const on = activeSkills.has(sk.key);
              return (
                <label
                  key={sk.key}
                  className="group flex cursor-pointer items-center gap-3.5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#e3d9d3] bg-[#faf6f4] text-[#234e4b] transition-colors group-hover:border-[#ec6745]/40">
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#234e4b]">
                      {sk.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-[#6c817e]">
                      {sk.description}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    name={`skill:${sk.key}`}
                    checked={on}
                    onChange={(e) => toggleSkill(sk.key, e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="relative h-6 w-11 shrink-0 rounded-full bg-[#d8cbc4] transition-colors peer-checked:bg-[#ec6745] after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              );
            })}
          </div>
        </Group>

        <Group title="Knowledge" desc="The agent's brain - it only answers from what you put here. Type it, upload files, or both.">
          <KnowledgeManager
            businessId={config.id}
            defaultValue={config.knowledgeBase}
            documents={documents}
          />
          {/* Products & opening hours live in the knowledge above now; preserve any saved values. */}
          <input type="hidden" name="products" value={config.products} />
          <input type="hidden" name="availabilityNote" value={config.availabilityNote} />
        </Group>

        <Group
          title="Lead qualification"
          desc="What makes a serious lead? The AI qualifies against these rules before it books anyone."
        >
          <UploadableTextField
            icon={Target}
            title="Qualification rules"
            usedBy="Capture leads"
            name="qualificationRules"
            defaultValue={config.qualificationRules}
            rows={5}
            placeholder={
              "Type your rules, or upload a policy doc.\n\nExample:\nA good lead is in our service area (CA, AZ, TX), owns their home, and wants a quote in the next 3 months.\nTreat 'just curious' / renters / out-of-area as not a fit."
            }
          />
        </Group>

        <Group
          title="Notifications & automation"
          desc="Where captured leads, orders and bookings go the moment they come in."
        >
          {/* Email */}
          <div className="rounded-xl border border-[#e3d9d3] bg-white">
            <div className="flex items-center gap-2.5 border-b border-[#ece3de] px-3.5 py-2.5">
              <Mail className="size-4 text-[#ec6745]" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-[#234e4b]">Email notifications</span>
              <StatusChip on={notifyEmail.trim().length > 0} />
            </div>
            <div className="px-3.5 py-3">
              <input
                type="email"
                name="notifyEmail"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="you@business.com"
                className="block h-10 w-full rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 text-[14px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:shadow-none"
              />
              <p className="mt-2 text-[12px] text-[#9aa8a4]">
                Emailed when a new lead, order or booking comes in.
              </p>
            </div>
          </div>

          {/* Slack */}
          <div className="rounded-xl border border-[#e3d9d3] bg-white">
            <div className="flex items-center gap-2.5 border-b border-[#ece3de] px-3.5 py-2.5">
              <Slack className="size-4 text-[#ec6745]" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-[#234e4b]">Slack</span>
              <StatusChip on={/^https?:\/\//.test(slack.trim())} />
            </div>
            <div className="px-3.5 py-3">
              <input
                type="url"
                name="slackWebhookUrl"
                value={slack}
                onChange={(e) => setSlack(e.target.value)}
                placeholder="https://hooks.slack.com/services/…"
                className="block h-10 w-full rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 font-mono text-[12.5px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:shadow-none"
              />
              <p className="mt-2 text-[12px] text-[#9aa8a4]">
                Paste a Slack Incoming Webhook to post new activity to a channel.
              </p>
            </div>
          </div>

          {/* Auto-reply to new leads */}
          <div className="rounded-xl border border-[#e3d9d3] bg-white">
            <div className="flex items-center gap-2.5 border-b border-[#ece3de] px-3.5 py-2.5">
              <Reply className="size-4 text-[#ec6745]" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-[#234e4b]">
                Auto-reply to new leads
              </span>
              <StatusChip on={autoReply.trim().length > 0} />
            </div>
            <div className="px-3.5 py-3">
              <textarea
                name="autoReplyMessage"
                value={autoReply}
                onChange={(e) => setAutoReply(e.target.value)}
                rows={4}
                placeholder={
                  "Hi! Thanks for reaching out - we've got your details and someone from our team will follow up with you shortly. 😊"
                }
                className="block w-full resize-y rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 py-2 text-[14px] leading-relaxed text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:shadow-none"
              />
              <p className="mt-2 text-[12px] text-[#9aa8a4]">
                Instantly emailed to a new lead who left an email. Leave blank to turn off.
              </p>
            </div>
          </div>

          {/* Coming soon */}
          <div className="rounded-xl border border-dashed border-[#e3d9d3] bg-[#faf6f4] px-3.5 py-3">
            <p className="text-[12.5px] leading-relaxed text-[#6c817e]">
              <span className="font-semibold text-[#234e4b]">More coming.</span>{" "}
              Google Sheets and WhatsApp will connect right here - handled for you, no
              technical setup.
            </p>
          </div>

          {/* Advanced - raw webhook, tucked away from normal clients */}
          <details className="group rounded-xl border border-[#e3d9d3] bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-[#234e4b]">
              <Webhook className="size-4 text-[#9aa8a4]" strokeWidth={1.75} />
              Advanced - custom webhook (for developers)
              <StatusChip on={/^https?:\/\//.test(webhook.trim())} />
              <span className="ml-1 text-[#9aa8a4] transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <div className="border-t border-[#ece3de] px-3.5 py-3">
              <p className="mb-2 text-[12.5px] leading-relaxed text-[#6c817e]">
                Send every captured item as JSON to your own endpoint (n8n, Zapier,
                Make, or a custom server). Most businesses can leave this blank.
              </p>
              <input
                type="url"
                name="n8nWebhookUrl"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="https://you.app.n8n.cloud/webhook/chatpilot"
                className="block h-10 w-full rounded-lg border border-[#e3d9d3] bg-[#faf6f4] px-3 font-mono text-[12.5px] text-[#234e4b] outline-none placeholder:text-[#9aa8a4] focus:border-[#ec6745] focus:shadow-none"
              />
            </div>
          </details>
        </Group>

        {/* Save */}
        <div className="mt-8 flex items-center gap-3 border-t border-[#e3d9d3] pt-6">
          <button type="submit" className={BTN_PRIMARY}>
            Save changes
          </button>
          {saved && (
            <span className="text-sm font-medium text-[#1f8a5b]">Saved ✓</span>
          )}
        </div>
        </form>
      </div>

      {/* ── Right: stats + live preview, pinned ── */}
      <aside>
       <div className="space-y-6 lg:sticky lg:top-24">
        {/* Stats - small teal pills spanning the full preview width */}
        <div className="flex gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#234e4b] px-3 py-1.5"
            >
              <span className="text-[13px] font-semibold tabular-nums text-white">{s.value}</span>
              <span className="text-[11px] text-white/60">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-[#9aa8a4]">
            Live preview
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#e3d9d3] bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ backgroundColor: theme }}>
            <span className="flex size-9 items-center justify-center rounded-full bg-white/25 text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold text-white">{agentName || "Assistant"}</p>
              <p className="flex items-center gap-1.5 text-[12px] text-white/80">
                <span className="size-1.5 rounded-full bg-[#7CFBB0]" />
                Online now
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 bg-[#faf6f4] px-4 py-5">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[#e3d9d3] bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#234e4b]">
              {greeting || "Hi! How can I help you today?"}
            </div>
            <div
              className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white"
              style={{ backgroundColor: theme }}
            >
              Do you deliver on weekends?
            </div>
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-[#e3d9d3] px-3 py-3">
            <div className="flex-1 rounded-full border border-[#e3d9d3] bg-[#faf6f4] px-4 py-2 text-[13px] text-[#9aa8a4]">
              Type a message…
            </div>
            <button
              type="button"
              aria-label="Send"
              className="flex size-9 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: theme }}
            >
              ↑
            </button>
          </div>
        </div>

          <p className="mt-3 text-[13px] text-[#6c817e]">
            Updates as you edit. Name, greeting and color apply to the real widget on save.
          </p>
        </div>
       </div>
      </aside>
    </div>
  );
}
