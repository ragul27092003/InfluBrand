import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [taskLinks, setTaskLinks] = useState({});

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

  async function handleTaskAction(id, action) {
    setBusyId(id);
    try {
      let updated;
      if (action === "submit") {
        const link = taskLinks[id];
        if (!link) {
          toast.error("Please enter a link first");
          setBusyId(null);
          return;
        }
        updated = await shortlists.submitTask(id, link);
        toast.success("Task submitted for review!");
      } else if (action === "approve") {
        updated = await shortlists.approveTask(id);
        toast.success("Task approved! Funds have been released.");
      } else if (action === "reject") {
        updated = await shortlists.rejectTask(id);
        toast.success("Task rejected.");
      }
      setRows((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch (err) {
      toast.error(err.message || "Action failed.");
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
              <th className="px-6 py-3">Task Progress</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={6} message="Loading…" />
            ) : rows.length === 0 ? (
              <EmptyRow colSpan={6} message="No records" />
            ) : (
              rows.map((row, i) => (
                <tr key={row._id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 text-muted-foreground">{i + 1}</td>
                  <td className="px-6 py-4">
                    {isInfluencer ? row.brandId?.companyName : row.influencerId?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{row.note || "—"}</td>
                  <td className="px-6 py-4 capitalize">{row.response || "pending"}</td>
                  <td className="px-6 py-4">
                    {row.response === "accepted" ? (
                      <div className="flex flex-col gap-1">
                        {row.taskStatus === "not_started" && <span className="text-muted-foreground text-xs font-semibold">Not Started</span>}
                        {row.taskStatus === "submitted" && <span className="text-yellow-500 font-semibold text-xs">Awaiting Approval</span>}
                        {row.taskStatus === "approved" && <span className="text-green-500 font-semibold text-xs">Completed & Paid</span>}
                        {row.taskStatus === "rejected" && <span className="text-red-500 font-semibold text-xs">Changes Requested</span>}
                        {row.taskLink && (
                          <a href={row.taskLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 truncate max-w-[150px]">
                            View Work Link
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {row.response === "pending" && isInfluencer && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="soft" disabled={busyId === row._id} onClick={() => respond(row._id, "accepted")}>
                          <Check className="size-4" />
                        </Button>
                        <Button size="icon" variant="outline" disabled={busyId === row._id} onClick={() => respond(row._id, "declined")}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}
                    {row.response === "pending" && !isInfluencer && (
                      <span className="text-xs text-muted-foreground">Awaiting response</span>
                    )}
                    {row.response === "accepted" && (
                      <div className="flex flex-col gap-2 w-full max-w-[200px]">
                        {isInfluencer && (row.taskStatus === "not_started" || row.taskStatus === "rejected") && (
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Post URL..." 
                              className="h-8 text-xs" 
                              value={taskLinks[row._id] || ""}
                              onChange={e => setTaskLinks({...taskLinks, [row._id]: e.target.value})}
                            />
                            <Button size="sm" variant="hero" className="h-8" disabled={busyId === row._id} onClick={() => handleTaskAction(row._id, "submit")}>
                              Submit
                            </Button>
                          </div>
                        )}
                        {!isInfluencer && row.taskStatus === "submitted" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="hero" className="h-8 flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={busyId === row._id} onClick={() => handleTaskAction(row._id, "approve")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 flex-1" disabled={busyId === row._id} onClick={() => handleTaskAction(row._id, "reject")}>
                              Reject
                            </Button>
                          </div>
                        )}
                        {(row.taskStatus === "approved" || (isInfluencer && row.taskStatus === "submitted") || (!isInfluencer && (row.taskStatus === "not_started" || row.taskStatus === "rejected"))) && (
                          <span className="text-xs text-muted-foreground">No action needed</span>
                        )}
                      </div>
                    )}
                    {row.response === "declined" && (
                      <span className="text-xs text-muted-foreground">Declined</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
