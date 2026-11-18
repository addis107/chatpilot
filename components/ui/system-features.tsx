"use client";

import type { CSSProperties } from "react";
import InkOrbitFeatures from "@/components/ui/ink-orbit-features";

// Recolor the ink-orbit palette to the ChatPilot brand (60 ivory / 30 teal / 10 coral).
const BRAND_VARS: CSSProperties = {
  "--ib-page": "#f3ece9",
  "--ib-hatch": "rgba(35,78,75,.05)",
  "--ib-paper": "#faf6f4",
  "--ib-card": "#f1ebe7",
  "--ib-raise": "#ffffff",
  "--ib-ink": "#234e4b",
  "--ib-soft": "#345450",
  "--ib-muted": "#6c817e",
  "--ib-faint": "#9aa8a4",
  "--ib-line": "#e3d9d3",
  "--ib-line-strong": "#d6ccc5",
  "--ib-bracket": "#cfc3bc",
  "--ib-inv": "#234e4b",
  "--ib-inv-ink": "#f3ece9",
} as CSSProperties;

export default function SystemFeatures() {
  return (
    <div id="features" className="pb-16 sm:pb-24">
      <InkOrbitFeatures
        theme="light"
        brand="ChatPilot"
        tag=""
        title={"Everything your agent *handles*\nfor you"}
        collaboration={{
          title: "Answers customers instantly",
          description:
            "Your agent replies to every visitor from your business info — answering questions, booking appointments and taking orders, 24/7.",
        }}
        reports={{
          title: "Captures every lead",
          description:
            "Each conversation becomes a saved lead, booking or order — nothing slips through, even after hours.",
        }}
        integrations={{
          title: "Connects your tools",
          description:
            "Send every lead, booking and order to the tools you already use — Google Sheets, Slack, Gmail or n8n.",
          tools: ["Sheets", "Slack", "Gmail", "n8n"],
        }}
        insights={{
          title: "Watch results grow",
          description:
            "See leads, bookings and orders add up over time, so you always know what's working.",
          values: [8, 10, 9, 13, 12, 16, 15, 20, 19, 25, 28, 33],
          forecastFrom: 8,
        }}
        style={BRAND_VARS}
      />
    </div>
  );
}
