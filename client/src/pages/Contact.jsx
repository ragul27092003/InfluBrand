import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contact as contactApi } from "@/lib/api";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await contactApi.submit({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      });
      setSent(true);
      toast.success("Thanks! Our team will get back to you within one business day.");
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Let&rsquo;s talk</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tell us about your brand and we&rsquo;ll send a curated shortlist of creators for your
            category and budget.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Mail className="size-4 text-primary" /> hello@influbrand.in
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-4 text-primary" /> +91 98300 00000
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 text-primary" /> Kolkata, India
            </li>
          </ul>
        </div>

        <form className="surface-panel space-y-4 p-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={100} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cemail">Email</Label>
            <Input id="cemail" name="email" type="email" required maxLength={255} placeholder="you@brand.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg">How can we help?</Label>
            <Textarea id="msg" name="message" required maxLength={1000} rows={5} placeholder="Tell us about your campaign" />
          </div>
          <Button variant="hero" className="w-full" type="submit" disabled={busy || sent}>
            {sent ? "Message sent" : busy ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </main>
  );
}
