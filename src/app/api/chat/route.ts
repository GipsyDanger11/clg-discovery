import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { message, conversationId } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    let conversation;
    if (conversationId) {
      conversation = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!conversation) {
        return Response.json({ error: "Conversation not found" }, { status: 404 });
      }
    } else {
      conversation = await prisma.chatConversation.create({
        data: {
          userId,
          title: message.slice(0, 100),
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const pythonResponse = await fetch(`${PYTHON_SERVICE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversation_history: (
          await prisma.chatMessage.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: "asc" },
            take: 20,
          })
        ).map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!pythonResponse.ok) {
      throw new Error("AI service error");
    }

    const aiData = await pythonResponse.json();
    const aiMessage = aiData.response || aiData.message || "I'm not sure how to respond.";

    const savedMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: aiMessage,
      },
    });

    return Response.json({
      message: savedMessage,
      conversationId: conversation.id,
      conversationTitle: conversation.title,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await requireUserId();

    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json(conversations);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
