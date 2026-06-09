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
            className="fixed bottom-0 right-0 z-50 flex h-[80vh] w-full max-w-md flex-col rounded-tl-2xl bg-white shadow-2xl sm:right-6 sm:bottom-6 sm:h-[70vh] sm:rounded-2xl"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-center border-b border-gray-100 px-5 py-3.5 bg-gradient-to-r from-primary-50/50 to-white relative">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-600 shadow-sm">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">AI Assistant</span>
                  <p className="text-xs text-gray-400">College discovery help</p>
                </div>
              </div>
              <button onClick={onClose} className="absolute right-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-14 shrink-0 border-r border-gray-100 overflow-y-auto py-3 flex flex-col items-center gap-1.5 bg-gray-50/30">
                <button
                  onClick={() => { setMessages([]); setCurrentConvId(undefined); }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm border border-primary-100 hover:bg-primary-50 hover:border-primary-200 transition-all"
                  title="New Chat"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <div className="w-6 border-t border-gray-200 my-1" />
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => fetchConversation(c.id)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                      currentConvId === c.id
                        ? "bg-primary-100 text-primary-700 shadow-sm"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 mb-4">
                        <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-4">Sign in to use the AI Chat Assistant</p>
                      <Link href="/auth/signin" className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 hover:shadow-md transition-all">
                        Sign In
                      </Link>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 mb-4">
                        <svg className="h-7 w-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-500">Ask me anything about colleges!</p>
                      <p className="text-xs text-gray-400 mt-1">Admissions, rankings, fees, and more</p>
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

                <div className="border-t border-gray-100 p-3 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Ask about colleges..."
                      disabled={loading}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white disabled:opacity-50 transition-all"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm text-white font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-sm"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
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
