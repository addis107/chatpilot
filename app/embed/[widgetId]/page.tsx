import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ChatPanel from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

// This page is loaded inside the iframe that widget.js injects.
export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ widgetId: string }>;
  searchParams: Promise<{ u?: string }>;
}) {
  const { widgetId } = await params;
  const business = await prisma.business.findUnique({ where: { widgetId } });
  if (!business) notFound();

  // widget.js forwards the host site's logged-in user here as ?u=<json>.
  const { u } = await searchParams;
  let visitor: { name?: string; email?: string } | undefined;
  if (u) {
    try {
      const parsed = JSON.parse(decodeURIComponent(u));
      const name = typeof parsed?.name === "string" ? parsed.name : undefined;
      const email = typeof parsed?.email === "string" ? parsed.email : undefined;
      if (name || email) visitor = { name, email };
    } catch {
      // ignore malformed identity
    }
  }

  return (
    <ChatPanel
      widgetId={business.widgetId}
      greeting={business.greeting}
      agentName={business.agentName}
      themeColor={business.themeColor}
      visitor={visitor}
    />
  );
}
