import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function HomeWrapper() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const savedProfile = localStorage.getItem("health-user-profile");
    if (!savedProfile) {
      setLocation("/onboarding");
    }
  }, [setLocation]);

  return <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeWrapper} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;