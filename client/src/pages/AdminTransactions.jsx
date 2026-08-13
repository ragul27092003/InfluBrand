import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Loader2, Download, ArrowUpRight, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { admin } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function AdminTransactions() {
  const { accountType } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  function load() {
    setLoading(true);
    admin.getTransactions({ search, page })
      .then((data) => {
        setTransactions(data.transactions || []);
        setTotalPages(data.totalPages || 1);
        setTotalTransactions(data.total || 0);
      })
      .catch((err) => {
        toast.error("Failed to load transactions.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (accountType === "admin") {
      const timer = setTimeout(load, 300);
      return () => clearTimeout(timer);
    }
  }, [accountType, search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (accountType !== "admin") return null;

  function handleExportCSV() {
    if (transactions.length === 0) return toast.error("No transactions to export");
    
    // Create CSV content
    const headers = ["ID,Date,Brand,Item,Amount,Status\n"];
    const rows = transactions.map(tx => {
      const date = new Date(tx.createdAt).toISOString();
      const brand = `"${tx.brandId?.companyName || 'Unknown'}"`;
      const item = `"${tx.title || '—'}"`;
      return `${tx._id},${date},${brand},${item},${tx.amount},${tx.status}`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `influbrand_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV Downloaded!");
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Transaction Ledger</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete history of purchases across the platform.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by brand name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 shrink-0 border-border hover:bg-muted">
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="surface-panel overflow-hidden border border-border/50 shadow-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-transparent pointer-events-none" />
        <div className="overflow-x-auto min-h-[400px] relative z-10">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-card/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-6 animate-spin mb-4 opacity-50" />
                    <p>Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <ArrowUpRight className="size-12 opacity-20 mb-4" />
                      <p>No transactions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="transition-colors hover:bg-muted/50 group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground">{tx._id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.brandId?.logoUrl ? (
                          <img src={tx.brandId.logoUrl} alt="" className="size-6 rounded-full object-cover" />
                        ) : (
                          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                            {(tx.brandId?.companyName || "B").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="font-semibold text-sm">{tx.brandId?.companyName || "Unknown"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                        {tx.title || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-base text-foreground">₹{tx.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === 'cleared' ? (
                        <span className="inline-flex items-center gap-1.5 text-green-500 font-semibold text-sm">
                          <CheckCircle2 className="size-4" /> Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-yellow-500 font-semibold text-sm capitalize">
                          <Clock className="size-4" /> {tx.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages} <span className="hidden sm:inline">({totalTransactions} total transactions)</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
