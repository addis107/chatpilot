"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SKILLS } from "@/lib/skills";

/** Create a new business (tenant) and go to its settings page. */
export async function createBusiness(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const business = await prisma.business.create({
    data: {
      name,
      agentName: "Assistant",
      greeting: `Hi! Welcome to ${name}. How can I help?`,
      enabledSkills: "lead",
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${business.id}`);
}

/** Update a business's agent settings. */
export async function updateBusiness(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Collect enabled skills from the checkboxes (skill:<key>).
  const enabled = SKILLS.filter(
    (sk) => formData.get(`skill:${sk.key}`) === "on"
  ).map((sk) => sk.key);

  const n8n = String(formData.get("n8nWebhookUrl") ?? "").trim();
  const email = String(formData.get("notifyEmail") ?? "").trim();

  await prisma.business.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim() || "Untitled",
      agentName: String(formData.get("agentName") ?? "").trim() || "Assistant",
      greeting: String(formData.get("greeting") ?? "").trim(),
      themeColor: String(formData.get("themeColor") ?? "#ec6745").trim(),
      knowledgeBase: String(formData.get("knowledgeBase") ?? ""),
      enabledSkills: enabled.join(","),
      products: String(formData.get("products") ?? ""),
      availabilityNote: String(formData.get("availabilityNote") ?? ""),
      n8nWebhookUrl: n8n || null,
      notifyEmail: email || null,
    },
  });

  revalidatePath(`/dashboard/${id}`);
  redirect(`/dashboard/${id}?saved=1`);
}

/** Delete a business and all its data. */
export async function deleteBusiness(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.business.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Upload a knowledge document (.txt, .md, or .pdf); extract and store its text. */
export async function uploadDocument(formData: FormData) {
  const businessId = String(formData.get("businessId") ?? "");
  const file = formData.get("file") as File | null;
  if (!businessId || !file || file.size === 0) {
    redirect(`/dashboard/${businessId}`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name;
  let text = "";

  try {
    if (name.toLowerCase().endsWith(".pdf")) {
      // Import the inner lib path to avoid pdf-parse's debug entrypoint.
      // @ts-expect-error no types for the internal path
      const pdf = (await import("pdf-parse/lib/pdf-parse.js")).default;
      const data = await pdf(buf);
      text = data.text ?? "";
    } else {
      text = buf.toString("utf8");
    }
  } catch (err) {
    console.error("Failed to extract document text:", err);
    text = "";
  }

  // Collapse excessive blank lines and cap the stored size.
  text = text.replace(/\n{3,}/g, "\n\n").trim().slice(0, 20000);
  if (text) {
    await prisma.document.create({
      data: { businessId, filename: name, content: text },
    });
  }

  revalidatePath(`/dashboard/${businessId}`);
  redirect(`/dashboard/${businessId}`);
}

/** Remove one uploaded knowledge document. */
export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("docId") ?? "");
  const businessId = String(formData.get("businessId") ?? "");
  if (!id) return;
  await prisma.document.delete({ where: { id } });
  revalidatePath(`/dashboard/${businessId}`);
  redirect(`/dashboard/${businessId}`);
}
