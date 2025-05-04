import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PackingListPage from "@/pages/packing-list";
import DestinationInfoPage from "@/pages/destination-info";
import TripCompanionsPage from "@/pages/trip-companions";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/packing-list" component={PackingListPage} />
      <Route path="/destination/:destination" component={DestinationInfoPage} />
      <Route path="/trip-companions" component={TripCompanionsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Router />
        </main>
        <AppFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
