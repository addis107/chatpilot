# Reply approval: AI drafts → Slack approve/edit → email the customer

This is the "tricky question" flow. The agent answers simple FAQs live, but for
anything tricky (pricing, refunds, sensitive topics, or when it's unsure) it:

1. Asks the visitor for their **email**
2. Writes a **draft** answer
3. Saves it under **Inbox → Pending replies**
4. **Fires your n8n webhook** (event `reply.draft`) with the question, draft, and email

n8n then posts the draft to **Slack** for you to approve/edit, and emails the final
reply to the customer. ChatPilot only sends *outward* to n8n, so this works even
from localhost.

---

## What ChatPilot sends to n8n
`POST <your n8n webhook>` with JSON like:
```json
{
  "event": "reply.draft",
  "business": "Bella's Bakery",
  "question": "Do you do gluten-free wedding cakes, and how much?",
  "draft": "Yes — we make gluten-free wedding cakes starting around $180...",
  "customerEmail": "alex@example.com",
  "source": "ChatPilot",
  "capturedAt": "2026-11-18T10:00:00.000Z"
}
```

## Setup (about 10 minutes)
1. **Turn on the skill:** in the agent's dashboard settings, enable
   **"📝 Draft replies for approval"**.
2. **n8n:** start a free **n8n Cloud** account (it has a public URL, which Slack
   needs).
3. **Import** `n8n/reply-approval-workflow.json` (Workflows → Import from File).
   It has 4 nodes: Webhook → *Only draft replies* → **Approve/edit in Slack** →
   **Email the customer**.
4. **Connect credentials** inside n8n:
   - **Slack** (on the "Approve / edit in Slack" node) — pick the channel, e.g.
     `#chatpilot-approvals`.
   - **Gmail** (or SMTP/SendGrid) on the "Email the customer" node.
5. **Save & activate** the workflow, then copy the **Webhook Production URL**.
6. Paste that URL into the agent's **"n8n webhook URL"** field in ChatPilot and save.

## How approval works in Slack
The **Approve / edit in Slack** node uses n8n's *Send and Wait for Response*:
- It posts the draft to your channel and **pauses** the workflow.
- You click the button, **edit the text** if you want, and submit.
- The edited text flows to the **Email the customer** node and is sent.
  (In the email node, the body is `{{ $json.data.text }}` — the approved text —
  falling back to the original draft. If your n8n version returns the text on a
  different field, map it there.)

## Notes
- The same webhook also receives `lead.created`, `appointment.created`, etc. The
  **"Only draft replies"** IF node filters to just `reply.draft` so those don't
  trigger emails. (You can add more branches for the other events.)
- Want WhatsApp instead of Slack? Swap the Slack node for n8n's WhatsApp node —
  the rest is the same.
