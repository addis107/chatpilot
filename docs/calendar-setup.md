# Real Google Calendar booking — all through n8n (no Google Cloud setup)

The business connects their Google Calendar **inside n8n**, so there's nothing to
configure in ChatPilot and no Google Cloud project to create. ChatPilot only talks
to the one n8n webhook.

## How it works
1. A **qualified** visitor wants to book.
2. The agent calls **`check_availability`** with the day (ISO date). ChatPilot
   POSTs `{ event: "availability.check", date }` to your n8n webhook and **waits**
   for the reply.
3. n8n asks **Google Calendar** for that day's events and **responds** with the
   busy times.
4. The agent offers a **free** slot within your Availability hours, then calls
   **`book_appointment`** (with an exact `isoStart`/`isoEnd`).
5. ChatPilot POSTs `{ event: "appointment.created", ... }` → n8n **creates the
   Google Calendar event and invites the customer**.

Because ChatPilot only calls **out** to n8n (and n8n Cloud is public), this works
from localhost.

## Setup (~10 min)
1. **n8n Cloud** account → **Import** `n8n/google-calendar-workflow.json`.
2. On both **Google Calendar** nodes ("Get busy times" and "Create calendar
   event"), connect your **Google Calendar** credential (n8n walks you through the
   Google login — this is the only "Google" step, and it's inside n8n).
3. Pick the calendar (default `primary`).
4. **Save & Activate**, copy the **Webhook Production URL**.
5. Paste it into the agent's **n8n webhook URL** field in ChatPilot and save.
6. Turn on the **📅 Book appointments** skill and fill the **Availability** box
   (e.g. "Tue–Sat 10am–4pm, 30-min slots").

## Payloads ChatPilot sends
Availability check (waits for a reply):
```json
{ "event": "availability.check", "date": "2026-11-20", "business": "Bella's Bakery" }
```
Booking (fire-and-forget create):
```json
{
  "event": "appointment.created",
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "requestedTime": "Fri 3pm",
  "isoStart": "2026-11-20T15:00:00",
  "isoEnd": "2026-11-20T15:30:00",
  "ref": "AP-7F3K9",
  "business": "Bella's Bakery"
}
```

## Notes
- One n8n webhook per agent handles **all** events (lead, order, appointment,
  availability.check, reply.draft). You can combine this workflow with the
  reply-approval one by branching on `{{ $json.body.event }}` — or keep this agent's
  webhook focused on calendar and use a different agent for replies.
- The "Create calendar event" node needs **isoStart/isoEnd**; the agent fills those
  after resolving the day/time (it's told today's date). If they're missing it falls
  back to the free-text time, which you can adjust in the event.
- Want a different calendar (Outlook, Cal.com)? Swap the Google Calendar nodes —
  the ChatPilot side doesn't change.
