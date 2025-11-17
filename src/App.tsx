import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Registration from "./pages/Registration";
import Home from "./pages/Home";
import CreateQuotation from "./pages/CreateQuotation";
import QuotationHistory from "./pages/QuotationHistory";
import Analytics from "./pages/Analytics";
import EditProfile from "./pages/EditProfile";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import { getCompanyProfile, refreshSession } from "./lib/storage";

const queryClient = new QueryClient();

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const profile = getCompanyProfile();
    if (!profile && location.pathname !== '/') {
      navigate('/');
    } else if (profile) {
      // Refresh session on any activity to extend 24-hour period
      refreshSession();
    }
  }, [location.pathname, navigate]);

  const showBottomNav = location.pathname !== '/' && getCompanyProfile();

  return (
    <>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-quotation" element={<CreateQuotation />} />
        <Route path="/history" element={<QuotationHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
