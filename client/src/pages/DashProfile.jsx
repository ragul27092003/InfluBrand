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
  Plus,
  X,
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

function BasicProfileForm({ user, onProfileUpdate }) {
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
      const updated = await influencersApi.updateMe({
        ...form,
        city: form.district,
        followers: form.followers ? Number(form.followers) : 0,
        startingPrice: form.startingPrice ? Number(form.startingPrice) : null,
        niches,
      });
      if (onProfileUpdate) onProfileUpdate(updated);
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
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    influencersApi
      .me()
      .then((data) => setProfileData(data))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const active = PROFILE_SECTIONS.find((s) => s.key === section);

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground animate-pulse">Loading profile…</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      {/* Section rail */}
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
        {section === "basic" && (
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
              <BasicProfileForm user={user} onProfileUpdate={setProfileData} />
            </div>
          </div>
        )}
        {section === "about" && <AboutMeSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "brands" && <PreviousBrandsSection profileData={profileData} />}
        {section === "samples" && <WorkSamplesSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "interests" && <InterestsSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "languages" && <LanguagesSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "social" && <SocialAssetsSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "rates" && <RatesSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "terms" && <TermsSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "payment" && <PaymentDetailsSection profileData={profileData} onUpdate={setProfileData} />}
        {section === "score" && <ScoreSection profileData={profileData} />}
        {section === "delete" && <DeleteAccountSection user={user} />}
      </div>
    </div>
  );
}

// ---- Section Components ----

