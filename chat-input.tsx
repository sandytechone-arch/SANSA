import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAppStore } from "@/store/use-app-store";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hrMode, language } = useAppStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleAttachImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("Image must be under 20MB");
      return;
    }
    setAttachedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if ((!input.trim() && !attachedImage) || disabled) return;
    onSend(input.trim(), attachedImage || undefined);
    setInput("");
    removeImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleAttachImage(file);
  }, [handleAttachImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  return (
    <div
      className="w-full max-w-4xl mx-auto p-4 pt-0"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {(hrMode || language !== 'English') && (
        <div className="flex gap-2 mb-2 px-2">
          {hrMode && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> HR Mode Active
            </span>
          )}
          {language !== 'English' && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
              {language}
            </span>
          )}
        </div>
      )}

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/40 to-zinc-600/40 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

        <div className={cn(
          "relative flex flex-col bg-[#2a2a2e] border rounded-3xl shadow-lg transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-border"
        )}>
          {imagePreview && (
            <div className="px-3 pt-3 pb-1">
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Attached"
                  className="h-20 w-auto rounded-xl border border-border object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {isDragOver && (
            <div className="px-4 py-3 flex items-center gap-2 text-primary text-sm">
              <ImageIcon className="w-4 h-4" />
              Drop image here...
            </div>
          )}

          <div className="flex items-end gap-2 p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAttachImage(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all mb-0.5"
              title="Attach image"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedImage ? "Add a message about this image..." : "Message SANSA..."}
              disabled={disabled}
              rows={1}
              className="w-full max-h-[200px] min-h-[44px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none px-2 py-3 text-[15px] leading-relaxed scrollbar-thin"
            />

            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && !attachedImage) || disabled}
              className={cn(
                "shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 mb-0.5 mr-0.5",
                (input.trim() || attachedImage) && !disabled
                  ? "bg-zinc-700 text-white shadow-md hover:bg-zinc-600 hover:shadow-lg hover:scale-105 active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-[11px] text-muted-foreground">
          SANSA can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  );
}
