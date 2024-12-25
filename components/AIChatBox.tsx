import { cn } from "@/lib/utils";
import { Message } from "ai";
import { useChat } from "ai/react";
import { Bot, SendHorizonal, Trash, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AIChatbotProps {
  open: boolean;
  onClose: () => void;
}

export const AIChatBox = ({ open, onClose }: AIChatbotProps) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
    error,
  } = useChat(); //    /api/chat

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <div
      style={{
        zIndex: 9999,
        position: "fixed",
      }}
      className={cn(
        "z-100 xl:right-30 bottom-0 right-0 w-full max-w-[300px] p-1 transition-transform duration-500 sm:max-w-[400px] lg:max-w-[500px]",
        open ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex h-[600px] flex-col rounded border bg-background shadow-2xl">
        <button onClick={onClose} className="m-2 ms-auto block">
          <X size={30} />
        </button>
        <div className="mt-3 h-full overflow-y-auto px-3" ref={scrollRef}>
          {messages.map((message) => (
            <ChatMessage message={message} key={message.id} />
          ))}

          {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Thinking...",
              }}
            />
          )}

          {error && (
            <ChatMessage
              message={{
                role: "assistant",
                content: "Something went wrong. Please try again.",
              }}
            />
          )}

          {!error && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Bot size={36} />
              <div className="text-lg font-semibold">
                Send a message to start the AI chat!
              </div>

              <div className="text-gray-500">
                You can ask the chatbot any question about LangChain docs and it
                will find the relevant information on this website.
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-3">
          <Button
            title="Clear chat"
            variant="outline"
            size="icon"
            className="shrink-0"
            type="button"
            onClick={() => setMessages([])}
          >
            <Trash />
          </Button>

          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
            ref={inputRef}
          />
          <Button type="submit" disabled={input.length === 0}>
            <SendHorizonal size={24}/>
          </Button>
        </form>
      </div>
    </div>
  );
};

function ChatMessage({
  message: { role, content },
}: {
  message: Pick<Message, "role" | "content">;
}) {
  const isAIMessage = role === "assistant";

  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAIMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    >
      {isAIMessage && <Bot className="mr-2 shrink-0" />}
      <p
        className={cn(
          "whitespace-pre-line rounded-md border px-3 py-2",
          isAIMessage ? "bg-background" : "bg-primary text-primary-foreground",
        )}
      >
        {content}
      </p>
    </div>
  );
}
