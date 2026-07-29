import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Handshake,
  Rocket,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfluencerCard } from "@/components/site/InfluencerCard";
import { influencers as influencersApi } from "@/lib/api";
import { CATEGORIES, CITIES } from "@/lib/catalog";
import heroImage from "@/assets/hero-creator.jpg";
import ctaBrand from "@/assets/cta-brand.jpg";
import ctaInfluencer from "@/assets/cta-influencer.jpg";

const STEPS = [
  { icon: Search, title: "Sign up", copy: "Create a brand account in under a minute." },
  { icon: Handshake, title: "Shortlist", copy: "Filter creators by niche, city and engagement." },
  { icon: BarChart3, title: "Monitor", copy: "Track responses and campaign progress live." },
  { icon: Wallet, title: "Get results", copy: "Approve content and pay only for delivery." },
];

const SERVICES = [
  { icon: Sparkles, title: "Influencer marketing", copy: "Full-funnel creator campaigns." },
  { icon: Rocket, title: "Brand promotion", copy: "Launches that reach the right feeds." },
  { icon: BadgeCheck, title: "Product reviews", copy: "Honest reviews from trusted voices." },
  { icon: BarChart3, title: "Performance reporting", copy: "Reach, engagement and CPE tracking." },
];

const FAQS = [
  {
    q: "How does Influbrand work?",
    a: "Create a brand account, browse our creator directory, shortlist the influencers that fit your niche, and send them a campaign offer. You approve deliverables before payment is released.",
  },
  {
    q: "How much does an influencer campaign cost?",
    a: "It depends on the creator tier and deliverables. Micro-influencers typically start around \u20B96,500 per collaboration, while established creators are listed with their own starting price.",
  },
  {
    q: "Can I choose the influencers myself?",
    a: "Yes. Every listing shows followers, average likes and engagement rate so you can shortlist independently, or ask our team for a curated list.",
  },
  {
    q: "How do I know the influencers are genuine?",
    a: "Creator statistics are pulled from their connected profiles and verified accounts carry a badge on their listing.",
  },
  {
    q: "When do I pay?",
    a: "Campaign budgets are confirmed when a creator accepts your offer, and released once the agreed content is live.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Influbrand cut our creator sourcing time in half. We shortlisted five great fits in a single afternoon.",
    name: "Ananya Rao",
    role: "Marketing Lead, Nova Skincare",
  },
  {
    quote:
      "The engagement data on every profile made it easy to trust who we were partnering with.",
    name: "Kabir Malhotra",
    role: "Founder, Urban Roots",
  },
  {
    quote:
      "We went from brief to live content in under two weeks — the dashboard kept everything organised.",
    name: "Sneha Iyer",
    role: "Brand Manager, Chai Point",
  },
];

const BRAND_STRIP = ["Nova Skincare", "Urban Roots", "Chai Point", "Bloom & Co", "Fitrite", "Wander India"];

function Metric({ value, label }) {
  return (
    <div>
      <dt className="font-display text-3xl font-bold text-primary">{value}</dt>
      <dd className="text-xs text-muted-foreground">{label}</dd>
    </div>
  );
}

function SectionHeading({ eyebrow, title, copy }) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        <span className="h-px w-6" style={{ background: "var(--gradient-gold)" }} />
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {copy && <p className="mt-3 text-sm text-muted-foreground">{copy}</p>}
    </div>
  );
}

