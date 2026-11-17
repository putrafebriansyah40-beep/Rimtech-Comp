"use client";

import React, { useState } from "react";
import { RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resendWhatsappAction } from "@/lib/actions/admin";

export function ResendWhatsappButton({ logId }: { logId: number }) {
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    setLoading(true);
    const res = await resendWhatsappAction(logId);
    setLoading(false);

    if (res.success) {
      toast.success("Pesan WhatsApp berhasil dikirim ulang!");
    } else {
      toast.error(res.error || "Gagal mengirim ulang pesan WhatsApp");
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleResend}
      className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
      <span>Kirim Ulang</span>
    </button>
  );
}
