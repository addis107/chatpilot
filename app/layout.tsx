import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatPilot — AI chat + lead capture for your website",
  description:
    "Add an AI assistant to your website in minutes. It answers customers 24/7 and captures every lead.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
