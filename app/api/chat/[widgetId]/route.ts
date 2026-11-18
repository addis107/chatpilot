import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAgent, type ChatMessage } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The AI is not configured yet (missing API key)." },
      { status: 500 }
    );
  }

  const { widgetId } = await params;
  const business = await prisma.business.findUnique({
    where: { widgetId },
    include: { documents: { select: { content: true } } },
  });
  if (!business) {
    return NextResponse.json({ error: "Unknown widget." }, { status: 404 });
  }

  const body = (await req.json()) as { messages?: ChatMessage[] };
  const messages = (body.messages ?? []).slice(-20); // keep context bounded
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages." }, { status: 400 });
  }

  // Combine uploaded documents into the agent's knowledge (bounded in size).
  const docsText = business.documents
    .map((d) => d.content)
    .join("\n\n")
    .slice(0, 24000);

  const { reply, events } = await runAgent(business, messages, docsText);

  return NextResponse.json({ reply, events });
}
