"use client";
import { useEffect, useState } from "react";
import CustomerModal from "@/components/CustomerModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

type CardRow = {
  id: string;
  customer: { firstName: string; surname: string | null; phone: string | null; email: string | null };
};

export default function FindPage() {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cards?templateId=965363&page=1&itemsPerPage=100")
      .then((r) => r.json()).then((d) => setCards(d.data ?? [])).finally(() => setLoading(false));
  }, []);

  const results = query.trim()
    ? cards.filter((c) => {
        const q = query.toLowerCase();
        return `${c.customer.firstName} ${c.customer.surname || ""}`.toLowerCase().includes(q) ||
          (c.customer.phone || "").includes(q) || (c.customer.email || "").toLowerCase().includes(q);
      })
    : [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Find</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search by name, phone, or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 text-xl py-6 rounded-xl"
          autoFocus
        />
      </div>

      {loading && <p className="text-center py-8 text-muted-foreground">Loading...</p>}
      {!loading && query.trim() && results.length === 0 && <p className="text-center py-8 text-muted-foreground text-lg">No results found.</p>}
      {!loading && !query.trim() && <p className="text-center py-8 text-[var(--clr-text-faint)] text-lg">Start typing to search customers.</p>}

      <div className="space-y-3">
        {results.map((c) => (
          <button key={c.id} onClick={() => setSelected(c.id)} className="w-full text-left active:scale-95 transition-transform">
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-foreground">{c.customer.firstName} {c.customer.surname || ""}</div>
                <div className="text-base text-muted-foreground">{c.customer.phone || "No phone"} · {c.customer.email || "No email"}</div>
                <div className="text-sm font-mono text-[var(--clr-primary)] mt-1">{c.id}</div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {selected && <CustomerModal serialNumber={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
