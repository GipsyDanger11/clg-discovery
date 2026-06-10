import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const exam = searchParams.get("exam");
  const rank = searchParams.get("rank");

  if (!exam || !rank) {
    return Response.json({ error: "exam and rank are required" }, { status: 400 });
  }

  const rankNum = parseInt(rank);
  if (isNaN(rankNum) || rankNum < 1) {
    return Response.json({ error: "Invalid rank" }, { status: 400 });
  }

  const colleges = await prisma.college.findMany({ orderBy: { rating: "desc" } });

  const results = colleges
    .map((c) => {
      const match = computeMatch(c, exam, rankNum);
      return match ? { ...c, matchReason: match.reason, confidence: match.confidence } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.confidence - a!.confidence);

  return Response.json({ results, total: results.length });
}

function computeMatch(college: { name: string; type: string | null; fees: number; rating: number; courses: string; placements: string }, exam: string, rank: number): { reason: string; confidence: number } | null {
  const nameLC = college.name.toLowerCase();
  const coursesLC = college.courses.toLowerCase();
  const placementLC = college.placements.toLowerCase();

  const hasCSE = coursesLC.includes("computer science") || coursesLC.includes("cse");
  const hasECE = coursesLC.includes("electronics") || coursesLC.includes("ece");
  const hasME = coursesLC.includes("mechanical") || coursesLC.includes("me");
  const isIIT = nameLC.startsWith("iit") || college.type === "IIT" || college.type === "Public" && nameLC.includes("indian institute of technology");
  const isNIT = nameLC.includes("nit ") || nameLC.includes("national institute of technology");
  const isBITS = nameLC.includes("bits");
  const isPrivate = college.type === "Private";

  let reason = "";
  let confidence = 0;

  // JEE Advanced (for IITs, ranks ~50-15000)
  if (exam.toLowerCase() === "jee advanced" || exam.toLowerCase() === "jee adv") {
    if (isIIT) {
      if (rank <= 500) { reason = "Highly recommended — top rank opens all IIT branches including CSE at old IITs"; confidence = 95; }
      else if (rank <= 2000) { reason = "Strong chance at top IITs for core branches like ME/EE/Civil"; confidence = 85; }
      else if (rank <= 5000) { reason = "Good chance at IITs for core branches, or CSE at newer IITs"; confidence = 75; }
      else if (rank <= 10000) { reason = "Possible at newer IITs for core branches"; confidence = 60; }
      else { reason = "Borderline for IITs — consider NITs or IIITs as backup"; confidence = 30; }
    } else if (isNIT) {
      if (rank <= 5000) { reason = "Excellent NIT options with CSE at top NITs"; confidence = 90; }
      else if (rank <= 15000) { reason = "Good NIT options for core branches"; confidence = 80; }
      else { reason = "Possible at mid-ranked NITs"; confidence = 60; }
    } else if (isBITS) {
      reason = "Consider BITSAT instead — BITS doesn't accept JEE Advanced";
      confidence = 20;
    } else {
      return null;
    }
  }

  // JEE Main (for NITs, IIITs, GFTIs, private)
  else if (exam.toLowerCase() === "jee main") {
    if (isNIT) {
      if (rank <= 5000) { reason = "Top NITs for CSE"; confidence = 90; }
      else if (rank <= 15000) { reason = "Top NITs for core branches"; confidence = 85; }
      else if (rank <= 30000) { reason = "Good NITs for CSE/ECE or top NITs for core"; confidence = 75; }
      else if (rank <= 60000) { reason = "Mid NITs for core branches"; confidence = 65; }
      else if (rank <= 100000) { reason = "Lower-ranked NITs or IIITs"; confidence = 50; }
      else { reason = "Consider state government colleges or private institutes"; confidence = 30; }
    } else if (isIIT) {
      reason = "IITs require JEE Advanced — JEE Main rank not used for IIT admissions";
      confidence = 10;
    } else if ((nameLC.includes("dtu") || nameLC.includes("delhi technological")) && rank <= 15000) {
      reason = "Good chance at DTU for core branches"; confidence = 75;
    } else if (nameLC.includes("thapar") && rank <= 50000) {
      reason = "Good chance at Thapar Institute"; confidence = 70;
    } else {
      return null;
    }
  }

  // MHT-CET (for Maharashtra colleges)
  else if (exam.toLowerCase() === "mht cet") {
    const percentile = rank; // treat rank as percentile for MHT-CET
    if (nameLC.includes("vjti") || nameLC.includes("veermata")) {
      if (percentile >= 97) { reason = "Strong chance at VJTI for core branches"; confidence = 80; }
      else { reason = "VJTI may be tough — consider COEP or DJ Sanghvi"; confidence = 40; }
    } else if (nameLC.includes("coep") || nameLC.includes("college of engineering pune")) {
      if (percentile >= 96) { reason = "Good chance at COEP"; confidence = 80; }
      else { reason = "COEP may be tough"; confidence = 40; }
    } else if (nameLC.includes("pict") || nameLC.includes("pune institute of computer")) {
      if (percentile >= 93) { reason = "Good chance at PICT for CSE"; confidence = 80; }
    } else if (nameLC.includes("sanghvi") || nameLC.includes("dj sanghvi")) {
      if (percentile >= 90) { reason = "Good chance at DJ Sanghvi"; confidence = 75; }
    } else if (nameLC.includes("somaiya") || nameLC.includes("kjsce")) {
      if (percentile >= 88) { reason = "Good chance at KJ Somaiya"; confidence = 75; }
    } else {
      return null;
    }
  }

  // Generic fallback
  else {
    if (rank <= 1000 && isIIT) { reason = "Excellent rank for top IITs"; confidence = 85; }
    else if (rank <= 5000 && (isNIT || isIIT)) { reason = "Good rank for top NITs or IIT core branches"; confidence = 75; }
    else if (rank <= 50000 && isPrivate) { reason = "Consider this private institute"; confidence = 50; }
    else { return null; }
  }

  if (!reason) return null;
  return { reason, confidence };
}
