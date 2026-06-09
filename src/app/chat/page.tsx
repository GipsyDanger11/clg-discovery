import { ChatInterface } from "@/components/ChatInterface";
import { PageTransition } from "@/components/Motion";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI College Assistant</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ask me anything about colleges, courses, placements, and more.
          </p>
        </div>
        <ChatInterface />
      </PageTransition>
    </div>
  );
}
