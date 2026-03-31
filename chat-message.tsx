import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { User, FileDown, FileSpreadsheet, FileText, File, Presentation, Copy, Check, Download, ImageIcon } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import sansaLogo from "@/assets/sansa-logo.png";
import { useDocumentGenerator } from "@/hooks/use-document-generator";
import { useState, useCallback } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  conversationId?: string | null;
  generatedImage?: string | null;
}

function CodeBlock({ inline, className, children, ...props }: any) {
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[13px] font-mono text-pink-600 dark:text-pink-400" {...props}>
        {children}
      </code>
    );
  }

  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-3 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-border">
        <span className="text-[11px] font-mono text-muted-foreground uppercase">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 bg-zinc-50 dark:bg-zinc-900 text-[13px] leading-relaxed">
        <code className={cn("font-mono", className)} {...props}>{children}</code>
      </pre>
    </div>
  );
}

function cleanContentForDisplay(content: string): string {
  return content.replace(/\[GENERATE_IMAGE:\s*.*?\]/gs, "").trim();
}

export function ChatMessage({ role, content, isStreaming, conversationId, generatedImage }: ChatMessageProps) {
  const isUser = role === "user";
  const { user, isAuthenticated } = useAuth();
  const { hasDocument, downloadPDF, downloadExcel, downloadWord, downloadPPT } = useDocumentGenerator(conversationId);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [messageCopied, setMessageCopied] = useState(false);

  const displayName = isAuthenticated && user?.firstName
    ? user.firstName
    : isAuthenticated && user?.email
      ? user.email.split("@")[0]
      : "You";

  const displayContent = cleanContentForDisplay(content);
  const showDownload = !isUser && !isStreaming && hasDocument(content);
  const hasAttachedImage = isUser && content.includes("[Image attached]");

  const handleDownload = async (type: "pdf" | "excel" | "word" | "ppt") => {
    setDownloading(type);
    try {
      if (type === "pdf") await downloadPDF(content);
      else if (type === "excel") await downloadExcel(content);
      else if (type === "word") await downloadWord(content);
      else await downloadPPT(content);
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(content);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 2000);
  }, [content]);

  const handleDownloadImage = (imgSrc: string) => {
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = "sansa-generated-image.png";
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group/msg flex w-full px-4 md:px-8 py-5",
        isUser ? "justify-end" : "justify-start bg-secondary/30 border-y border-border/50"
      )}
    >
      <div className={cn(
        "flex gap-3 max-w-3xl w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>

        <div className="shrink-0 flex items-start pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-secondary flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow flex-shrink-0">
              <img src={sansaLogo} alt="SANSA" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className={cn(
          "flex flex-col gap-1.5 min-w-0 max-w-[90%]",
          isUser ? "items-end" : "items-start"
        )}>
          <span className="text-[11px] font-medium text-muted-foreground px-0.5">
            {isUser ? displayName : "SANSA"}
          </span>

          <div className={cn(
            "text-[14px] md:text-[15px] leading-relaxed",
            isUser
              ? "bg-zinc-800 dark:bg-zinc-700 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm"
              : "bg-transparent text-foreground"
          )}>
            {isUser ? (
              <div className="whitespace-pre-wrap">
                {hasAttachedImage ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-300" />
                    <span>{content.replace("\n[Image attached]", "").trim() || "Sent an image"}</span>
                  </div>
                ) : (
                  content
                )}
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none text-foreground prose-sm md:prose-base">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ code: CodeBlock }}
                >
                  {displayContent}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-foreground/70 animate-pulse rounded-sm" />
                )}
              </div>
            )}
          </div>

          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 relative group/img"
            >
              <img
                src={generatedImage}
                alt="AI Generated"
                className="max-w-sm w-full rounded-2xl border border-border shadow-lg"
              />
              <button
                onClick={() => handleDownloadImage(generatedImage)}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 text-white text-xs rounded-lg flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/90"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </motion.div>
          )}

          {!isUser && !isStreaming && displayContent.length > 0 && (
            <button
              onClick={handleCopyMessage}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-all opacity-0 group-hover/msg:opacity-100"
            >
              {messageCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {messageCopied ? "Copied" : "Copy"}
            </button>
          )}

          {showDownload && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mt-1"
            >
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 w-full">
                <FileDown className="w-3 h-3" /> Download document as:
              </span>
              <button
                onClick={() => handleDownload("pdf")}
                disabled={!!downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
              >
                <File className="w-3.5 h-3.5" />
                {downloading === "pdf" ? "Generating..." : "PDF"}
              </button>
              <button
                onClick={() => handleDownload("excel")}
                disabled={!!downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {downloading === "excel" ? "Generating..." : "Excel"}
              </button>
              <button
                onClick={() => handleDownload("word")}
                disabled={!!downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                {downloading === "word" ? "Generating..." : "Word"}
              </button>
              <button
                onClick={() => handleDownload("ppt")}
                disabled={!!downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors disabled:opacity-50"
              >
                <Presentation className="w-3.5 h-3.5" />
                {downloading === "ppt" ? "Generating..." : "PPT"}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
