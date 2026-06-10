import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      college: { select: { id: true, name: true } },
      answers: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!question) {
    return Response.json({ error: "Question not found" }, { status: 404 });
  }

  return Response.json(question);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId(request);
    const { id } = await params;
    const { body } = await request.json();

    if (!body) {
      return Response.json({ error: "Body is required" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    const answer = await prisma.answer.create({
      data: { questionId: id, userId, body },
    });

    const created = await prisma.answer.findUnique({
      where: { id: answer.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return Response.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to create answer" }, { status: 500 });
  }
}
