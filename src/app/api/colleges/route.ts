import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const minFees = searchParams.get("minFees");
  const maxFees = searchParams.get("maxFees");
  const minRating = searchParams.get("minRating");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
      { courses: { contains: query, mode: "insensitive" } },
    ];
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (minFees) {
    where.fees = { ...(where.fees as object || {}), gte: parseInt(minFees) };
  }

  if (maxFees) {
    where.fees = { ...(where.fees as object || {}), lte: parseInt(maxFees) };
  }

  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }

  const orderBy = { [sortBy]: sortOrder };

  const skip = (page - 1) * limit;

  const [colleges, total] = await Promise.all([
    prisma.college.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.college.count({ where }),
  ]);

  return Response.json({
    colleges,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
