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
import { CATEGORIES, CITIES, PLATFORMS } from "@/lib/catalog";

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
    <div className="mb-2 flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/40 hover:border-primary/60"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <Icon className="size-7 text-muted-foreground" />
        )}
        <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[image:var(--gradient-mint)] text-primary-foreground">
          <Camera className="size-3.5" />
        </span>
      </button>
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
      <p className="text-xs text-muted-foreground">Click the circle to upload a photo</p>
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

  useEffect(() => {
    brandsApi
      .me()
      .then((data) => {
        setForm({
          companyName: data.companyName || "",
          contactName: data.contactName || "",
          website: data.website || "",
          industry: data.industry || "",
          city: data.city || "",
          about: data.about || "",
          logoUrl: data.logoUrl || null,
        });
      })
      .catch(() => {
        setForm({
          companyName: "",
          contactName: user.fullName || "",
          website: "",
          industry: "",
          city: user.city || "",
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
      await brandsApi.updateMe(form);
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
    <div className="surface-panel p-6 sm:p-8">
      <form onSubmit={handleSave} className="space-y-5">
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
          <Select value={form.industry} onValueChange={(v) => setForm((p) => ({ ...p, industry: v }))}>
            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="City">
          <Select value={form.city} onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}>
            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
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
    <div className="surface-panel flex flex-col items-center gap-2 p-10 text-center">
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
  const [cats, setCats] = useState([]);

  useEffect(() => {
    influencersApi
      .me()
      .then((data) => {
        setForm({
          name: data.name || "",
          handle: data.handle || "",
          platform: data.platform || "instagram",
          bio: data.bio || "",
          city: data.city || "",
          gender: data.gender || "",
          followers: data.followers ?? "",
          startingPrice: data.startingPrice ?? "",
          isPublished: data.isPublished ?? false,
          avatarUrl: data.avatarUrl || null,
        });
        setCats(data.categories || []);
      })
      .catch(() => {
        setForm({
          name: user.fullName || "",
          handle: "",
          platform: "instagram",
          bio: "",
          city: user.city || "",
          gender: "",
          followers: "",
          startingPrice: "",
          isPublished: false,
          avatarUrl: null,
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  function toggleCat(cat) {
    setCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat].slice(0, 5)
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await influencersApi.updateMe({
        ...form,
        followers: form.followers ? Number(form.followers) : 0,
        startingPrice: form.startingPrice ? Number(form.startingPrice) : null,
        categories: cats,
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
        <Select value={form.platform} onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>{p === "youtube" ? "YouTube" : p === "tiktok" ? "TikTok" : "Instagram"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Bio">
        <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Describe yourself…" rows={3} />
      </Field>
      <Field label="City">
        <Select value={form.city} onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}>
          <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
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
      <Field label="Categories">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = cats.includes(cat);
            return (
              <button
                type="button"
                key={cat}
                onClick={() => toggleCat(cat)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? "border-transparent bg-[image:var(--gradient-mint)] text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PROFILE_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              section === s.key
                ? "border-transparent bg-[image:var(--gradient-mint)] text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <s.icon className="size-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <div>
        {section === "basic" ? (
          <div className="surface-panel p-6 sm:p-8">
            <h3 className="mb-6 font-display text-lg font-bold">Basic Profile</h3>
            <BasicProfileForm user={user} />
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
      <h2 className="font-display text-2xl font-bold">My Profile</h2>
      {accountType === "brand" ? (
        <BrandProfile user={user} />
      ) : (
        <InfluencerProfile user={user} />
      )}
    </div>
  );
}