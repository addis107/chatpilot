"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPanel({
  widgetId,
  greeting,
  agentName,
  themeColor,
}: {
  widgetId: string;
  greeting: string;
  agentName: string;
  themeColor: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${widgetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Skip the local greeting bubble when sending history.
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="embed-root">
      <div className="w-header" style={{ background: themeColor }}>
        <span className="w-dot" />
        <div>
          <strong>{agentName}</strong>
          <small>Online now</small>
        </div>
      </div>

      <div className="w-body" ref={scrollRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`w-bubble ${m.role === "user" ? "user" : "bot"}`}
            style={m.role === "user" ? { background: themeColor } : undefined}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="w-bubble bot w-typing">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="w-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message…"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ background: themeColor }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
