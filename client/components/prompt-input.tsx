import { ArrowUp } from "lucide-react";
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
}: {
  onSubmit: (data: { message: string }) => void;
  message: string;
  setMessage: (message: string) => void;
  disabled: boolean;
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
        <div className="flex items-center justify-end p-2 gap-2">
          <PdfUpload />
          <Button size={"icon"} type="submit" aria-label="Send message" disabled={!message.trim() || disabled}>
            <ArrowUp />
          </Button>
        </div>
      </form>
    </div>
  );
}
