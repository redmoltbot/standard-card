"use client";
import { useState } from "react";
import Toast, { useToast } from "@/components/Toast";
import { addLogEntry } from "@/lib/activityLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StampPanelProps { cardId: string; onSuccess: () => void; }

export default function StampPanel({ cardId, onSuccess }: StampPanelProps) {
  const [stampsStr, setStampsStr] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleAction = async (action: "add-stamp" | "subtract-stamp") => {
    setLoading(true);
    try {
      const stamps = Math.max(1, parseInt(stampsStr) || 1);
      const res = await fetch(`/api/cards/${cardId}/${action}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cardId, stamps, comment, purchaseSum: 0.1 }),
      });
      if (!res.ok) throw new Error();
      addLogEntry({ cardNumber: cardId, action, count: stamps, comment });
      showToast(`${action === "add-stamp" ? "Added" : "Subtracted"} ${stamps} stamp${stamps !== 1 ? "s" : ""}`, "success");
      setComment(""); onSuccess();
    } catch { showToast("Action failed. Check card number.", "error"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <Input
        type="number" min={1} value={stampsStr}
        onChange={(e) => setStampsStr(e.target.value)}
        onBlur={() => { const n = parseInt(stampsStr); if (!stampsStr || n < 1 || isNaN(n)) setStampsStr("1"); }}
        className="text-xl py-6 rounded-xl"
      />
      <Input
        type="text" placeholder="Comment (optional)" value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="text-lg py-5 rounded-xl"
      />
      <div className="flex gap-3">
        <Button onClick={() => handleAction("add-stamp")} disabled={loading} className="flex-1 py-6 text-xl font-bold rounded-2xl">
          {loading ? "..." : "+ Add"}
        </Button>
        <Button variant="outline" onClick={() => handleAction("subtract-stamp")} disabled={loading} className="flex-1 py-6 text-xl font-bold rounded-2xl">
          {loading ? "..." : "− Subtract"}
        </Button>
      </div>
    </div>
  );
}
