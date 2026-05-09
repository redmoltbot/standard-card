"use client";
import { useEffect, useState } from "react";
import type { Customer } from "@/types";
import CustomerModal from "@/components/CustomerModal";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CardsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customers?page=1&itemsPerPage=100")
      .then((r) => r.json())
      .then((d) => setCustomers(d.items ?? d ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Cards
      </h1>

      {loading ? (
        <div className="text-center py-16 text-xl text-gray-500">
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {c.firstName} {c.surname || ""}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(c.createdAt)}
                </div>
              </div>
              <button
                onClick={() => setSelected(c.serialNumber)}
                className="font-mono text-lime-600 underline text-base"
              >
                {c.serialNumber}
              </button>
            </div>
          ))}
          {customers.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-lg">
              No cards found.
            </div>
          )}
        </div>
      )}

      {selected && (
        <CustomerModal
          serialNumber={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
