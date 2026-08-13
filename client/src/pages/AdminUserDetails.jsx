import { useEffect, useState } from "react";
import { X, Loader2, Calendar, Target, Activity, CreditCard } from "lucide-react";
import { admin } from "@/lib/api";
import { toast } from "sonner";

export default function AdminUserDetails({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.getUserDetails(userId)
      .then(setData)
      .catch(err => {
        toast.error("Failed to fetch details");
        onClose();
      })
      .finally(() => setLoading(false));
  }, [userId, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="surface-panel h-full w-full max-w-lg border-l border-border p-6 shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
        
        <h3 className="font-display text-2xl font-bold mb-6">User Overview</h3>
        
        {loading || !data ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <img 
                src={data.account.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.account.email} 
                className="size-16 rounded-full border-2 border-border" 
                alt="Avatar" 
              />
              <div>
                <h4 className="text-xl font-bold font-display">{data.account.fullName}</h4>
                <p className="text-sm text-muted-foreground">{data.account.email}</p>
                <div className="mt-2 flex gap-2">
                  <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {data.account.accountType}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Joined {new Date(data.account.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {data.profile && (
              <div className="space-y-3">
                <h5 className="font-bold uppercase tracking-wider text-xs text-muted-foreground flex items-center gap-2">
                  <Activity className="size-3.5" /> Profile Metrics
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Account Balance</p>
                    <p className="text-xl font-bold">
                      {data.profile.accountBalance !== undefined ? `₹${data.profile.accountBalance}` : 'N/A'}
                    </p>
                  </div>
                  {data.account.accountType === "brand" && (
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Available Connects</p>
                      <p className="text-xl font-bold">{data.profile.connectBalance || 0}</p>
                    </div>
                  )}
                  {data.account.accountType === "influencer" && (
                    <div className="p-4 rounded-xl bg-card border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Verification</p>
                      <p className="text-lg font-bold">{data.profile.isVerified ? "Verified" : "Pending"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.campaigns && data.campaigns.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-bold uppercase tracking-wider text-xs text-muted-foreground flex items-center gap-2">
                  <Target className="size-3.5" /> Recent Campaigns
                </h5>
                <div className="space-y-2">
                  {data.campaigns.slice(0, 3).map(c => (
                    <div key={c._id} className="p-3 rounded-lg bg-card border border-border flex justify-between items-center">
                      <p className="font-semibold text-sm truncate">{c.title}</p>
                      <span className="text-xs text-muted-foreground capitalize">{c.status}</span>
                    </div>
                  ))}
                  {data.campaigns.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">+{data.campaigns.length - 3} more campaigns</p>
                  )}
                </div>
              </div>
            )}

            {data.transactions && data.transactions.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-bold uppercase tracking-wider text-xs text-muted-foreground flex items-center gap-2">
                  <CreditCard className="size-3.5" /> Recent Transactions
                </h5>
                <div className="space-y-2">
                  {data.transactions.slice(0, 4).map(tx => (
                    <div key={tx._id} className="p-3 rounded-lg bg-card border border-border flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">{tx.itemType === 'package' ? `Package: ${tx.itemId}` : tx.itemType}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="font-bold text-green-500">₹{tx.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
