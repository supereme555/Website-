import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DailyGoals from "@/pages/daily-goals";
import Courses from "@/pages/courses";
import Goals from "@/pages/goals";
import Masterlist from "@/pages/masterlist";
import Analysis from "@/pages/analysis";
import EloStats from "@/pages/elo-stats";
import ProfileSetup from "@/pages/profile-setup";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUserId] = useState(1); // For demo purposes, using a fixed user ID

  // Check if user exists and profile is complete
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user/1"],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user doesn't exist or profile is not complete, show setup
  if (!user || !user.profileComplete) {
    return <ProfileSetup userId={currentUserId} />;
  }

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/daily-goals" component={DailyGoals} />
            <Route path="/courses" component={Courses} />
            <Route path="/goals" component={Goals} />
            <Route path="/masterlist" component={Masterlist} />
            <Route path="/analysis" component={Analysis} />
            <Route path="/elo-stats" component={EloStats} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
