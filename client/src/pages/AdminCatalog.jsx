import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalog } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

function CatalogPanel({ title, list, create, update, deactivate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await create({ name: name.trim() });
      setName("");
      toast.success(`${title.slice(0, -1)} added.`);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to add.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item) {
    try {
      if (item.isActive) {
        await deactivate(item._id);
      } else {
        await update(item._id, { isActive: true });
      }
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update.");
    }
  }

  return (
    <div className="surface-panel p-6">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Deactivating hides it from new selections without breaking existing references.
      </p>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${title.toLowerCase().slice(0, -1)} name`} />
        <Button type="submit" variant="hero" size="sm" disabled={busy}>
          <Plus className="size-4" /> Add
        </Button>
      </form>

      <div className="mt-5 divide-y divide-border/60">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">None yet.</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="flex items-center justify-between py-2.5">
              <span className={`text-sm ${item.isActive ? "" : "text-muted-foreground line-through"}`}>
                {item.name}
              </span>
              <button
                onClick={() => toggle(item)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                title={item.isActive ? "Deactivate" : "Reactivate"}
              >
                {item.isActive ? <Ban className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                {item.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminCatalog() {
  const { accountType } = useAuth();

  if (accountType !== "admin") {
    return (
      <div className="surface-panel p-12 text-center">
        <p className="font-display text-lg">Admins only</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This page manages the Platform and Niche lists used across signup, profiles and filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Manage catalog</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <CatalogPanel
          title="Platforms"
          list={catalog.listAllPlatforms}
          create={catalog.createPlatform}
          update={catalog.updatePlatform}
          deactivate={catalog.deactivatePlatform}
        />
        <CatalogPanel
          title="Niches"
          list={catalog.listAllNiches}
          create={catalog.createNiche}
          update={catalog.updateNiche}
          deactivate={catalog.deactivateNiche}
        />
      </div>
    </div>
  );
}
