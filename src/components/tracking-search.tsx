"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function TrackingSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) {
      toast.error("Masukkan kode booking atau nomor WhatsApp Anda");
      return;
    }
    setSearching(true);
    router.push(`/lacak/${clean}`);
  }

  return (
    <form onSubmit={handleSearch} className="max-w-xl mx-auto">
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Masukkan Kode Booking (cth: RMC-20261021-001) atau No. WA"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium transition-all"
        />
        <button
          type="submit"
          disabled={searching}
          className="absolute right-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50"
        >
          <span>{searching ? "Mencari..." : "Lacak"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mt-2 text-center">
        Kode booking dikirimkan ke WhatsApp Anda setelah reservasi & pembayaran DP terverifikasi.
      </p>
    </form>
  );
}
