import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { useAppStore } from "@/store/use-app-store";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isSidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <div
      className="flex w-full bg-background overflow-hidden selection:bg-primary/30"
      style={{ height: "100dvh" }}
    >
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col border-r border-border bg-sidebar relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-sidebar border-r border-border z-50 md:hidden flex flex-col"
            >
              <Sidebar />
              <button 
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-sidebar rounded-full border border-border"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10"
          style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "1rem" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="font-display font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            SANSA AI
          </div>
          <div className="w-8" />
        </div>

        {/* Content */}
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
