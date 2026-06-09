/**
 * College Data Enrichment Script
 *
 * - Enriches existing colleges missing data via Mistral AI
 * - Generates new colleges
 * - Adds AI-generated reviews
 * - Assigns college images from Unsplash
 *
 * Usage: MISTRAL_API_KEY=your_key npx tsx prisma/enrich.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err instanceof Error ? err.message : err);
});

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
if (!MISTRAL_API_KEY) {
  console.error("MISTRAL_API_KEY is required");
  process.exit(1);
}

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const COLLEGE_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1583373834259-46cc92173cb7?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1559135197-8a45ea74d367?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=400&fit=crop",
  "https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/532743/pexels-photo-532743.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/295045/pexels-photo-295045.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/289511/pexels-photo-289511.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/169918/pexels-photo-169918.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/209956/pexels-photo-209956.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/236230/pexels-photo-236230.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/336358/pexels-photo-336358.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/290590/pexels-photo-290590.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/326546/pexels-photo-326546.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/256081/pexels-photo-256081.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/260346/pexels-photo-260346.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/356726/pexels-photo-356726.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&w=800&h=400",
  "https://images.pexels.com/photos/257006/pexels-photo-257006.jpeg?auto=compress&w=800&h=400",
];

async function callMistral(prompt: string, maxTokens = 2000): Promise<string> {
  const response = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "You are a college data expert. Return ONLY valid JSON. No markdown, no explanation, no code fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  });

  if (response.status === 429) {
    console.log("  Rate limited – waiting 10s...");
    await new Promise((r) => setTimeout(r, 10_000));
    return callMistral(prompt, maxTokens);
  }

  if (!response.ok) throw new Error(`Mistral API error: ${response.status}`);
  return (await response.json()).choices[0].message.content;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractJSON(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      // try to fix truncated JSON - find the last complete object
      const truncated = cleaned.slice(start, end + 1);
      const fixed = truncated.replace(/,\s*$/, "").replace(/[{,]\s*$/, "") + "]";
      try { return JSON.parse(fixed); } catch {}
    }
  }
  const start2 = cleaned.indexOf("{");
  const end2 = cleaned.lastIndexOf("}");
  if (start2 !== -1 && end2 > start2) {
    return JSON.parse(cleaned.slice(start2, end2 + 1));
  }
  return JSON.parse(cleaned);
}

async function enrichExistingColleges() {
  console.log("Checking existing colleges...");
  const colleges = await prisma.college.findMany();
  console.log(`Found ${colleges.length} colleges total.`);

  let enriched = 0;
  for (const college of colleges) {
    const needsEnrichment = !college.overview || college.overview.length < 20 || !college.placements || college.placements.length < 10;
    if (!needsEnrichment) continue;

    try {
      const prompt = `Return JSON only: {"overview":"2-3 sentence description","courses":"comma-separated B.Tech/BE programs","placements":"Highest Package: ₹X CPA, Average Package: ₹Y LPA, Top Recruiters: list"} for "${college.name}" in ${college.location}.`;
      const result = await callMistral(prompt, 1000);
      await sleep(1500);
      const data = extractJSON(result) as Record<string, string>;

      await prisma.college.update({
        where: { id: college.id },
        data: {
          overview: data.overview || college.overview,
          courses: data.courses || college.courses,
          placements: data.placements || college.placements,
        },
      });
      enriched++;
      console.log(`  ✓ Enriched: ${college.name}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${college.name}`, err instanceof Error ? err.message : err);
    }
  }
  return enriched;
}

async function generateNewColleges(count: number) {
  console.log(`\nGenerating ${count} new colleges...`);
  let added = 0;
  const batchSize = 5;

  for (let batch = 0; batch < count; batch += batchSize) {
    const size = Math.min(batchSize, count - batch);
    try {
      const prompt = `Return a JSON array of ${size} Indian engineering colleges NOT in this list (IIT Bombay, IIT Delhi, IIT Madras, IIT Kharagpur, IIT Kanpur, IIT Roorkee, NIT Trichy, NIT Surathkal, BITS Pilani, DTU, VIT, MIT Manipal, IIT Guwahati, IIT Hyderabad, Anna University, Jadavpur University, COEP Pune, PSG Tech, Thapar, Shiv Nadar, SRM, LPU, Amrita, IIEST Shibpur, MNNIT, VNIT, NIT Warangal, SVNIT, MSU Baroda).

Each object: {"name":"","location":"City, State","fees":number(INR),"rating":number(1-5),"overview":"2-3 sentences","courses":"comma-separated programs","placements":"Highest: ₹X CPA, Average: ₹Y LPA, Recruiters: list","established":year,"type":"Public/Private"}
Return ONLY the JSON array.`;

      const result = await callMistral(prompt, 3000);
      await sleep(1500);
      const newColleges = extractJSON(result) as Array<Record<string, unknown>>;

      if (!Array.isArray(newColleges)) { console.log("  No valid array returned, skipping batch"); continue; }

      for (const c of newColleges) {
        const college = c as { name?: string; location?: string; fees?: number; rating?: number; overview?: string; courses?: string; placements?: unknown; established?: number; type?: string };
        if (!college.name) continue;

        const id = college.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const imageUrl = COLLEGE_IMAGES[(added + batch) % COLLEGE_IMAGES.length];

        let placementsStr = "";
        if (typeof college.placements === "string") {
          placementsStr = college.placements;
        } else if (college.placements && typeof college.placements === "object") {
          const p = college.placements as Record<string, unknown>;
          const parts: string[] = [];
          if (p.highest) parts.push(`Highest Package: ₹${p.highest}`);
          if (p.average) parts.push(`Average Package: ₹${p.average} LPA`);
          if (Array.isArray(p.recruiters)) parts.push(`Top Recruiters: ${(p.recruiters as string[]).join(", ")}`);
          placementsStr = parts.join(", ");
        }

        try {
          await prisma.college.create({
            data: {
              id,
              name: college.name || "Unknown",
              location: college.location || "Unknown",
              fees: college.fees || 100000,
              rating: college.rating || 3.5,
              overview: college.overview || "",
              courses: college.courses || "",
              placements: placementsStr,
              established: college.established || null,
              type: college.type || null,
              imageUrl,
            },
          });
          added++;
          console.log(`  ✓ Added: ${college.name}`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("Unique constraint")) {
            console.log(`  - Skipped (duplicate): ${college.name}`);
          } else {
            console.error(`  ✗ Failed: ${college.name}: ${msg}`);
          }
        }
      }
    } catch (err) {
      console.error(`  Batch failed:`, err instanceof Error ? err.message : err);
    }
  }
  return added;
}

async function seedReviewUsers() {
  const count = await prisma.user.count();
  if (count >= 3) return prisma.user.findMany({ take: 3 });
  const users = [];
  for (const name of ["Aarav Sharma", "Priya Patel", "Rahul Singh"]) {
    const email = `${name.toLowerCase().replace(" ", ".")}@reviewer.app`;
    let u = await prisma.user.findUnique({ where: { email } });
    if (!u) {
      u = await prisma.user.create({ data: { email, name } });
    }
    users.push(u);
  }
  return users;
}

async function generateReviews(users: Array<{ id: string }>) {
  console.log("\nGenerating reviews for colleges...");
  const colleges = await prisma.college.findMany({ take: 30 });
  let generated = 0;

  for (const college of colleges) {
    const existingCount = await prisma.collegeReview.count({ where: { collegeId: college.id } });
    if (existingCount >= 3) { console.log(`  - ${college.name}: ${existingCount} reviews exist`); continue; }

    try {
      const prompt = `Return a JSON array of ${3 - existingCount} realistic student reviews for ${college.name}. Each: {"rating":3-5,"comment":"20-50 word review as a student"}. Return ONLY the JSON array.`;
      const result = await callMistral(prompt, 1500);
      await sleep(1500);
      const reviews = extractJSON(result) as Array<Record<string, unknown>>;

      if (!Array.isArray(reviews)) continue;

      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i] as { rating?: number; comment?: string };
        const userId = users[i % users.length].id;
        const existing = await prisma.collegeReview.findFirst({
          where: { collegeId: college.id, userId },
        });
        if (!existing) {
          await prisma.collegeReview.create({
            data: {
              collegeId: college.id,
              userId,
              rating: review.rating || 4,
              comment: review.comment || "Great college!",
            },
          });
          generated++;
        }
      }
      console.log(`  ✓ Added reviews to: ${college.name}`);
    } catch (err) {
      console.error(`  ✗ Failed reviews for ${college.name}:`, err instanceof Error ? err.message : err);
    }
  }
  return generated;
}

async function addImages() {
  console.log("\nAdding images to colleges without images...");
  const colleges = await prisma.college.findMany({ where: { imageUrl: null } });
  let updated = 0;

  for (let i = 0; i < colleges.length; i++) {
    await prisma.college.update({
      where: { id: colleges[i].id },
      data: { imageUrl: COLLEGE_IMAGES[i % COLLEGE_IMAGES.length] },
    });
    updated++;
  }
  console.log(`  Added images to ${updated} colleges`);
  return updated;
}

async function main() {
  console.log("=== College Data Enrichment ===\n");

  await addImages();
  await enrichExistingColleges();
  const newColleges = await generateNewColleges(10);
  const reviewers = await seedReviewUsers();
  const reviews = await generateReviews(reviewers);

  const total = await prisma.college.count();
  const totalReviews = await prisma.collegeReview.count();
  console.log(`\nDone! Total: ${total} colleges, ${totalReviews} reviews.`);
  await prisma.$disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
