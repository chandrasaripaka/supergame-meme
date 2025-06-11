import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import ChatHistoryPage from "@/pages/chat-history";
import PackingListPage from "@/pages/packing-list";
import DestinationInfoPage from "@/pages/destination-info";
import PreferencesPage from "@/pages/preferences";
import SavedTripsPage from "@/pages/saved-trips";
import TravelCompanionsPage from "@/pages/travel-companions";
import SafetyTestPage from "@/pages/safety-test";
import A2ADemoPage from "@/pages/a2a-demo";
import PriceComparisonPage from "@/pages/price-comparison";
import BookingPage from "@/pages/booking";
import ScrapbookPage from "@/pages/scrapbook";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";

function Router() {
  const [location] = useLocation();
  
  // Don't show header/footer on login page
  const isLoginPage = location === '/login';
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && <AppHeader />}
      
      <main className={`flex-1 w-full mx-auto ${!isLoginPage ? 'max-w-7xl px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={LoginPage} />
          <Route path="/chat-history" component={ChatHistoryPage} />
          <Route path="/packing-list" component={PackingListPage} />
          <Route path="/destination/:destination" component={DestinationInfoPage} />
          <Route path="/preferences" component={PreferencesPage} />
          <Route path="/saved-trips" component={SavedTripsPage} />
          <Route path="/travel-companions" component={TravelCompanionsPage} />
          <Route path="/safety-test" component={SafetyTestPage} />
          <Route path="/a2a-demo" component={A2ADemoPage} />
          <Route path="/price-comparison" component={PriceComparisonPage} />
          <Route path="/booking" component={BookingPage} />
          <Route path="/scrapbook" component={ScrapbookPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {!isLoginPage && <AppFooter />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
