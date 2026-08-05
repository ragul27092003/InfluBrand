import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfluencerCard } from "@/components/site/InfluencerCard";
import { influencers as influencersApi, shortlists } from "@/lib/api";
import { formatCount, formatRupees, derivedRating } from "@/lib/catalog";
import { useCatalog } from "@/hooks/useCatalog";
import { useStates } from "@/hooks/useDistricts";
import { useAuth } from "@/lib/AuthContext";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const MAX_FOLLOWERS = 1000000;
const MAX_PRICE = 100000;

function FilterGroup({ title, options, active, onSelect }) {
  return (
    <div className="surface-panel surface-panel-hover p-5">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {options.map((option) => (
          <li key={option.value}>
            <button
              onClick={() => onSelect(option.value)}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                active === option.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RangeSlider({ title, value, max, onChange, format }) {
  return (
    <div className="surface-panel surface-panel-hover p-5">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <input
        type="range"
        min={0}
        max={max}
        step={max / 100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <p className="mt-2 text-sm text-muted-foreground">
        Up to <span className="text-foreground">{format(value)}</span>
      </p>
    </div>
  );
}

function PlatformFilter({ platforms, selected, onToggle }) {
  return (
    <div className="surface-panel surface-panel-hover p-5">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Platform
      </h3>
      <div className="space-y-2">
        {platforms.map((p) => {
          const id = p._id || p.id;
          return (
            <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={() => onToggle(id)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              {p.name}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function Influencers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, accountType } = useAuth();
  const { platforms, niches } = useCatalog();
  const { states } = useStates();
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [busyId, setBusyId] = useState(null);
  const [platformIds, setPlatformIds] = useState([]);
  const [maxFollowers, setMaxFollowers] = useState(MAX_FOLLOWERS);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // "niche" and "state" hold ids/codes in the URL; "All" means no filter.
  const nicheFilter = searchParams.get("niche") || "All";
  const stateFilter = searchParams.get("state") || "All";
  const query = searchParams.get("q") || "";

  useEffect(() => {
    influencersApi
      .list()
      .then((data) => setInfluencers(data))
      .catch(() => setInfluencers([]))
      .finally(() => setLoading(false));
  }, []);

  function togglePlatform(id) {
    setPlatformIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const results = useMemo(() => {
    const filtered = influencers.filter((inf) => {
      const infNicheIds = (inf.niches || []).map((n) => n._id || n);
      const matchNiche = nicheFilter === "All" || infNicheIds.includes(nicheFilter);
      const matchState = stateFilter === "All" || inf.state === stateFilter;
      const matchQuery =
        !query ||
        inf.name.toLowerCase().includes(query.toLowerCase()) ||
        (inf.handle ?? "").toLowerCase().includes(query.toLowerCase());
      const infPlatformId = inf.platform?._id || inf.platform;
      const matchPlatform = platformIds.length === 0 || platformIds.includes(infPlatformId);
      const matchFollowers = (inf.followers || 0) <= maxFollowers;
      const matchPrice = !inf.starting_price || inf.starting_price <= maxPrice;
      return matchNiche && matchState && matchQuery && matchPlatform && matchFollowers && matchPrice;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "engagement") return b.engagement - a.engagement;
      if (sort === "rating") return derivedRating(b) - derivedRating(a);
      if (sort === "newest") return a.name.localeCompare(b.name);
      return b.followers - a.followers;
    });
  }, [influencers, nicheFilter, stateFilter, query, sort, platformIds, maxFollowers, maxPrice]);

  function setFilter(patch) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace: true });
  }

  async function addToList(influencer, kind) {
    if (!user) {
      toast.error("Please sign in as a brand to shortlist creators.");
      return;
    }
    if (accountType !== "brand") {
      toast.error("Only brand accounts can shortlist or send offers.");
      return;
    }
    setBusyId(influencer.id || influencer._id);
    try {
      await shortlists.create({ influencerId: influencer.id || influencer._id, kind });
      toast.success(
        kind === "offer"
          ? `Offer sent to ${influencer.name}.`
          : `${influencer.name} added to your shortlist.`
      );
    } catch (err) {
      toast.error(
        err.status === 409
          ? `${influencer.name} is already on your list.`
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  }

  const nicheOptions = [{ value: "All", label: "All" }, ...niches.map((n) => ({ value: n._id || n.id, label: n.name }))];
  const stateOptions = [{ value: "All", label: "All" }, ...states.map((s) => ({ value: s.code, label: s.name }))];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="hero-glow absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-black"
            style={{ background: "var(--gradient-gold)" }}
          >
            Creator directory
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
          >
            Find <span className="text-gradient">influencers</span> for every
            niche
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 max-w-2xl text-sm text-muted-foreground"
          >
            A handpicked directory of Indian creators — filter by niche, state and engagement to
            find the right voice for your campaign.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex max-w-xl items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setFilter({ q: e.target.value || undefined })}
                placeholder="Search by name or handle"
                className="pl-9"
              />
            </div>
            <Button variant="hero" asChild>
              <Link to="/signup/brand">Start a campaign</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[260px_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <FilterGroup
            title="Filter by niche"
            options={nicheOptions}
            active={nicheFilter}
            onSelect={(value) => setFilter({ niche: value === "All" ? undefined : value })}
          />
          <FilterGroup
            title="Filter by state"
            options={stateOptions}
            active={stateFilter}
            onSelect={(value) => setFilter({ state: value === "All" ? undefined : value })}
          />
          <PlatformFilter platforms={platforms} selected={platformIds} onToggle={togglePlatform} />
          <RangeSlider
            title="Follower range"
            value={maxFollowers}
            max={MAX_FOLLOWERS}
            onChange={setMaxFollowers}
            format={formatCount}
          />
          {/* <RangeSlider
            title="Price range"
            value={maxPrice}
            max={MAX_PRICE}
            onChange={setMaxPrice}
            format={formatRupees}
          /> */}
          <div className="surface-panel p-6">
            <h3 className="font-display text-lg font-semibold">Are you a creator?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              List your profile and get discovered by brands.
            </p>
            <Button variant="hero" className="mt-4 w-full" asChild>
              <Link to="/signup/influencer">Sign up as an influencer</Link>
            </Button>
          </div>
        </motion.aside>

        <main>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : (
                <>Total <span className="text-foreground">{results.length} results</span> found</>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              {["popular", "engagement", "rating", "newest"].map((key) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                    sort === key
                      ? "border-transparent bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {!loading && results.length === 0 ? (
            <div className="surface-panel p-12 text-center">
              <p className="font-display text-lg">No creators match those filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the niche, state or range filters.
              </p>
            </div>
          ) : (
            <RevealGroup className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" stagger={0.06} amount={0.05}>
              {results.map((influencer) => (
                <RevealItem key={influencer.id || influencer._id} scale>
                  <InfluencerCard
                    influencer={influencer}
                    busy={busyId === (influencer.id || influencer._id)}
                    onShortlist={(inf) => addToList(inf, "shortlist")}
                    onOffer={(inf) => addToList(inf, "offer")}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </main>
      </div>
    </>
  );
}
