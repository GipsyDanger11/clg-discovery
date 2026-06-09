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

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (session?.user) { fetchConversations(); } }, [session]);
  useEffect(() => { if (conversationId && session?.user) { fetchConversation(conversationId); } }, [conversationId, session]);

  async function fetchConversations() {
    try { const res = await fetch("/api/chat"); if (res.ok) setConversations(await res.json()); } catch {}
  }

  async function fetchConversation(id: string) {
    try { const res = await fetch(`/api/chat/${id}`); if (res.ok) { const c = await res.json(); setMessages(c.messages || []); setCurrentConvId(id); } } catch {}
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    setLoading(true);
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: "temp", conversationId: currentConvId || "", role: "user", content: userMessage, createdAt: new Date().toISOString() }]);

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMessage, conversationId: currentConvId }) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCurrentConvId(data.conversationId);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { id: "u", conversationId: data.conversationId, role: "user", content: userMessage, createdAt: new Date().toISOString() },
        { id: data.message.id, conversationId: data.conversationId, role: "assistant", content: data.message.content, createdAt: data.message.createdAt },
      ]);
      fetchConversations();
    } catch {
      setMessages((prev) => [...prev, { id: "err", conversationId: currentConvId || "", role: "assistant", content: "Sorry, something went wrong.", createdAt: new Date().toISOString() }]);
    } finally { setLoading(false); }
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Sign in to use the AI Chat Assistant</p>
        <Link href="/auth/signin" className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors shadow-sm">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      <div className="w-64 shrink-0 rounded-2xl border border-gray-150 bg-white p-3 overflow-y-auto shadow-sm">
        <button onClick={() => { setMessages([]); setCurrentConvId(undefined); }} className="mb-3 w-full rounded-xl bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors shadow-sm">
          + New Chat
        </button>
        {conversations.map((conv) => (
          <button key={conv.id} onClick={() => fetchConversation(conv.id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${currentConvId === conv.id ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
            <div className="truncate">{conv.title}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col rounded-2xl border border-gray-150 bg-white shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400">
              Ask me anything about colleges!
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-primary-500 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-3 rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:opacity-50 transition-all"
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
