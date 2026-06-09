import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

async function main() {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
  const prisma = new PrismaClient({ adapter });

  const total = await prisma.collegeReview.count();
  console.log("Total reviews:", total);

  const sample = await prisma.collegeReview.findFirst({
    include: { user: { select: { name: true } } },
  });
  console.log("Sample:", JSON.stringify(sample, null, 2));

  const firstReviewUsers = await prisma.user.findMany({ take: 5 });
  console.log("Users:", firstReviewUsers.map((u) => u.email));

  await prisma.$disconnect();
}
main();
