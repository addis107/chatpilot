import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ChatPanel from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

// This page is loaded inside the iframe that widget.js injects.
export default async function EmbedPage({
  params,
}: {
  params: Promise<{ widgetId: string }>;
}) {
  const { widgetId } = await params;
  const business = await prisma.business.findUnique({ where: { widgetId } });
  if (!business) notFound();

  return (
    <ChatPanel
      widgetId={business.widgetId}
      greeting={business.greeting}
      agentName={business.agentName}
      themeColor={business.themeColor}
    />
  );
}
