import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, File, FileSpreadsheet, FileText, Presentation, Trash2, Download, FolderOpen } from "lucide-react";
import { useDocumentGenerator } from "@/hooks/use-document-generator";

type FileType = "pdf" | "excel" | "word" | "ppt";
type FilterTab = "all" | FileType;

interface SavedDocument {
  id: number;
  userId: string | null;
  conversationId: string | null;
  title: string;
  fileType: FileType;
  content: string;
  createdAt: string;
}

const FILE_TYPE_CONFIG: Record<FileType, { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  pdf: {
    label: "PDF",
    icon: File,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  excel: {
    label: "Excel",
    icon: FileSpreadsheet,
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  word: {
    label: "Word",
    icon: FileText,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  ppt: {
    label: "PPT",
    icon: Presentation,
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pdf", label: "PDF" },
  { key: "excel", label: "Excel" },
  { key: "word", label: "Word" },
  { key: "ppt", label: "PPT" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function fetchDocuments(): Promise<SavedDocument[]> {
  const res = await fetch("/api/documents", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

async function deleteDocumentApi(id: number): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete document");
}

export default function DocumentsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [downloading, setDownloading] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { downloadPDF, downloadExcel, downloadWord, downloadPPT } = useDocumentGenerator({ autoSave: false });

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: fetchDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocumentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const filtered = filter === "all" ? documents : documents.filter((d) => d.fileType === filter);

  const handleDownload = async (doc: SavedDocument) => {
    setDownloading(doc.id);
    try {
      if (doc.fileType === "pdf") await downloadPDF(doc.content);
      else if (doc.fileType === "excel") await downloadExcel(doc.content);
      else if (doc.fileType === "word") await downloadWord(doc.content);
      else await downloadPPT(doc.content);
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this document?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="hidden md:flex h-14 border-b border-border items-center px-6 bg-background/95 backdrop-blur z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Document Center</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Page title (mobile) */}
        <div className="flex items-center gap-2 mb-4 md:hidden">
          <Folder className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Document Center</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/50 p-1 rounded-xl w-fit">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <FolderOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-1">No documents yet</p>
            <p className="text-sm text-muted-foreground/70">
              {filter === "all"
                ? "Ask SANSA to generate a document and download it — it will appear here."
                : `No ${FILE_TYPE_CONFIG[filter as FileType]?.label} documents found.`}
            </p>
          </motion.div>
        )}

        {/* Document Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((doc) => {
                const cfg = FILE_TYPE_CONFIG[doc.fileType];
                const Icon = cfg?.icon ?? File;
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow"
                  >
                    {/* Top row: icon + type badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2.5 rounded-lg ${cfg?.bgColor} ${cfg?.borderColor} border`}>
                        <Icon className={`w-5 h-5 ${cfg?.color}`} />
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg?.bgColor} ${cfg?.color} ${cfg?.borderColor} border`}>
                        {cfg?.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1 border-t border-border">
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloading === doc.id ? "Generating…" : "Download"}
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors disabled:opacity-50"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
