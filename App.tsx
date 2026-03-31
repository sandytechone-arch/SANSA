import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/admin-layout";
import WelcomePage from "@/pages/welcome";
import ConversationPage from "@/pages/conversation";
import SettingsPage from "@/pages/settings";
import DocumentsPage from "@/pages/documents";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import AdminOverviewPage from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminConversationsPage from "@/pages/admin/conversations";
import AdminConfigPage from "@/pages/admin/config";
import { useAppStore } from "@/store/use-app-store";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ThemeManager() {
  const { theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.add('light');
    }
  }, [theme]);

  return null;
}

function SiteConfigApplier() {
  const { data: siteConfig } = useSiteConfig();

  useEffect(() => {
    if (siteConfig?.primaryColor) {
      document.documentElement.style.setProperty('--primary', siteConfig.primaryColor);
    } else {
      document.documentElement.style.removeProperty('--primary');
    }
  }, [siteConfig?.primaryColor]);

  return null;
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminOverviewPage} />
        <Route path="/admin/users" component={AdminUsersPage} />
        <Route path="/admin/conversations" component={AdminConversationsPage} />
        <Route path="/admin/config" component={AdminConfigPage} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/admin" component={AdminRoutes} />
      <Route path="/admin/:rest*" component={AdminRoutes} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={WelcomePage} />
            <Route path="/c/:id" component={ConversationPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/documents" component={DocumentsPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ThemeManager />
          <SiteConfigApplier />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
