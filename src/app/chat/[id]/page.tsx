import { ChatInterface } from "@/components/ChatInterface";

export default async function ChatConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-100">AI College Assistant</h1>
        <p className="text-purple-300 text-sm mt-1">
          Continuing previous conversation
        </p>
      </div>
      <ChatInterface conversationId={id} />
    </div>
  );
}
