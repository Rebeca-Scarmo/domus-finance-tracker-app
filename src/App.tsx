
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { Layout } from "@/components/Layout/Layout";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import TransactionForm from "./pages/TransactionForm";
import Goals from "./pages/Goals";
import GoalForm from "./pages/GoalForm";
import BudgetForm from "./pages/BudgetForm";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/transactions" element={
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    } />
    <Route path="/transactions/new" element={
      <ProtectedRoute>
        <TransactionForm />
      </ProtectedRoute>
    } />
    <Route path="/transactions/:id" element={
      <ProtectedRoute>
        <TransactionForm />
      </ProtectedRoute>
    } />
    <Route path="/goals" element={
      <ProtectedRoute>
        <Goals />
      </ProtectedRoute>
    } />
    <Route path="/goals/new" element={
      <ProtectedRoute>
        <GoalForm />
      </ProtectedRoute>
    } />
    <Route path="/goals/:id" element={
      <ProtectedRoute>
        <GoalForm />
      </ProtectedRoute>
    } />
    <Route path="/budgets/new" element={
      <ProtectedRoute>
        <BudgetForm />
      </ProtectedRoute>
    } />
    <Route path="/budgets/:id" element={
      <ProtectedRoute>
        <BudgetForm />
      </ProtectedRoute>
    } />
    <Route path="/reports" element={
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
