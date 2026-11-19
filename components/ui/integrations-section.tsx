"use client";

import { ToolWheel } from "@/components/ui/tool-wheel";

const ONEST = "'Onest', ui-sans-serif, system-ui, sans-serif";

// The ChatPilot pinwheel mark - the same one used in the hero navbar.
const LEAF =
  "M11 0H19A3 3 0 0 1 22 3V11A11 11 0 0 1 11 22H3A3 3 0 0 1 0 19V11A11 11 0 0 1 11 0Z";
const TURNS = [0, 90, 180, 270];
const LEAF_OPACITY = [1, 0.9, 0.8, 0.9];

function ChatPilotMark() {
  return (
    <svg viewBox="-27 -27 54 54" width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id="cp-wheel-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f08d70" />
          <stop offset="1" stopColor="#ec6745" />
        </linearGradient>
      </defs>
      {TURNS.map((t, i) => (
        <path
          key={t}
          d={LEAF}
          transform={`rotate(${t}) translate(-25 -25)`}
          fill="url(#cp-wheel-mark)"
          opacity={LEAF_OPACITY[i]}
        />
      ))}
    </svg>
  );
}

// What rides around the ChatPilot hub: the channel it lives on, what it
// produces (leads, bookings, orders), and where that goes (email, sheets,
// alerts, automations, status). Icons are single-path, drawn in a 24x24 box.
const ITEMS = [
  {
    label: "Website chat",
    path: "M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10.4A1.5 1.5 0 0 1 20 17.4h-9.1L6.1 21.2v-3.8H4a1.5 1.5 0 0 1-1.5-1.5V5.5A1.5 1.5 0 0 1 4 4Zm3.9 5.4a1.45 1.45 0 1 0 0 2.9a1.45 1.45 0 1 0 0-2.9Zm4.1 0a1.45 1.45 0 1 0 0 2.9a1.45 1.45 0 1 0 0-2.9Zm4.1 0a1.45 1.45 0 1 0 0 2.9a1.45 1.45 0 1 0 0-2.9Z",
  },
  {
    label: "Leads",
    path: "M12 2.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4ZM4 20.4c0-3.3 3.6-5.4 8-5.4s8 2.1 8 5.4v1H4Z",
  },
  {
    label: "Appointments",
    path: "M7 2h2.1v2h5.8V2H17v2h2.5A1.5 1.5 0 0 1 21 5.5v14a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-14A1.5 1.5 0 0 1 4.5 4H7Zm-2 7.2V19h14V9.2Zm2 2.2h3.2v3.2H7Z",
  },
  {
    label: "Orders",
    path: "M6 7V6.2A6 6 0 0 1 18 6.2V7h2.2l1 14.4H2.8L3.8 7Zm2.2 0h7.6V6.2A3.8 3.8 0 0 0 8.2 6.2Z",
  },
  {
    label: "Email alerts",
    path: "M3.5 4.8h17A1.5 1.5 0 0 1 22 6.3v11.4a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.7V6.3a1.5 1.5 0 0 1 1.5-1.5Zm.8 2.4v1.7l7.7 5 7.7-5V7.2L12 12.2Z",
  },
  {
    label: "Spreadsheets",
    path: "M3.5 5h17v14h-17Zm2 2v3h5V7Zm7 0v3h6V7Zm-7 5v3h5v-3Zm7 0v3h6v-3Zm-7 5v2h5v-2Zm7 0v2h6v-2Z",
  },
  {
    label: "Notifications",
    path: "M12 2.5a2 2 0 0 1 2 2v.6a6 6 0 0 1 4 5.6V15l2 2.5v1H4v-1L6 15v-4.3a6 6 0 0 1 4-5.6V4.5a2 2 0 0 1 2-2ZM9.5 20h5a2.5 2.5 0 0 1-5 0Z",
  },
  {
    label: "Automations",
    path: "M13.6 1.5 4 13.6h6.6L9.4 22.5 20 9.7h-6.7Z",
  },
  {
    label: "Status checks",
    path: "M10.5 3a7.5 7.5 0 1 0 4.55 13.46l4.24 4.24 1.42-1.42-4.24-4.24A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z",
  },
];

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="w-full bg-[#f3ece9]">
      <div className="mx-auto h-[560px] w-full max-w-6xl sm:h-[680px]">
        <ToolWheel
          items={ITEMS}
          interval={2.4}
          eyebrow="ONE AGENT, EVERYWHERE"
          title="Your whole customer flow."
          subtitle="Website chats become leads, bookings and orders - sent to your inbox, sheets or n8n automatically."
          markPath=""
          markNode={<ChatPilotMark />}
          frame={false}
          background="#f3ece9"
          surface="#ffffff"
          color="#234e4b"
          mutedColor="#6c817e"
          accent="#ec6745"
          signal="#d9542f"
          lineColor="#e3d9d3"
          font={ONEST}
          uiFont={ONEST}
          style={{ width: "100%", height: "100%", minHeight: 0 }}
        />
      </div>
    </section>
  );
}
