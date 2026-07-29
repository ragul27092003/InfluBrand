import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  Plus,
  LogOut,
  Menu,
  X,
  Headphones,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/lib/AuthContext";

const BRAND_NAV = [
  { to: "/dashboard", end: true, label: "Dashboard" },
  { to: "/influencers", label: "Influencers", hasMenu: true },
  { to: "/dashboard/campaigns", label: "My Campaigns" },
  { to: "/dashboard/profile", label: "My Profile" },
  { to: "/dashboard/purchases", label: "My Purchase", hasMenu: true },
  { to: "/dashboard/others", label: "Others", hasMenu: true },
];

const INFLUENCER_NAV = [
  { to: "/dashboard/campaigns", label: "Campaigns", hasMenu: true },
  { to: "/dashboard/offers", label: "Direct Offers" },
  { to: "/dashboard/interests", label: "Profile Interests" },
  { to: "/dashboard/unlocks", label: "URL Unlocks" },
  { to: "/dashboard/profile", label: "My Profile" },
  { to: "/dashboard/earnings", label: "My Earnings", hasMenu: true },
  { to: "/dashboard/others", label: "Others", hasMenu: true },
];

export function DashboardLayout() {
  const { user, accountType, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading your account…</p>
      </main>
    );
  }

  if (!user) return null;

  const isBrand = accountType === "brand";
  const navItems = isBrand ? BRAND_NAV : INFLUENCER_NAV;
  const displayName = user.fullName || user.email?.split("@")[0] || "there";
  const firstName = displayName.split(" ")[0];

  function handleLogout() {
    logout();
    navigate("/");
  }

  const stats = isBrand
    ? [{ value: "02", label: "Connect balance" }]
    : [
        { value: "0.0", label: "InfluGlue score" },
        { value: "$0", label: "Account balance" },
      ];

  return (
    <div className="dash-light flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground">
      {/* Identity row */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-5">
            <a href="#" className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary sm:flex">
              <Headphones className="size-4" />
              Support
            </a>
            <button className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[image:var(--gradient-mint)] text-xs font-bold text-primary-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
              {displayName}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            <button
              className="rounded-md border border-border p-1.5 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Signature stat ribbon — ink block, huge condensed numbers */}
      <div className="relative overflow-hidden bg-[var(--ink)]">
        <div
          className="absolute inset-y-0 right-0 w-1/3"
          style={{ background: "var(--gradient-mint)", opacity: 0.14, clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-6 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              {isBrand ? "Brand account" : "Creator account"}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
              Hi {firstName}
            </h1>
          </div>

          <div className="flex items-end gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="leading-none text-[var(--volt)]"
                  style={{ fontFamily: "var(--font-impact)", fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  {s.label}
                </p>
              </div>
            ))}
            {isBrand && (
              <Button variant="hero" size="sm" asChild className="mb-1.5">
                <Link to="/dashboard/campaigns">
                  <Plus className="size-4" />
                  New campaign
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Thin underline nav */}
      <div className="border-b border-border bg-card">
        <nav className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${mobileOpen ? "flex" : "hidden"} lg:flex flex-col lg:flex-row lg:items-center`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-1 border-b-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-[var(--volt)] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {item.label}
              {item.hasMenu && <ChevronDown className="size-3.5" />}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground lg:ml-auto"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}