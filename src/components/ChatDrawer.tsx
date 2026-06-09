"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { ChatMessage, ChatConversation } from "@/lib/types";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (session?.user && open) {
      fetch("/api/chat")
        .then((r) => r.json())
        .then(setConversations)
        .catch(() => {});
    }
  }, [session, open]);

  async function fetchConversation(id: string) {
    const res = await fetch(`/api/chat/${id}`);
    if (res.ok) {
      const conv = await res.json();
      setMessages(conv.messages || []);
      setCurrentConvId(id);
    }
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
        { id: "u", conversationId: data.conversationId, role: "user", content: userMessage, createdAt: new Date().toISOString() },
        { id: data.message.id, conversationId: data.conversationId, role: "assistant", content: data.message.content, createdAt: data.message.createdAt },
      ]);
      fetch("/api/chat").then((r) => r.json()).then(setConversations).catch(() => {});
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: "err", conversationId: currentConvId || "", role: "assistant", content: "Something went wrong. Please try again.", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 z-50 flex h-[80vh] w-full max-w-md flex-col rounded-tr-2xl bg-white shadow-2xl sm:left-6 sm:bottom-6 sm:h-[70vh] sm:rounded-2xl"
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800">AI College Assistant</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-16 shrink-0 border-r border-gray-100 overflow-y-auto py-2 flex flex-col items-center gap-1">
                <button
                  onClick={() => { setMessages([]); setCurrentConvId(undefined); }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                  title="New Chat"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => fetchConversation(c.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-medium transition-colors ${
                      currentConvId === c.id ? "bg-primary-100 text-primary-700" : "text-gray-400 hover:bg-gray-50"
                    }`}
                    title={c.title}
                  >
                    {c.title.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {!session?.user ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-gray-500 mb-3">Sign in to use the AI Chat Assistant</p>
                      <Link href="/auth/signin" className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600 transition-colors">
                        Sign In
                      </Link>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <svg className="h-12 w-12 mb-3 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                      <p className="text-sm">Ask me anything about colleges!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.role === "user"
                            ? "bg-primary-500 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
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

                <div className="border-t border-gray-100 p-3">
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
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
