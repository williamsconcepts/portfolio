// prisma/seed.ts
// Run with: npx ts-node prisma/seed.ts
// Or add to package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const password = await bcrypt.hash("ebubedike711", 12);
  await prisma.user.upsert({
    where: { email: "admin@boobae.dev" },
    update: {},
    create: {
      email: "chidiekwebelam@gmail.com",
      password,
    },
  });

  // Seed sample project
  await prisma.project.upsert({
    where: { slug: "devlink" },
    update: {},
    create: {
      slug: "MainTx360",
      title: "MainTx360",
      description:
        "Maintx360 is a web-based Computerized Maintenance Management System (CMMS) designed to help oil and gas companies manage equipment maintenance activities, work orders, technicians, and maintenance records in a centralized digital platform.",
      emoji: "🛢",
      url: "https://maintx360.netlify.app/",
      repo: "https://github.com/williamsconcepts/MaintX360",
      tags: ["HTML", "CSS3", "Vanilla JavaScript"],
      featured: true,
    },
  });

  // Seed sample blog post
  await prisma.post.upsert({
    where: { slug: "welcome" },
    update: {},
    create: {
      slug: "welcome",
      title: "Imagine starting afresh, i mean from learning HTML again 😀",
      excerpt: "I wish I knew sooner.",
      content:
        "I started learning how to to code again, but this time a better way, and now document my jorney afresh, from unlearning and and finding a better way to learn— welcome to my blog.",
      tags: ["HTML", "CSS", "Javascript"],
      published: true,
    },
  });

  console.log("✅ Seed complete. Admin: admin@boobae.dev");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
