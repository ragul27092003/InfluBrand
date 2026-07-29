import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Users, Send, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortlists as shortlistsApi } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}

function DataTable({ title, icon: Icon, columns, children, emptyMessage }) {
  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
        <Icon className="size-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left font-semibold text-muted-foreground">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

const responseStyles = {
  pending: "bg-yellow-500/15 text-yellow-400",
  accepted: "bg-green-500/15 text-green-400",
  declined: "bg-red-500/15 text-red-400",
};

export default function Dashboard() {
  const { user, accountType } = useAuth();
  const [shortlistItems, setShortlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shortlistsApi
      .list()
      .then(setShortlistItems)
      .catch(() => setShortlistItems([]))
      .finally(() => setLoading(false));
  }, []);

  const shortlisted = shortlistItems
    .filter((s) => s.kind === "shortlist")
    .slice(0, 5);
  const offers = shortlistItems
    .filter((s) => s.kind === "offer")
    .slice(0, 5);

  // Quick-stat cards
  const stats = [
    { label: "Total Shortlists", value: shortlistItems.filter((s) => s.kind === "shortlist").length, icon: Heart },
    { label: "Direct Offers", value: shortlistItems.filter((s) => s.kind === "offer").length, icon: Send },
    { label: "Pending Responses", value: shortlistItems.filter((s) => s.response === "pending").length, icon: Clock },
  ];

  function influencerName(item) {
    if (accountType === "brand") {
      return item.influencerId?.name || "Unknown creator";
    }
    return item.brandId?.companyName || "Unknown brand";
  }

  function influencerDetail(item) {
    if (accountType === "brand") {
      const inf = item.influencerId;
      return inf ? `${inf.city || ""} · ${inf.platform || ""}` : "";
    }
    const brand = item.brandId;
    return brand ? `${brand.city || ""}` : "";
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="surface-panel flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[image:var(--gradient-mint)] text-primary-foreground">
              <s.icon className="size-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latest 5 Shortlists */}
      <DataTable
        title="Latest 5 Shortlists"
        icon={Heart}
        columns={["#", accountType === "brand" ? "Influencer Info" : "Brand Info", "Action"]}
      >
        {loading ? (
          <EmptyRow colSpan={3} message="Loading…" />
        ) : shortlisted.length === 0 ? (
          <EmptyRow colSpan={3} message="No Record(s)" />
        ) : (
          shortlisted.map((item, i) => (
            <tr key={item._id} className="transition-colors hover:bg-muted/20">
              <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{influencerName(item)}</p>
                <p className="text-xs text-muted-foreground">{influencerDetail(item)}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${responseStyles[item.response] || responseStyles.pending}`}>
                  {item.response}
                </span>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      {/* Latest 5 Direct Offers */}
      <DataTable
        title="Latest 5 Direct Offers"
        icon={Send}
        columns={["#", accountType === "brand" ? "Influencer Info" : "Brand Info", "Response"]}
      >
        {loading ? (
          <EmptyRow colSpan={3} message="Loading…" />
        ) : offers.length === 0 ? (
          <EmptyRow colSpan={3} message="No Record(s)" />
        ) : (
          offers.map((item, i) => (
            <tr key={item._id} className="transition-colors hover:bg-muted/20">
              <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{influencerName(item)}</p>
                <p className="text-xs text-muted-foreground">{influencerDetail(item)}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${responseStyles[item.response] || responseStyles.pending}`}>
                  {item.response}
                </span>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-panel p-6">
          <h3 className="font-display text-lg font-semibold">Discover creators</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the directory and shortlist influencers for your campaign.
          </p>
          <Button variant="hero" className="mt-4" asChild>
            <Link to="/influencers">Browse influencers</Link>
          </Button>
        </div>
        <div className="surface-panel p-6">
          <h3 className="font-display text-lg font-semibold">Need help?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team can build a curated creator list for your brief.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