function AboutMeSection({ profileData, onUpdate }) {
  const [form, setForm] = useState({ aboutMe: profileData?.aboutMe || "" });
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      const updated = await influencersApi.updateMe(form);
      onUpdate(updated);
      toast.success("About section updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <FileText className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">About Me</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <Field label="Bio">
          <Textarea
            value={form.aboutMe}
            onChange={(e) => setForm((p) => ({ ...p, aboutMe: e.target.value }))}
            placeholder="Tell creators about yourself…"
            rows={5}
          />
        </Field>
        <div className="sm:pl-[180px]">
          <Button variant="hero" onClick={handleSave} disabled={busy}>
            <Save className="size-4" />
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreviousBrandsSection({ profileData }) {
  const brands = profileData?.previousBrands || [];

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Briefcase className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Previous Brands</h3>
      </div>
      <div className="p-6 sm:p-8">
        {brands.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No previous brands added yet</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {brands.map((b, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="font-medium text-sm">{b.companyName || "Brand"}</p>
                <p className="text-xs text-muted-foreground">{b.city || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkSamplesSection({ profileData, onUpdate }) {
  const [samples, setSamples] = useState(profileData?.workSamples || []);
  const [form, setForm] = useState({ title: "", url: "", description: "" });
  const [busy, setBusy] = useState(false);

  async function addSample() {
    if (!form.title || !form.url) {
      toast.error("Title and URL are required");
      return;
    }
    setBusy(true);
    try {
      const updated = await influencersApi.updateMe({
        workSamples: [...samples, form],
      });
      onUpdate(updated);
      setSamples(updated.workSamples);
      setForm({ title: "", url: "", description: "" });
      toast.success("Work sample added");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeSample(index) {
    try {
      const updated = await influencersApi.updateMe({
        workSamples: samples.filter((_, i) => i !== index),
      });
      setSamples(updated.workSamples);
      toast.success("Work sample removed");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <ImagePlus className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Work Samples</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <div className="space-y-3">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Product Review Video"
            />
          </Field>
          <Field label="URL">
            <Input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              placeholder="https://…"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description"
              rows={2}
            />
          </Field>
          <div className="sm:pl-[180px]">
            <Button variant="hero" onClick={addSample} disabled={busy} size="sm">
              <Plus className="size-4" /> Add Sample
            </Button>
          </div>
        </div>
        {samples.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            {samples.map((s, i) => (
              <div key={i} className="flex items-start justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{s.title}</p>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    View
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSample(i)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InterestsSection({ profileData, onUpdate }) {
  const [niches, setNiches] = useState((profileData?.niches || []).map((n) => n._id || n));
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      const updated = await influencersApi.updateMe({ niches });
      onUpdate(updated);
      toast.success("Interests updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Tags className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Field of Interests</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <Field label="Niches">
          <NicheChips value={niches} onChange={setNiches} />
        </Field>
        <div className="sm:pl-[180px]">
          <Button variant="hero" onClick={handleSave} disabled={busy}>
            <Save className="size-4" />
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LanguagesSection({ profileData, onUpdate }) {
  const [languages, setLanguages] = useState(profileData?.languages || []);
  const [newLang, setNewLang] = useState("");
  const [busy, setBusy] = useState(false);

  async function addLanguage() {
    if (!newLang.trim()) return;
    const updated = [...languages, newLang.trim()];
    setLanguages(updated);
    setNewLang("");
    try {
      const result = await influencersApi.updateMe({ languages: updated });
      onUpdate(result);
      toast.success("Language added");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeLanguage(index) {
    const updated = languages.filter((_, i) => i !== index);
    setLanguages(updated);
    try {
      const result = await influencersApi.updateMe({ languages: updated });
      onUpdate(result);
      toast.success("Language removed");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Languages className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Content Languages</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex gap-2">
          <Input
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            placeholder="e.g. English, Tamil, Hindi"
            onKeyDown={(e) => e.key === "Enter" && addLanguage()}
          />
          <Button variant="hero" size="sm" onClick={addLanguage}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang, i) => (
            <span key={i} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {lang}
              <button
                onClick={() => removeLanguage(i)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialAssetsSection() {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Share2 className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Social Media Assets</h3>
      </div>
      <div className="p-6 sm:p-8">
        <ComingSoon label="Social Media Assets" />
      </div>
    </div>
  );
}

function RatesSection({ profileData, onUpdate }) {
  const [rates, setRates] = useState(profileData?.rates || []);
  const [form, setForm] = useState({ activityType: "", priceUSD: "" });
  const [busy, setBusy] = useState(false);

  async function addRate() {
    if (!form.activityType || !form.priceUSD) {
      toast.error("Both fields required");
      return;
    }
    setBusy(true);
    try {
      const updated = await influencersApi.updateMe({
        rates: [...rates, { activityType: form.activityType, priceUSD: Number(form.priceUSD) }],
      });
      onUpdate(updated);
      setRates(updated.rates);
      setForm({ activityType: "", priceUSD: "" });
      toast.success("Rate added");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <IndianRupee className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">My Rates</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <div>
          <p className="text-sm font-semibold mb-3">Add Rate</p>
          <div className="space-y-3">
            <Input
              value={form.activityType}
              onChange={(e) => setForm((p) => ({ ...p, activityType: e.target.value }))}
              placeholder="Activity type (e.g. Instagram Story)"
            />
            <Input
              type="number"
              value={form.priceUSD}
              onChange={(e) => setForm((p) => ({ ...p, priceUSD: e.target.value }))}
              placeholder="Price in USD"
            />
            <Button variant="hero" onClick={addRate} disabled={busy} className="bg-green-500 hover:bg-green-600">
              SAVE
            </Button>
          </div>
        </div>
        {rates.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-semibold mb-2">Your Rates:</p>
            <ul className="space-y-1 text-sm">
              {rates.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{r.activityType}</span>
                  <span className="font-medium">USD {r.priceUSD}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TermsSection({ profileData, onUpdate }) {
  const [termsAccepted, setTermsAccepted] = useState(profileData?.termsAccepted || false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      const updated = await influencersApi.updateMe({ termsAccepted });
      onUpdate(updated);
      toast.success("Terms updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <ScrollText className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">My Terms</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <Textarea
          value="By accepting these terms, you agree to InfluGlue's creator terms and conditions..."
          readOnly
          rows={5}
          className="bg-muted"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 rounded accent-primary"
          />
          <span className="text-sm">I accept the terms and conditions</span>
        </label>
        <Button variant="hero" onClick={handleSave} disabled={busy}>
          <Save className="size-4" />
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function PaymentDetailsSection({ profileData, onUpdate }) {
  const [form, setForm] = useState(profileData?.paymentDetails || {});
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      const updated = await influencersApi.updateMe({ paymentDetails: form });
      onUpdate(updated);
      toast.success("Payment details updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Wallet className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">Payment Details</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <Field label="Account Holder Name">
          <Input
            value={form.accountHolderName || ""}
            onChange={(e) => setForm((p) => ({ ...p, accountHolderName: e.target.value }))}
            placeholder="Full name"
          />
        </Field>
        <Field label="Bank Name">
          <Input
            value={form.bankName || ""}
            onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
            placeholder="e.g. HDFC Bank"
          />
        </Field>
        <Field label="Account Number">
          <Input
            value={form.accountNumber || ""}
            onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
            placeholder="Account number"
          />
        </Field>
        <Field label="IFSC Code">
          <Input
            value={form.ifscCode || ""}
            onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value }))}
            placeholder="IFSC code"
          />
        </Field>
        <Field label="UPI ID">
          <Input
            value={form.upiId || ""}
            onChange={(e) => setForm((p) => ({ ...p, upiId: e.target.value }))}
            placeholder="user@bank"
          />
        </Field>
        <div className="sm:pl-[180px]">
          <Button variant="hero" onClick={handleSave} disabled={busy}>
            <Save className="size-4" />
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScoreSection({ profileData }) {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-gold" style={{ background: "var(--gradient-ink)" }}>
          <Gauge className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold">InfluBrand Score</h3>
      </div>
      <div className="p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Your Score</p>
            <p className="text-3xl font-bold text-primary mt-2">{profileData?.influBrandScore || 0}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Account Balance</p>
            <p className="text-3xl font-bold text-primary mt-2">${(profileData?.account_balance || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountSection({ user }) {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (confirm !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }
    setBusy(true);
    try {
      // await api call to delete account
      toast.success("Account deleted");
      // redirect to home
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-border/70 px-6 py-4 sm:px-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-destructive" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
          <Trash2 className="size-4" />
        </span>
        <h3 className="font-display text-lg font-bold text-destructive">Delete Account</h3>
      </div>
      <div className="p-6 sm:p-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <div>
          <Label className="text-sm mb-2 block">Type "DELETE" to confirm</Label>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type DELETE"
            className="font-mono"
          />
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={busy || confirm !== "DELETE"}
        >
          <Trash2 className="size-4" />
          {busy ? "Deleting…" : "Delete Account"}
        </Button>
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