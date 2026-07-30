import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";
import Home from "@/pages/Home";
import Influencers from "@/pages/Influencers";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import DashCampaigns from "@/pages/DashCampaigns";
import DashOffers from "@/pages/DashOffers";
import DashComingSoon from "@/pages/DashComingSoon";
import DashProfile from "@/pages/DashProfile";
import Contact from "@/pages/Contact";
import ForBrands from "@/pages/ForBrands";
import SignupBrand from "@/pages/SignupBrand";
import SignupInfluencer from "@/pages/SignupInfluencer";

function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Dashboard routes — own layout with tabs */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="campaigns" element={<DashCampaigns />} />
          <Route path="offers" element={<DashOffers />} />
          <Route path="interests" element={<DashComingSoon title="Profile Interests" />} />
          <Route path="unlocks" element={<DashComingSoon title="URL Unlocks" />} />
          <Route path="earnings" element={<DashComingSoon title="My Earnings" />} />
          <Route path="purchases" element={<DashComingSoon title="My Purchase" />} />
          <Route path="others" element={<DashComingSoon title="Others" />} />
          <Route path="profile" element={<DashProfile />} />
        </Route>

        {/* Public site routes */}
        <Route
          path="/"
          element={
            <SiteLayout>
              <Home />
            </SiteLayout>
          }
        />
        <Route
          path="/influencers"
          element={
            <SiteLayout>
              <Influencers />
            </SiteLayout>
          }
        />
        <Route
          path="/auth"
          element={
            <SiteLayout>
              <Auth />
            </SiteLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <SiteLayout>
              <Contact />
            </SiteLayout>
          }
        />
        <Route
          path="/for-brands"
          element={
            <SiteLayout>
              <ForBrands />
            </SiteLayout>
          }
        />
        <Route
          path="/signup/brand"
          element={
            <SiteLayout>
              <SignupBrand />
            </SiteLayout>
          }
        />
        <Route
          path="/signup/influencer"
          element={
            <SiteLayout>
              <SignupInfluencer />
            </SiteLayout>
          }
        />
        <Route
          path="*"
          element={
            <SiteLayout>
              <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404</p>
                <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Page not found</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  The page you're looking for doesn't exist or may have moved.
                </p>
                <Link
                  to="/"
                  className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-[image:var(--gradient-mint)] px-5 text-sm font-semibold text-primary-foreground"
                >
                  Back to home
                </Link>
              </main>
            </SiteLayout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen">
          <ScrollProgressBar />
          <Toaster position="top-center" richColors />
          <AnimatedRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
