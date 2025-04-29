import { Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DocumentsPage from "@/pages/documents-page";
import PersonnelPage from "@/pages/personnel-page";
import TerminalsPage from "@/pages/terminals-page";
import MessagesPage from "@/pages/messages-page";
import ProgressPage from "@/pages/progress-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboardPage from "@/pages/admin/dashboard-page";
import AdminUsersPage from "@/pages/admin/users-page";
import AdminDocumentsPage from "@/pages/admin/documents-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { Route } from "wouter";

function Router() {
  return (
    <Switch>
      {/* User Routes */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/documents" component={DocumentsPage} />
      <ProtectedRoute path="/personnel" component={PersonnelPage} />
      <ProtectedRoute path="/terminals" component={TerminalsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/progress" component={ProgressPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboardPage} />
      <ProtectedRoute path="/admin/users" component={AdminUsersPage} />
      <ProtectedRoute path="/admin/documents" component={AdminDocumentsPage} />
      
      {/* Auth and Not Found */}
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
