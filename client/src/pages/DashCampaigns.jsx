import { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calendar, MapPin } from "lucide-react";
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
import { campaigns as campaignsApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { CATEGORIES, CITIES, PLATFORMS } from "@/lib/catalog";

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}

export default function DashCampaigns() {
  const { accountType } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    brief: "",
    category: "",
    city: "",
    platform: "instagram",
    budget: "",
    status: "draft",
  });

  function resetForm() {
    setForm({ title: "", brief: "", category: "", city: "", platform: "instagram", budget: "", status: "draft" });
    setEditId(null);
    setShowForm(false);
  }

  useEffect(() => {
    if (accountType !== "brand") {
      setLoading(false);
      return;
    }
    campaignsApi
      .list()
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [accountType]);

  function startEdit(c) {
    setForm({
      title: c.title || "",
      brief: c.brief || "",
      category: c.category || "",
      city: c.city || "",
      platform: c.platform || "instagram",
      budget: c.budget ?? "",
      status: c.status || "draft",
    });
    setEditId(c._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Campaign title is required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        budget: form.budget ? Number(form.budget) : null,
      };
      if (editId) {
        const updated = await campaignsApi.update(editId, payload);
        setCampaigns((prev) => prev.map((c) => (c._id === editId ? updated : c)));
        toast.success("Campaign updated.");
      } else {
        const created = await campaignsApi.create(payload);
        setCampaigns((prev) => [created, ...prev]);
        toast.success("Campaign created!");
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    try {
      await campaignsApi.remove(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      toast.success("Campaign deleted.");
    } catch (err) {
      toast.error(err.message || "Failed to delete campaign.");
    }
  }

  if (accountType !== "brand") {
    return (
      <div className="surface-panel p-12 text-center">
        <p className="font-display text-lg">Campaigns are for brand accounts</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Switch to a brand account or <Link to="/influencers" className="text-primary hover:underline">browse the influencer directory</Link>.
        </p>
      </div>
    );
  }

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-primary/15 text-primary",
    paused: "bg-yellow-500/15 text-yellow-400",
    completed: "bg-green-500/15 text-green-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">My Campaigns</h2>
        {!showForm && (
          <Button variant="hero" size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="size-4" />
            Create new campaign
          </Button>
        )}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="surface-panel space-y-4 p-6">
          <h3 className="font-display text-lg font-semibold">
            {editId ? "Edit campaign" : "New campaign"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Campaign title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Summer collection launch"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Brief</Label>
              <Textarea
                value={form.brief}
                onChange={(e) => setForm((p) => ({ ...p, brief: e.target.value }))}
                placeholder="Describe the campaign deliverables…"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select value={form.city} onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p === "youtube" ? "YouTube" : "Instagram"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget (₹)</Label>
              <Input
                type="number"
                value={form.budget}
                onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="hero" type="submit" disabled={busy}>
              {busy ? "Saving…" : editId ? "Update campaign" : "Create campaign"}
            </Button>
            <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Campaigns table */}
      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Campaign Info</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Platform</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <EmptyRow colSpan={5} message="Loading campaigns…" />
              ) : campaigns.length === 0 ? (
                <EmptyRow colSpan={5} message="No campaigns yet. Create your first campaign to get started." />
              ) : (
                campaigns.map((c, i) => (
                  <tr key={c._id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {c.category && <span>{c.category}</span>}
                        {c.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />{c.city}
                          </span>
                        )}
                        {c.budget && <span>₹{c.budget.toLocaleString("en-IN")}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {c.platform === "youtube" ? "YouTube" : "Instagram"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[c.status] || statusColors.draft}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(c)} title="Edit">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)} title="Delete">
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
