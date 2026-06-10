import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-utils";

export const maxDuration = 60;

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a helpful college discovery assistant helping students find the best colleges in India.

When suggesting colleges, ALWAYS format your response with clear structure:

For each college, include:
• **Name** – bold
• **Location** – city, state
• **Type** – Government / Private
• **Cutoff** – entrance exam and approximate percentile/rank for 87%
• **Fees** – annual tuition
• **Placements** – average package
• **Ranking** – NIRF or other known ranking

Organize colleges by category (e.g., Engineering, Science, Commerce).
Use bullet points and short paragraphs. Be specific with numbers.
If exact data isn't known, give realistic estimates and note them.
Be concise. If you don't know something, say so honestly.`;

async function callMistralDirect(message: string, history: { role: string; content: string }[]) {
  if (!MISTRAL_API_KEY) {
    return "AI service is not configured. Please set MISTRAL_API_KEY in the environment.";
  }

  const messages = [{ role: "system", content: SYSTEM_PROMPT }];
  for (const msg of history.slice(-10)) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: "user", content: message });

  const res = await fetch(MISTRAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Mistral API error:", err);
    throw new Error(`Mistral API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callPythonService(message: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${PYTHON_SERVICE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversation_history: history }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error("Python service error");
  const data = await res.json();
  return data.response || data.message || "I'm not sure how to respond.";
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
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

    const conversationHistory = (
      await prisma.chatMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "asc" },
        take: 20,
      })
    ).map((m) => ({ role: m.role, content: m.content }));

    let aiMessage: string;

    // Try Python service first, fall back to direct Mistral call
    try {
      aiMessage = await callPythonService(message, conversationHistory);
    } catch {
      console.log("Python service unavailable, calling Mistral directly");
      aiMessage = await callMistralDirect(message, conversationHistory);
    }

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
    console.error("Chat API error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json({ error: "Failed to process chat message" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);

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