function CtaCard({ image, alt, eyebrow, title, copy, to, cta }) {
  return (
    <div className="surface-panel surface-panel-hover relative overflow-hidden">
      <div className="relative">
        <img src={image} alt={alt} loading="lazy" width={1200} height={800} className="h-44 w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, oklch(0.16 0.02 250 / 0.55) 0%, transparent 60%)" }} />
        <span
          className="absolute bottom-3 left-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold"
          style={{ background: "var(--gradient-ink)" }}
        >
          {eyebrow}
        </span>
      </div>
      <div className="p-7">
        <h3 className="font-display text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
        <Button variant="hero" className="mt-5" asChild>
          <Link to={to}>{cta}</Link>
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    influencersApi
      .list()
      .then((data) => setInfluencers(data))
      .catch(() => setInfluencers([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = influencers.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="hero-glow absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold"
              style={{ background: "var(--gradient-ink)" }}
            >
              <Sparkles className="size-3.5" /> India&rsquo;s creator marketplace
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              DRIVE
              <br />
              INFLUENCE.
              <br />
              <span className="text-gradient">DRIVE RESULTS.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground">
              Influbrand helps brands and agencies partner with Indian creators across fashion,
              food, tech and more — with measurable engagement, not guesswork.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup/brand">
                  Start a campaign <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/influencers">Browse influencers</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              <Metric value="875+" label="Collaborations" />
              <Metric value="6.0K+" label="Creators" />
              <Metric value="18" label="Cities" />
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-[image:var(--gradient-mint)] opacity-20 blur-3xl" />
            <img
              src={heroImage}
              alt="Indian content creator filming a brand campaign video"
              width={1200}
              height={1408}
              className="relative w-full rounded-[2rem] border border-border object-cover shadow-[var(--shadow-glow)]"
            />
            <div
              className="absolute -bottom-5 -left-5 hidden rounded-2xl px-5 py-4 text-white shadow-[var(--shadow-premium)] sm:block"
              style={{ background: "var(--gradient-ink)" }}
            >
              <p className="font-display text-2xl font-bold text-gold">4.9<span className="text-sm">/5</span></p>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Avg. brand rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* As seen in / trusted by strip */}
      <section className="relative overflow-hidden border-b border-border/60" style={{ background: "var(--gradient-ink)" }}>
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/45">
            Trusted by brands across India
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {BRAND_STRIP.map((brand) => (
              <span
                key={brand}
                className="font-display text-lg font-bold text-white/40 transition-colors hover:text-gold"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
        <div className="h-px w-full" style={{ background: "var(--gradient-gold)", opacity: 0.6 }} />
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Launch a campaign in 4 steps"
          copy="From brief to published content, every stage lives in one dashboard."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="surface-panel surface-panel-hover p-6">
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-gold"
                style={{ background: "var(--gradient-ink)" }}
              >
                <step.icon className="size-5" />
              </div>
              <p className="font-display text-xs font-bold uppercase tracking-widest text-gold">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured creators */}
      <section className="border-y border-border/60 bg-[image:var(--gradient-deep)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Top creators"
            title="Micro-influencers in India"
            copy="A snapshot of creators currently accepting brand collaborations."
          />
          {loading ? (
            <p className="mt-10 text-sm text-muted-foreground">Loading creators…</p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((influencer) => (
                <InfluencerCard key={influencer.id || influencer._id} influencer={influencer} actionLabel="View" />
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/influencers">
                See all influencers <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Brands that grew with Influbrand"
          copy="A few words from marketing teams who launched campaigns on the platform."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="surface-panel surface-panel-hover p-6">
              <p className="text-sm text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-bold text-gold"
                  style={{ background: "var(--gradient-ink)" }}
                >
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Services"
          title="Bespoke influencer marketing"
          copy="Pick a single collaboration or a fully managed always-on programme."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <div key={service.title} className="surface-panel surface-panel-hover p-6">
              <service.icon className="size-6 text-gold" />
              <h3 className="mt-4 font-display text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories & cities */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6">
        <div className="surface-panel overflow-hidden">
          <div className="px-8 py-6" style={{ background: "var(--gradient-ink)" }}>
            <h2 className="font-display text-2xl font-bold text-white">Business segments and categories</h2>
          </div>
          <div className="p-8">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/influencers?category=${encodeURIComponent(cat)}`}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-transparent hover:bg-foreground hover:text-background"
                >
                  {cat}
                </Link>
              ))}
            </div>
            <h3 className="mt-10 font-display text-xl font-semibold">Creators by city</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <Link
                  key={city}
                  to={`/influencers?city=${encodeURIComponent(city)}`}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-transparent hover:bg-foreground hover:text-background"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-16 sm:px-6 md:grid-cols-2">
        <CtaCard
          image={ctaInfluencer}
          alt="Travel creator filming content in India"
          eyebrow="For creators"
          title="Turn your audience into income"
          copy="Join Influbrand to receive paid collaborations from brands in your niche."
          to="/signup/influencer"
          cta="Sign up as an influencer"
        />
        <CtaCard
          image={ctaBrand}
          alt="Beauty products styled for a brand campaign"
          eyebrow="For brands"
          title="Your next campaign starts here"
          copy="Shortlist creators, send offers and track deliverables in one place."
          to="/signup/brand"
          cta="Start a campaign"
        />
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <Accordion type="single" collapsible className="mt-8">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q} className="surface-panel mb-3 px-5">
              <AccordionTrigger className="text-left font-display text-base">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
