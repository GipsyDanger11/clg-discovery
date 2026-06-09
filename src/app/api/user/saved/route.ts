import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";

export async function GET() {
  try {
    const userId = await requireUserId();
    const savedItems = await prisma.savedItem.findMany({
      where: { userId },
      include: { college: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(savedItems);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to fetch saved items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { collegeId } = await request.json();

    if (!collegeId) {
      return Response.json({ error: "collegeId is required" }, { status: 400 });
    }

    const existing = await prisma.savedItem.findUnique({
      where: { userId_collegeId: { userId, collegeId } },
    });

    if (existing) {
      return Response.json({ error: "Already saved" }, { status: 409 });
    }

    const savedItem = await prisma.savedItem.create({
      data: { userId, collegeId },
      include: { college: true },
    });

    return Response.json(savedItem, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to save item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const collegeId = request.nextUrl.searchParams.get("collegeId");

    if (!collegeId) {
      return Response.json({ error: "collegeId is required" }, { status: 400 });
    }

    await prisma.savedItem.delete({
      where: { userId_collegeId: { userId, collegeId } },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to remove saved item" }, { status: 500 });
  }
}
