import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.business.findFirst({
    where: { name: "Bella's Bakery (demo)" },
  });
  if (existing) {
    console.log("Demo business already exists. Widget ID:", existing.widgetId);
    return;
  }

  const biz = await prisma.business.create({
    data: {
      name: "Bella's Bakery (demo)",
      agentName: "Bella",
      greeting: "Hi! Welcome to Bella's Bakery 🧁 What can I get started for you?",
      themeColor: "#ec6745",
      // Show off all the skills in the demo.
      enabledSkills: "lead,appointment,order,status,handoff",
      knowledgeBase: `Bella's Bakery - fresh cakes, breads, and pastries.
Open Mon–Sat, 7am–7pm. Closed Sunday.
Location: 12 Maple Street.
Free local delivery on orders over $50.
We cater birthdays, weddings, and office events.
Phone: (555) 013-2200.`,
      products: `Chocolate cake | $40 | serves 8, needs 3 days notice
Vanilla cupcakes | $3 each | minimum 6
Sourdough loaf | $7 each
Croissant | $3.50 each
Wedding cake | from $150 | consultation required`,
      availabilityNote: `Cake tastings and event consultations: Tue–Sat, 10am–4pm, 30-minute slots.`,
    },
  });

  console.log("Created demo business. Widget ID:", biz.widgetId);
  console.log("Preview chat at: /embed/" + biz.widgetId);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
