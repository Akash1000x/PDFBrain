import { ArrowUp, RotateCcw } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import React from "react";
import PdfUpload from "./pdf-upload";
import { toast } from "sonner";
import useFileStore from "@/store/file";

export default function PromptInput({
  onSubmit,
  message,
  setMessage,
  disabled,
  ragType,
  setRagType,
  resetChat,
}: {
  onSubmit: (data: { message: string }) => void;
  message: string;
  setMessage: (message: string) => void;
  disabled: boolean;
  ragType: "simple" | "multi";
  setRagType: (ragType: "simple" | "multi") => void;
  resetChat: () => void;
}) {
  const currentFile = useFileStore((state) => state.currentFile);
  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    onSubmit({ message });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      if (!currentFile) {
        toast.error("Please select a file or upload a new one");
        return;
      }
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="lg:w-3xl w-xl fixed bottom-0 left-1/2 -translate-x-1/2 border rounded-t-lg bg-secondary z-20">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Textarea
          className="border-none resize-none font-medium max-h-64 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent!"
          placeholder="Type your message here..."
          name="input"
          value={message}
          onChange={(e) => {
            if (e.target.value !== "\n") {
              setMessage(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center justify-between p-2 gap-2">
          <Button size="sm" variant="destructive" onClick={() => resetChat()}>
            <RotateCcw />
            Reset Chat
          </Button>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={ragType === "simple" ? "default" : "outline"}
              onClick={() => setRagType("simple")}
            >
              Simple RAG
            </Button>
            <Button size="sm" variant={ragType === "multi" ? "default" : "outline"} onClick={() => setRagType("multi")}>
              Multi Query RAG
            </Button>
            <PdfUpload />
            <Button size={"icon"} type="submit" aria-label="Send message" disabled={!message.trim() || disabled}>
              <ArrowUp />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
