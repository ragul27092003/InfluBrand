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
      {/* Identity row — clean, quiet, JPMorgan-style restraint */}
      <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Headphones className="size-4" />
              Support
            </a>
            <button className="group flex items-center gap-2.5 rounded-full border border-transparent py-1 pr-1 pl-1.5 text-sm font-medium transition-colors hover:border-border">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--gradient-ink)" }}
              >
                <span className="text-gold">{displayName.slice(0, 1).toUpperCase()}</span>
              </span>
              <span className="hidden sm:inline">{displayName}</span>
              <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
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

      {/* Signature stat ribbon — deep ink block, oversized condensed numerals (Nike),
          a single hairline gold rule underneath for quiet authority (JPMorgan). */}
      <div className="relative overflow-hidden" style={{ background: "var(--gradient-ink)" }}>
        <div
          className="absolute inset-y-0 right-0 w-1/3"
          style={{ background: "var(--gradient-mint)", opacity: 0.1, clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-7 sm:px-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">
              <span className="h-px w-6" style={{ background: "var(--gradient-gold)" }} />
              {isBrand ? "Brand account" : "Creator account"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Hi, {firstName}.
            </h1>
          </div>

          <div className="flex items-end gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="leading-none text-[var(--volt)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)", fontWeight: 700, letterSpacing: "-0.03em" }}
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
        <div className="h-px w-full" style={{ background: "var(--gradient-gold)", opacity: 0.7 }} />
      </div>

      {/* Nav — bold uppercase pills instead of a thin underline row */}
      <div className="border-b border-border bg-card">
        <nav
          className={`mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 ${
            mobileOpen ? "flex" : "hidden"
          } lg:flex flex-col lg:flex-row lg:items-center`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`
              }
            >
              {item.label}
              {item.hasMenu && <ChevronDown className="size-3.5" />}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:ml-auto"
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
