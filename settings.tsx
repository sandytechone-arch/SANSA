import { Link } from "wouter";
import { Briefcase, Globe, Sun, Moon, Monitor, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Theme = 'light' | 'dark' | 'system';

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const { hrMode, setHrMode, language, setLanguage, theme, setTheme } = useAppStore();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-4">

          {/* HR Mode */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  hrMode ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">HR Mode</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Enable professional HR tools and responses</p>
                </div>
              </div>
              <button
                onClick={() => setHrMode(!hrMode)}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors relative shrink-0",
                  hrMode ? "bg-primary" : "bg-muted"
                )}
                aria-label={hrMode ? "Disable HR Mode" : "Enable HR Mode"}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-sm",
                  hrMode ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Language</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Tamil')}
                className="bg-secondary border border-border text-foreground text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          {/* Theme */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground mt-0.5">Choose your preferred color theme</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    theme === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
