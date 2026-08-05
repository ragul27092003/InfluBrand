import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Save,
  Camera,
  Building2,
  Sparkles,
  UserRound,
  FileText,
  Briefcase,
  ImagePlus,
  Tags,
  Languages,
  Share2,
  IndianRupee,
  ScrollText,
  Wallet,
  Gauge,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brands as brandsApi, influencers as influencersApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useCatalog } from "@/hooks/useCatalog";
import { LocationSelect } from "@/components/site/LocationSelect";
import { PlatformSelect } from "@/components/site/PlatformSelect";
import { NicheChips } from "@/components/site/NicheChips";

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AvatarUpload({ preview, onChange, icon: Icon }) {
  const fileRef = useRef(null);
  return (
    <div className="mb-3 flex items-center gap-5 rounded-2xl border border-border bg-muted/20 p-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-card transition-colors hover:border-primary/60"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <Icon className="size-7 text-muted-foreground" />
        )}
        <span
          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-primary-foreground shadow-sm"
          style={{ background: "var(--gradient-ink)" }}
        >
          <Camera className="size-3.5 text-gold" />
        </span>
      </button>
      <div>
        <p className="text-sm font-semibold">Profile photo</p>
        <p className="text-xs text-muted-foreground">Click the circle to upload — square images work best.</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onChange(await readAsDataUrl(file));
        }}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function BrandProfile({ user }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { niches } = useCatalog();

  useEffect(() => {
    brandsApi
      .me()
      .then((data) => {
        setForm({
          companyName: data.companyName || "",
          contactName: data.contactName || "",
          website: data.website || "",
          nicheId: data.nicheId?._id || data.nicheId || "",
          state: data.state || "",
          district: data.district || "",
          about: data.about || "",
          logoUrl: data.logoUrl || null,
        });
      })
      .catch(() => {
        setForm({
          companyName: "",
          contactName: user.fullName || "",
          website: "",
          nicheId: "",
          state: "",
          district: "",
          about: "",
          logoUrl: null,
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await brandsApi.updateMe({ ...form, city: form.district });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !form) {
    return <p className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading profile…</p>;
  }

  return (
    <div className="surface-panel surface-panel-hover overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Building2 className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Brand Profile</h3>
      </div>
      <form onSubmit={handleSave} className="space-y-5 p-6 sm:p-8">
        <AvatarUpload
          preview={form.logoUrl}
          onChange={(dataUrl) => setForm((p) => ({ ...p, logoUrl: dataUrl }))}
          icon={Building2}
        />
        <Field label="Contact Name">
          <Input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} placeholder="Your full name" />
        </Field>
        <Field label="Company Name">
          <Input value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} placeholder="Business name" />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://example.com" />
        </Field>
        <Field label="Industry">
          <Select value={form.nicheId} onValueChange={(v) => setForm((p) => ({ ...p, nicheId: v }))}>
            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>
              {niches.map((n) => (
                <SelectItem key={n._id || n.id} value={n._id || n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <LocationSelect
          state={form.state}
          district={form.district}
          onStateChange={(v) => setForm((p) => ({ ...p, state: v }))}
          onDistrictChange={(v) => setForm((p) => ({ ...p, district: v }))}
        />
        <Field label="About">
          <Textarea value={form.about} onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))} placeholder="Tell creators about your brand…" rows={3} />
        </Field>
        <Field label="Email">
          <p className="text-sm">{user.email}</p>
        </Field>
        <Field label="Phone">
          <p className="text-sm">{user.phone || "—"}</p>
        </Field>
        <div className="pt-2 sm:pl-[180px]">
          <Button variant="hero" type="submit" disabled={busy}>
            <Save className="size-4" />
            {busy ? "Saving…" : "Update Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
// ⬆ closes BrandProfile's surface-panel wrapper

// ---- Influencer profile: multi-section layout ----
// Only "Basic Profile" is fully wired up right now. The rest are placeholders
// waiting on content/spec — send details for each and it'll get built out.
const PROFILE_SECTIONS = [
  { key: "basic", label: "Basic Profile", icon: UserRound },
  { key: "about", label: "About Me", icon: FileText },
  { key: "brands", label: "Previous Brands", icon: Briefcase },
  { key: "samples", label: "Work Samples", icon: ImagePlus },
  { key: "interests", label: "Field of Interests", icon: Tags },
  { key: "languages", label: "Content Languages", icon: Languages },
  { key: "social", label: "Social Media Assets", icon: Share2 },
  { key: "rates", label: "My Rates", icon: IndianRupee },
  { key: "terms", label: "My Terms", icon: ScrollText },
  { key: "payment", label: "Payment Details", icon: Wallet },
  { key: "score", label: "InfluGlue Score", icon: Gauge },
  { key: "delete", label: "Delete Account", icon: Trash2 },
];

function ComingSoon({ label }) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 p-12 text-center">
      <span className="h-px w-10" style={{ background: "var(--gradient-gold)" }} />
      <p className="font-display text-base font-semibold">{label}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This section hasn't been built out yet — send over what it should contain and it'll be
        added here.
      </p>
    </div>
  );
}

function BasicProfileForm({ user }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [niches, setNiches] = useState([]);

  useEffect(() => {
    influencersApi
      .me()
      .then((data) => {
        setForm({
          name: data.name || "",
          handle: data.handle || "",
          platformId: data.platformId?._id || data.platformId || "",
          bio: data.bio || "",
          state: data.state || "",
          district: data.district || "",
          gender: data.gender || "",
          followers: data.followers ?? "",
          startingPrice: data.startingPrice ?? "",
          isPublished: data.isPublished ?? false,
          avatarUrl: data.avatarUrl || null,
        });
        setNiches((data.niches || []).map((n) => n._id || n));
      })
      .catch(() => {
        setForm({
          name: user.fullName || "",
          handle: "",
          platformId: "",
          bio: "",
          state: "",
          district: "",
          gender: "",
          followers: "",
          startingPrice: "",
          isPublished: false,
          avatarUrl: null,
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await influencersApi.updateMe({
        ...form,
        city: form.district,
        followers: form.followers ? Number(form.followers) : 0,
        startingPrice: form.startingPrice ? Number(form.startingPrice) : null,
        niches,
      });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !form) {
    return <p className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading profile…</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <AvatarUpload
        preview={form.avatarUrl}
        onChange={(dataUrl) => setForm((p) => ({ ...p, avatarUrl: dataUrl }))}
        icon={Sparkles}
      />
      <Field label="Full Name">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
      </Field>
      <Field label="Handle">
        <Input value={form.handle} onChange={(e) => setForm((p) => ({ ...p, handle: e.target.value }))} placeholder="@yourhandle" />
      </Field>
      <Field label="Platform">
        <PlatformSelect value={form.platformId} onChange={(v) => setForm((p) => ({ ...p, platformId: v }))} />
      </Field>
      <Field label="Bio">
        <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Describe yourself…" rows={3} />
      </Field>
      <LocationSelect
        state={form.state}
        district={form.district}
        onStateChange={(v) => setForm((p) => ({ ...p, state: v }))}
        onDistrictChange={(v) => setForm((p) => ({ ...p, district: v }))}
      />
      <Field label="Gender">
        <div className="flex items-center gap-5">
          {["female", "male", "other"].map((g) => (
            <label key={g} className="inline-flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="gender"
                checked={form.gender === g}
                onChange={() => setForm((p) => ({ ...p, gender: g }))}
                className="h-4 w-4 accent-primary"
              />
              {g}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Followers">
        <Input type="number" value={form.followers} onChange={(e) => setForm((p) => ({ ...p, followers: e.target.value }))} placeholder="124000" />
      </Field>
      <Field label="Starting Price (₹)">
        <Input type="number" value={form.startingPrice} onChange={(e) => setForm((p) => ({ ...p, startingPrice: e.target.value }))} placeholder="25000" />
      </Field>
      <Field label="Niches">
        <NicheChips value={niches} onChange={setNiches} />
      </Field>
      <Field label="Published">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Show my profile in the public directory
        </label>
      </Field>
      <Field label="Email">
        <p className="text-sm">{user.email}</p>
      </Field>
      <Field label="Phone">
        <p className="text-sm">{user.phone || "—"}</p>
      </Field>
      <div className="pt-2 sm:pl-[180px]">
        <Button variant="hero" type="submit" disabled={busy}>
          <Save className="size-4" />
          {busy ? "Saving…" : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}

function InfluencerProfile({ user }) {
  const [section, setSection] = useState("basic");
  const active = PROFILE_SECTIONS.find((s) => s.key === section);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      {/* Section rail — quiet ink pills on desktop, scrollable chips on mobile */}
      <div className="surface-panel flex gap-1.5 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
        {PROFILE_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-all lg:w-full ${
              section === s.key
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <s.icon className="size-4 shrink-0" />
            {s.label}
          </button>
        ))}
      </div>

      <div>
        {section === "basic" ? (
          <div className="surface-panel overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gold"
                style={{ background: "var(--gradient-ink)" }}
              >
                <UserRound className="size-4" />
              </span>
              <h3 className="font-display text-lg font-bold">Basic Profile</h3>
            </div>
            <div className="p-6 sm:p-8">
              <BasicProfileForm user={user} />
            </div>
          </div>
        ) : (
          <ComingSoon label={active.label} />
        )}
      </div>
    </div>
  );
}

export default function DashProfile() {
  const { user, accountType } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-px w-6" style={{ background: "var(--gradient-gold)" }} />
          Account
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold">My Profile</h2>
      </div>
      {accountType === "brand" ? (
        <BrandProfile user={user} />
      ) : (
        <InfluencerProfile user={user} />
      )}
    </div>
  );
}