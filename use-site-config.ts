import { useQuery } from "@tanstack/react-query";

interface SiteConfig {
  welcomeMessage: string;
  primaryColor: string;
}

export function useSiteConfig() {
  return useQuery<SiteConfig>({
    queryKey: ["/api/site-config"],
    queryFn: async () => {
      const res = await fetch("/api/site-config", { credentials: "include" });
      if (!res.ok) return { welcomeMessage: "", primaryColor: "" };
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
