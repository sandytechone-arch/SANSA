import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";

export default function AdminConfigPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSystemPrompt(data.systemPrompt || "");
        setWelcomeMessage(data.welcomeMessage || "");
        setPrimaryColor(data.primaryColor || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ systemPrompt, welcomeMessage, primaryColor }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading configuration...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Site Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Edit system prompt, welcome message, and theme settings. Changes apply immediately for all users.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            System Prompt Override
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Additional instructions appended to the default system prompt. Leave empty to use the default.
          </p>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-y"
            placeholder="Additional system prompt instructions..."
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Welcome Message
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Custom welcome message shown on the home page. Leave empty for the default.
          </p>
          <input
            type="text"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            placeholder="How can I help you today?"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Primary Color
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Custom primary color in HSL format (e.g., "250 100% 60%"). Leave empty for the default theme color.
          </p>
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            placeholder="250 100% 60%"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-green-500 font-medium">
              Configuration saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
