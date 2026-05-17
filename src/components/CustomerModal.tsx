"use client";
import { useState, useEffect } from "react";
import type { CardInfo } from "@/types";
import StampPanel from "@/components/StampPanel";
import Toast, { useToast } from "@/components/Toast";
import { addLogEntry } from "@/lib/activityLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Minus } from "lucide-react";

interface CustomerModalProps { serialNumber: string; onClose: () => void; }

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CustomerModal({ serialNumber, onClose }: CustomerModalProps) {
  const [card, setCard] = useState<CardInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", surname: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | "card" | "customer">(null);
  const { toast, showToast, hideToast } = useToast();

  const fetchCard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${serialNumber}`);
      if (!res.ok) throw new Error();
      const data: CardInfo = await res.json();
      setCard(data);
      setEditForm({ firstName: data.customer.firstName || "", surname: data.customer.surname || "", phone: data.customer.phone || "", email: data.customer.email || "" });
    } catch { setCard(null); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCard(); }, [serialNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubtractReward = async () => {
    try {
      const res = await fetch(`/api/cards/${serialNumber}/subtract-reward`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: serialNumber, rewards: 1, comment: "", purchaseSum: 0.1 }) });
      if (!res.ok) throw new Error();
      addLogEntry({ cardNumber: serialNumber, action: "subtract-reward", count: 1, comment: "" });
      showToast("Reward subtracted", "success"); fetchCard();
    } catch { showToast("Failed to subtract reward", "error"); }
  };

  const handleSaveEdit = async () => {
    if (!card) return; setSaving(true);
    try {
      const res = await fetch(`/api/customers/${card.customer.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error();
      showToast("Customer updated", "success"); setEditing(false); fetchCard();
    } catch { showToast("Update failed", "error"); } finally { setSaving(false); }
  };

  const handleDeleteCard = async () => {
    try {
      const res = await fetch(`/api/cards/${serialNumber}`, { method: "DELETE" });
      if (!res.ok) throw new Error(); onClose();
    } catch { showToast("Delete failed", "error"); }
  };

  const handleDeleteCustomer = async () => {
    if (!card) return;
    try {
      const res = await fetch(`/api/customers/${card.customer.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(); onClose();
    } catch { showToast("Delete failed", "error"); }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-[var(--clr-surface-raised)] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Card Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></Button>
        </div>

        {loading ? (
          <p className="text-center py-16 text-xl text-muted-foreground">Loading...</p>
        ) : !card ? (
          <p className="text-center py-16 text-xl" style={{ color: "var(--clr-danger)" }}>Failed to load card data.</p>
        ) : (
          <div className="space-y-5">
            <Card>
              <CardContent className="p-4 grid grid-cols-2 gap-3 text-base">
                <span className="text-muted-foreground">Serial #</span>
                <span className="font-mono font-medium text-foreground break-all">{card.serialNumber}</span>
                <span className="text-muted-foreground">Stamps</span>
                <span className="font-bold text-[var(--clr-primary)] text-2xl">{card.stamps}</span>
                <span className="text-muted-foreground">Rewards</span>
                <span className="font-bold text-[var(--clr-warning)] text-2xl">{card.rewards}</span>
                <span className="text-muted-foreground">Joined</span>
                <span className="text-foreground">{formatDate(card.createdAt)}</span>
                {card.installLink && (<><span className="text-muted-foreground">Install Link</span><a href={card.installLink} target="_blank" rel="noreferrer" className="text-[var(--clr-primary)] underline truncate">Open</a></>)}
                {card.shareLink && (<><span className="text-muted-foreground">Share Link</span><a href={card.shareLink} target="_blank" rel="noreferrer" className="text-[var(--clr-primary)] underline truncate">Open</a></>)}
                {card.comment && (<><span className="text-muted-foreground">Comment</span><span className="text-foreground">{card.comment}</span></>)}
              </CardContent>
            </Card>

            {editing ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Edit Customer</h3>
                {([{ field: "firstName", label: "First Name", type: "text" }, { field: "surname", label: "Surname", type: "text" }, { field: "phone", label: "Phone", type: "tel" }, { field: "email", label: "Email", type: "email" }] as const).map(({ field, label, type }) => (
                  <div key={field} className="space-y-1">
                    <Label>{label}</Label>
                    <Input type={type} placeholder={label} value={editForm[field]} onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-4 text-lg">{saving ? "Saving..." : "Save"}</Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 py-4 text-lg">Cancel</Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-3 text-base">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-medium">{card.customer.firstName} {card.customer.surname || ""}</span>
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground">{card.customer.phone || "—"}</span>
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground break-all">{card.customer.email || "—"}</span>
                  <span className="text-muted-foreground">Customer ID</span>
                  <span className="text-foreground font-mono text-sm break-all">{card.customer.id}</span>
                  {card.customer.externalUserId && (<><span className="text-muted-foreground">External ID</span><span className="text-foreground font-mono text-sm">{card.customer.externalUserId}</span></>)}
                </CardContent>
              </Card>
            )}

            {"status" in card && (card as CardInfo & { status?: string }).status && (
              <Badge className={(card as CardInfo & { status?: string }).status === "installed"
                ? "bg-[var(--clr-success-bg)] text-[var(--clr-success)] hover:bg-[var(--clr-success-bg)] border-0"
                : "bg-muted text-muted-foreground border-0"}>
                {(card as CardInfo & { status?: string }).status === "not_installed" ? "Not Installed" : (card as CardInfo & { status?: string }).status}
              </Badge>
            )}

            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Stamps</h3>
              <StampPanel cardId={serialNumber} onSuccess={fetchCard} />
            </div>

            <Button variant="outline" onClick={handleSubtractReward} className="w-full py-6 text-xl font-bold rounded-2xl gap-2">
              <Minus className="h-5 w-5" /> Subtract Reward
            </Button>

            {confirmDelete ? (
              <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--clr-danger-bg)" }}>
                <p className="text-base font-semibold text-center" style={{ color: "var(--clr-danger)" }}>
                  {confirmDelete === "card" ? "Permanently delete this card?" : "Permanently delete this customer and all their data?"}
                </p>
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={() => confirmDelete === "card" ? handleDeleteCard() : handleDeleteCustomer()} className="flex-1 py-3 text-base">Yes, delete</Button>
                  <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1 py-3 text-base">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(true)} className="py-3 text-base border-[var(--clr-primary)] text-[var(--clr-primary)]">Edit</Button>
                <Button variant="outline" onClick={() => setConfirmDelete("card")} className="py-3 text-base border-[var(--clr-danger)] text-[var(--clr-danger)]">Del Card</Button>
                <Button variant="destructive" onClick={() => setConfirmDelete("customer")} className="py-3 text-base">Del Customer</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
