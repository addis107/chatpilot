# ✦ ChatPilot

**An AI agent platform for any business.** A business signs up, configures its
agent, and pastes one line of code on its website. The AI then answers customers
24/7 and does real work — capturing leads, booking appointments, taking orders,
checking status, and handing off to humans — all from the owner's dashboard.

This is a **multi-tenant SaaS**: one install serves many businesses, each with
its own agent, knowledge, skills, and inbox.

```
Visitor → embedded chat widget → AI agent (per-business brain + skills)
                                        │  performs a skill
          ┌─────────────────────────────┼──────────────────────────────┐
          ▼            ▼                 ▼              ▼                ▼
      capture lead  book appt      place order    check status    hand off
          └─────────────────────────────┬──────────────────────────────┘
                                         ▼
                         saved to DB + optional n8n webhook
                                         ▼
                           owner sees it all in the Inbox
```

## Agent skills (toggle per business)
| Skill | What it does |
|-------|--------------|
| 🧲 Capture leads | Collect name & email from interested visitors |
| 📅 Book appointments | Take a requested time; returns a reference code |
| 🛒 Take orders | Order from the business's product list; returns a ref |
| 🔎 Check status | Look up an order/appointment by ref or email |
| 🙋 Hand off to human | Escalate unanswerable questions to the team |

Each business also has a **knowledge base** (typed text **plus uploaded
.pdf/.txt/.md documents**) that the agent answers from — and never invents facts.

## Tech stack
- **Next.js (App Router) + TypeScript** — app, dashboard, API, server actions
- **Prisma + SQLite** — database (one file, zero setup; swap to Postgres later)
- **Claude (Anthropic SDK)** — the agent brain with per-skill tool-use
- **pdf-parse** — extracts text from uploaded PDFs
- **n8n** — optional per-business automation (receives every captured item)

## What's inside
| Path | What it is |
|------|------------|
| `app/page.tsx` | Marketing landing page |
| `app/dashboard/` | Create agents, toggle skills, edit knowledge, upload docs, view inbox |
| `app/dashboard/[businessId]/inbox/` | Leads + appointments + orders + handoffs |
| `app/api/chat/[widgetId]/route.ts` | Multi-tenant chat endpoint |
| `app/embed/[widgetId]/page.tsx` | Chat panel loaded inside the widget iframe |
| `public/widget.js` | The one-line embeddable script |
| `lib/skills.ts` | The catalog of agent skills |
| `lib/agent.ts` | Builds tools from enabled skills + runs the agent loop |
| `lib/capture.ts` | Persists captured items + fires the n8n webhook |
| `prisma/schema.prisma` | Business, Lead, Appointment, Order, Handoff, Document |

## Quick start
```bash
npm install
# copy .env.example to .env and add your ANTHROPIC_API_KEY
npm run db:push        # create the local database
npm run seed           # optional: adds a demo "Bella's Bakery" with all skills on
npm run dev            # http://localhost:3000
```

Then:
1. Open **/dashboard**, create an agent, turn on the skills you want.
2. Add business info (and optionally upload a PDF/menu).
3. Copy the embed snippet (or **Preview the chat**), chat with it.
4. Watch leads/appointments/orders/handoffs land in the **Inbox**.

## Roadmap
- **Phase 1–2 (done):** multi-tenant agents, 5 skills, document upload, embeddable widget, unified inbox, n8n forwarding.
- **Phase 3:** accounts/login (each owner sees only their agents), email notifications, billing, analytics.

## Notes
- SQLite is used for easy local dev. For production, switch the Prisma
  `datasource` to PostgreSQL and set `DATABASE_URL`.
- There is no login yet — keep the dashboard private until Phase 3.
