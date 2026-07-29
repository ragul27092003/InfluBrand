import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Building2, Camera, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepProgress } from "@/components/site/StepProgress";
import { auth } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { CITIES, CATEGORIES } from "@/lib/catalog";

const STEPS = ["Account", "Business"];

function Field({ label, required, children }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-primary"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SignupBrand() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    company_name: "",
    website: "",
    industry: CATEGORIES[0],
    city: CITIES[0],
  });

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep1() {
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Please fill in your name, email and password.");
      return false;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    return true;
  }

  function handleNext(e) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    setLogoPreview(dataUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.company_name) {
      toast.error("Please enter your company name.");
      return;
    }
    setBusy(true);
    try {
      await auth.signup({
        email: form.email,
        password: form.password,
        accountType: "brand",
        fullName: form.full_name,
        companyName: form.company_name,
        phone: form.phone,
        website: form.website,
        industry: form.industry,
        city: form.city,
        logoUrl: logoPreview,
      });
      await refreshUser();
      toast.success("Account created. Welcome to Influbrand!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0" />
      <div className="relative mx-auto w-full max-w-2xl px-4 py-16">
        <div className="surface-panel p-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-mint)] text-primary-foreground">
            <Building2 className="size-5" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Create a brand account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your business and start shortlisting creators today.
          </p>

          <div className="mt-8">
            <StepProgress steps={STEPS} current={step} />
          </div>

          {step === 1 && (
            <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleNext}>
              <Field label="Your name" required>
                <Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Riya Sharma" />
              </Field>
              <Field label="Work email" required>
                <Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Password" required>
                <Input required type="password" minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 6 characters" />
              </Field>

              <div className="sm:col-span-2">
                <Button variant="hero" size="lg" className="w-full" type="submit">
                  Continue <ArrowRight className="size-4" />
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link to="/auth" className="text-primary hover:underline">Log in</Link>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary/60"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="size-8 text-muted-foreground" />
                  )}
                  <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-mint)] text-primary-foreground">
                    <Camera className="size-4" />
                  </span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <p className="text-xs text-muted-foreground">Upload your company logo (optional)</p>
              </div>

              <Field label="Company name" required>
                <Input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Nova Skincare" />
              </Field>
              <Field label="Website">
                <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
              </Field>
              <Field label="Industry">
                <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City">
                <Select value={form.city} onValueChange={(v) => set("city", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex gap-3 sm:col-span-2">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="hero" size="lg" className="flex-1" type="submit" disabled={busy}>
                  {busy ? "Creating account…" : "Create brand account"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
