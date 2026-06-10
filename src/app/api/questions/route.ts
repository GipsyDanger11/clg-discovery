import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const collegeId = searchParams.get("collegeId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (collegeId) where.collegeId = collegeId;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        college: { select: { id: true, name: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  return Response.json({ questions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const body = await request.json();
    const { title, body: detail, collegeId } = body;

    if (!title || !detail) {
      return Response.json({ error: "Title and details are required" }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: { userId, title, body: detail, collegeId: collegeId || null },
    });

    const created = await prisma.question.findUnique({
      where: { id: question.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        college: { select: { id: true, name: true } },
      },
    });

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: "Failed to create question" }, { status: 500 });
  }
}
