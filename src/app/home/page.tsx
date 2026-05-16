"use client";
import { useState, useEffect } from "react";
import Toast, { useToast } from "@/components/Toast";
import ActivityLogComp from "@/components/ActivityLog";
import ThemeToggle from "@/components/ThemeToggle";
import { addLogEntry } from "@/lib/activityLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useAppName } from "@/components/AppNameContext";

export default function HomePage() {
  const APP_NAME = useAppName();
  const [cardNum, setCardNum] = useState("");
  const [stampsStr, setStampsStr] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetch("/api/cards?templateId=965363&page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => setTotalCustomers(d.meta?.totalItems ?? d.data?.length ?? null))
      .catch(() => {});
  }, []);

  const handleStamp = async (action: "add-stamp" | "subtract-stamp") => {
    if (!cardNum.trim()) { showToast("Enter a card number", "error"); return; }
    setLoading(true);
    try {
      const stamps = Math.max(1, parseInt(stampsStr) || 1);
      const res = await fetch(`/api/cards/${cardNum.trim()}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cardNum.trim(), stamps, comment, purchaseSum: 0.1 }),
      });
      if (!res.ok) throw new Error();
      addLogEntry({ cardNumber: cardNum.trim(), action, count: stamps, comment });
      showToast(`${action === "add-stamp" ? "Added" : "Subtracted"} ${stamps} stamp${stamps !== 1 ? "s" : ""}`, "success");
      setCardNum(""); setStampsStr("1"); setComment("");
    } catch {
      showToast("Action failed. Check card number.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">{APP_NAME}</h1>
        <ThemeToggle />
      </div>

      <div className="space-y-3 mb-6">
        <Input
          type="text"
          placeholder="Serial Card Number"
          value={cardNum}
          onChange={(e) => setCardNum(e.target.value)}
          className="text-xl py-6 rounded-xl"
        />
        <Input
          type="number"
          min={1}
          value={stampsStr}
          onChange={(e) => setStampsStr(e.target.value)}
          onBlur={() => { const n = parseInt(stampsStr); if (!stampsStr || n < 1 || isNaN(n)) setStampsStr("1"); }}
          className="text-xl py-6 rounded-xl"
        />
        <Input
          type="text"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="text-xl py-6 rounded-xl"
        />
        <div className="flex gap-3">
          <Button onClick={() => handleStamp("add-stamp")} disabled={loading} className="flex-1 py-6 text-xl font-bold rounded-2xl">
            {loading ? "..." : "+ Add Stamps"}
          </Button>
          <Button variant="outline" onClick={() => handleStamp("subtract-stamp")} disabled={loading} className="flex-1 py-6 text-xl font-bold rounded-2xl">
            {loading ? "..." : "− Subtract"}
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[var(--clr-primary)]">{totalCustomers ?? "—"}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Customers</div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-[var(--clr-primary)]">{totalCustomers ?? "—"}</div>
            <div className="text-sm text-muted-foreground mt-1">Cards Issued</div>
          </CardContent>
        </Card>
      </div>

      <a href="https://t.me/" target="_blank" rel="noreferrer" className="block mb-6">
        <Button variant="outline" className="w-full py-6 text-xl font-bold rounded-2xl gap-2">
          <ExternalLink className="h-5 w-5" />
          Connect to Telegram
        </Button>
      </a>

      <ActivityLogComp />
    </div>
  );
}
