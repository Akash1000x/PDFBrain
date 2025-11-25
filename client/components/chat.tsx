"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import PromptInput from "./prompt-input";
import * as React from "react";
import Markdown from "./markdown";
import { Skeleton } from "./ui/skeleton";
import { API_URL } from "@/lib/utils";
import useFileStore from "@/store/file";
import { toast } from "sonner";
import { File } from "lucide-react";

export default function Page() {
  const [message, setMessage] = React.useState<string>("");
  const currentFile = useFileStore((state) => state.currentFile);
  const [ragType, setRagType] = React.useState<"simple" | "multi" | "decomposition">("simple");

  const apiUrl = React.useMemo(() => {
    return ragType === "simple"
      ? `${API_URL}/query-rewriting-rag-chat`
      : ragType === "multi"
      ? `${API_URL}/multi-query-rag-chat`
      : `${API_URL}/query-decomposition-rag-chat`;
  }, [ragType]);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new TextStreamChatTransport({
      api: apiUrl,
    }),
    id: ragType,
  });
  const handleSubmit = (data: { message: string }) => {
    if (!currentFile) {
      toast.error("Please select a file or upload a new one");
      return;
    }
    sendMessage(
      { text: data.message },
      {
        body: {
          fileName: currentFile,
        },
      }
    );
  };

  return (
    <div className="h-screen relative">
      {currentFile && (
        <div className="flex items-center gap-2 p-2 border w-fit rounded-md fixed top-2 left-2 bg-secondary z-20">
          <File />
          <p>{currentFile?.split("_").slice(1).join(" ")}</p>
        </div>
      )}
      <div className="space-y-10 lg:w-3xl w-xl mx-auto px-3 pt-8 pb-44">
        {messages?.map((message, i) => (
          <div key={`${message.id + i}`} className="">
            {message.role === "user" ? (
              <div className="group">
                <div className="p-4 bg-muted rounded-md max-w-xl ml-auto text-justify">
                  {message.parts[0].type === "text" ? message.parts[0].text : message.parts[0].type}
                </div>
              </div>
            ) : (
              message.parts.map((part, index) => (
                <div key={`${message.id}-${index}`}>
                  {part.type === "text" && (
                    <div className="border rounded-md px-4 bg-accent/30 mr-2">
                      <MemoizedReactMarkdown>{part.text}</MemoizedReactMarkdown>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
        {status === "submitted" && (
          <div className="flex gap-2">
            <Skeleton className="size-3" />
            <Skeleton className="size-3" />
            <Skeleton className="size-3" />
          </div>
        )}
      </div>
      <PromptInput
        onSubmit={handleSubmit}
        message={message}
        setMessage={setMessage}
        disabled={false}
        ragType={ragType}
        setRagType={setRagType}
        resetChat={() => {
          setMessages([]);
        }}
      />
    </div>
  );
}

const MemoizedReactMarkdown: React.FC<{ children: string }> = React.memo(
  Markdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
