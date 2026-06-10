import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const q = await prisma.question.findFirst();
    console.log("Question table exists:", q);
  } catch (e) {
    console.error("Question table error:", e instanceof Error ? e.message : e);
  }
  try {
    const a = await prisma.answer.findFirst();
    console.log("Answer table exists:", a);
  } catch (e) {
    console.error("Answer table error:", e instanceof Error ? e.message : e);
  }
  try {
    const s = await prisma.savedItem.findFirst();
    console.log("SavedItem table exists:", s);
  } catch (e) {
    console.error("SavedItem table error:", e instanceof Error ? e.message : e);
  }
  try {
    const u = await prisma.user.findFirst();
    console.log("User table exists:", u?.id);
  } catch (e) {
    console.error("User table error:", e instanceof Error ? e.message : e);
  }
}
main().finally(() => prisma.$disconnect());
