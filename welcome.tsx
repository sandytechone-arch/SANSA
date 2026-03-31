import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import sansaLogo from "@/assets/sansa-logo.png";
import { useCreateOpenaiConversation } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-app-store";
import { ChatInput } from "@/components/chat-input";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";
import { useSiteConfig } from "@/hooks/use-site-config";
import {
  Briefcase, FileText, Languages, Lightbulb,
  BarChart3, PenLine, Code2, Heart, ImageIcon, Scale,
  GraduationCap, Globe, Rocket, Calculator, BookOpen,
  ShieldCheck, TrendingUp, Users, Landmark, Sparkles
} from "lucide-react";

const SUGGESTIONS = [
  { icon: Briefcase, label: "HR MODE", text: "Create a payroll sheet for 5 employees with PF and ESI", color: "text-blue-500" },
  { icon: FileText, label: "DOCUMENT", text: "Draft an offer letter for a Software Engineer", color: "text-green-500" },
  { icon: ImageIcon, label: "GENERATE IMAGE", text: "Generate a professional logo for a tech startup called NovaTech", color: "text-pink-500" },
  { icon: Code2, label: "CODING", text: "Write a Python script to scrape product prices from a website", color: "text-orange-500" },
  { icon: Heart, label: "HEALTH", text: "What are the common symptoms of vitamin D deficiency?", color: "text-red-500" },
  { icon: BarChart3, label: "BUSINESS", text: "Create a business plan outline for a SaaS startup in India", color: "text-emerald-500" },
  { icon: Languages, label: "TRANSLATE", text: "Translate this to Tamil: Good morning, how are you?", color: "text-purple-500" },
  { icon: Scale, label: "LEGAL", text: "What are the key compliance requirements for a startup in India?", color: "text-amber-500" },
  { icon: GraduationCap, label: "UPSC / IAS", text: "Create a 6-month UPSC preparation strategy with subject-wise plan", color: "text-indigo-500" },
  { icon: Calculator, label: "FINANCE", text: "Calculate income tax for salary of ₹12 LPA under old and new regime", color: "text-teal-500" },
  { icon: Users, label: "LINKEDIN", text: "Optimize my LinkedIn profile for a Software Engineer role", color: "text-blue-600" },
  { icon: Globe, label: "WORLD KNOWLEDGE", text: "Explain the history of the Roman Empire in simple terms", color: "text-violet-500" },
  { icon: Rocket, label: "SPACE & SCIENCE", text: "How does SpaceX's Starship rocket work? Explain the engineering", color: "text-rose-500" },
  { icon: BookOpen, label: "EDUCATION", text: "Explain quantum physics in simple terms with real-world examples", color: "text-sky-500" },
  { icon: ShieldCheck, label: "CYBERSECURITY", text: "What are the top 10 cybersecurity best practices for a startup?", color: "text-red-600" },
  { icon: TrendingUp, label: "INVESTMENT", text: "Compare SIP vs lump sum investment for mutual funds in India", color: "text-green-600" },
  { icon: Landmark, label: "GOVERNMENT", text: "List all government schemes available for small businesses in India", color: "text-amber-600" },
  { icon: Sparkles, label: "EXCEL FORMULAS", text: "Write an Excel VLOOKUP formula to match employee IDs with salaries", color: "text-emerald-600" },
  { icon: Lightbulb, label: "STARTUP IDEAS", text: "Give me 10 AI-powered startup ideas for India in 2026", color: "text-yellow-500" },
  { icon: PenLine, label: "CONTENT", text: "Write a viral LinkedIn post about AI transforming HR in India", color: "text-cyan-500" },
];

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createMutation = useCreateOpenaiConversation();
  const { setPendingMessage } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { data: siteConfig } = useSiteConfig();

  const displayName = isAuthenticated && user?.firstName
    ? user.firstName
    : isAuthenticated && user?.email
      ? user.email.split("@")[0]
      : null;

  const handleSendMessage = async (message: string, _image?: File) => {
    if ((!message.trim() && !_image) || isCreating) return;
    setIsCreating(true);
    try {
      const title = message.length > 40 ? message.substring(0, 40) + "..." : message;
      const conv = await createMutation.mutateAsync({ data: { title } });
      queryClient.invalidateQueries({ queryKey: ["/api/openai/conversations"] });
      setPendingMessage(message);
      setLocation(`/c/${conv.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center px-4 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto gap-6 pt-16 pb-48">

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <img
            src={sansaLogo}
            alt="SaNsa"
            className="h-16 md:h-20 w-auto object-contain rounded-xl shadow-xl"
          />
        </motion.div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center space-y-3"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {displayName
              ? `Good to see you, ${displayName}`
              : "How can I help you today?"}
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {siteConfig?.welcomeMessage || "Your all-in-one AI assistant — 32 domains of expertise from HR & payroll to law, medicine, coding, finance, education, space science, and beyond."}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 w-full mt-4"
        >
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              onClick={() => handleSendMessage(s.text)}
              disabled={isCreating}
              className="group text-left p-4 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-border/80 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl bg-secondary ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="text-sm text-foreground/80 leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                    {s.text}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

      </div>

      <div
        className="w-full max-w-2xl pt-4 sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <ChatInput onSend={handleSendMessage} disabled={isCreating} />
      </div>
    </div>
  );
}
