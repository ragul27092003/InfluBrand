import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortlists } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}

export default function DashOffers() {
  const { accountType } = useAuth();
  const isInfluencer = accountType !== "brand";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    shortlists
      .list()
      .then((data) => setRows(data.filter((r) => r.kind === "offer")))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  async function respond(id, response) {
    setBusyId(id);
    try {
      const updated = await shortlists.respond(id, response);
      setRows((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.success(response === "accepted" ? "Offer accepted." : "Offer declined.");
    } catch (err) {
      toast.error(err.message || "Couldn't update this offer.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <h2 className="font-display text-lg font-bold">Direct Offers</h2>
        <p className="text-sm text-muted-foreground">
          {isInfluencer
            ? "Collaboration offers sent to you directly by brands."
            : "Offers you've sent directly to influencers."}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">{isInfluencer ? "From" : "Influencer"}</th>
              <th className="px-6 py-3">Note</th>
              <th className="px-6 py-3">Status</th>
              {isInfluencer && <th className="px-6 py-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={5} message="Loading…" />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={5} message="No records" />
            ) : (
              rows.map((row, i) => (
                <tr key={row._id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 text-muted-foreground">{i + 1}</td>
                  <td className="px-6 py-4">
                    {isInfluencer ? row.brandId?.companyName : row.influencerId?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{row.note || "—"}</td>
                  <td className="px-6 py-4 capitalize">{row.response || "pending"}</td>
                  {isInfluencer && (
                    <td className="px-6 py-4">
                      {row.response ? (
                        <span className="text-xs text-muted-foreground">Responded</span>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="soft"
                            disabled={busyId === row._id}
                            onClick={() => respond(row._id, "accepted")}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            disabled={busyId === row._id}
                            onClick={() => respond(row._id, "declined")}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
