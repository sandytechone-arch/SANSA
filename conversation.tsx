import { useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useGetOpenaiConversation } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useAppStore } from "@/store/use-app-store";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { Loader2 } from "lucide-react";

export default function ConversationPage() {
  const [, params] = useRoute("/c/:id");
  const conversationId = params?.id ? parseInt(params.id, 10) : 0;

  const { data: conversation, isLoading, isError } = useGetOpenaiConversation(conversationId, {
    query: {
      enabled: !!conversationId,
      refetchOnWindowFocus: false,
    }
  });

  const { sendMessage, isStreaming, streamedContent, generatedImage } = useChatStream({ conversationId });
  const { pendingMessage, setPendingMessage, hrMode, language } = useAppStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, streamedContent]);

  useEffect(() => {
    if (pendingMessage && conversationId && !isLoading) {
      const msgToSend = pendingMessage;
      setPendingMessage(null);
      handleSend(msgToSend);
    }
  }, [pendingMessage, conversationId, isLoading]);

  const handleSend = async (content: string, image?: File) => {
    await sendMessage(content, { hrMode, language }, image);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Conversation not found or failed to load.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="hidden md:flex h-14 border-b border-border items-center px-6 bg-background/95 backdrop-blur z-10 sticky top-0">
        <h2 className="font-semibold text-foreground truncate">{conversation.title}</h2>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}
      >
        <div className="w-full flex flex-col">
          {conversation.messages.length === 0 && !isStreaming && (
            <div className="text-center py-20 text-muted-foreground text-sm">
              This is the beginning of your conversation.
            </div>
          )}
          
          {conversation.messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              role={msg.role as "user" | "assistant"} 
              content={msg.content}
              conversationId={String(conversationId)}
            />
          ))}

          {isStreaming && streamedContent && (
            <ChatMessage 
              role="assistant" 
              content={streamedContent} 
              isStreaming={true}
              conversationId={String(conversationId)}
              generatedImage={generatedImage}
            />
          )}

          {isStreaming && !streamedContent && (
             <div className="flex w-full px-4 md:px-8 py-6 justify-start bg-secondary/30 border-y border-border/50">
               <div className="flex gap-4 max-w-4xl w-full">
                  <div className="shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center animate-pulse border border-border" />
                  </div>
                  <div className="flex items-center gap-1.5 h-10">
                     <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
               </div>
             </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
