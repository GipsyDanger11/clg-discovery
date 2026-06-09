"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ChatMessage, ChatConversation } from "@/lib/types";

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(conversationId);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (session?.user) {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    if (conversationId && session?.user) {
      fetchConversation(conversationId);
    }
  }, [conversationId, session]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch {}
  }

  async function fetchConversation(id: string) {
    try {
      const res = await fetch(`/api/chat/${id}`);
      if (res.ok) {
        const conv = await res.json();
        setMessages(conv.messages || []);
        setCurrentConvId(id);
      }
    } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: "temp", conversationId: currentConvId || "", role: "user", content: userMessage, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId: currentConvId }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setCurrentConvId(data.conversationId);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: "temp-user", conversationId: data.conversationId, role: "user", content: userMessage, createdAt: new Date().toISOString() },
        { id: data.message.id, conversationId: data.conversationId, role: "assistant", content: data.message.content, createdAt: data.message.createdAt },
      ]);

      fetchConversations();
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: "error", conversationId: currentConvId || "", role: "assistant", content: "Sorry, something went wrong. Please try again.", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function newChat() {
    setMessages([]);
    setCurrentConvId(undefined);
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-purple-200 text-lg mb-4">Sign in to use the AI Chat Assistant</p>
        <Link
          href="/auth/signin"
          className="rounded-lg bg-purple-600 px-5 py-2 text-white hover:bg-purple-500 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      <div className="w-64 shrink-0 rounded-xl border border-purple-500/20 bg-purple-950/40 p-3 overflow-y-auto">
        <button
          onClick={newChat}
          className="mb-3 w-full rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-500 transition-colors"
        >
          + New Chat
        </button>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => fetchConversation(conv.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              currentConvId === conv.id
                ? "bg-purple-700/60 text-purple-100"
                : "text-purple-300 hover:bg-purple-800/40"
            }`}
          >
            <div className="truncate">{conv.title}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col rounded-xl border border-purple-500/20 bg-purple-950/40">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-purple-400">
              Ask me anything about colleges!
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-800/60 text-purple-100"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="mt-1 text-[10px] opacity-50">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-purple-800/60 px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-purple-500/20 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-lg border border-purple-500/30 bg-purple-900/50 px-4 py-2.5 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
