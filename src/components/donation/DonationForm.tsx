"use client";

import { useState } from "react";
import { type Campaign, formatRupiah } from "@/data/campaigns";

interface Props {
  campaign: Campaign;
}

const PRESET_AMOUNTS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export function DonationForm({ campaign }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number>(100_000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const effectiveAmount = isCustom ? Number(customAmount.replace(/\D/g, "")) : selectedAmount;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
    setErrorMessage("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomAmount(raw ? Number(raw).toLocaleString("id-ID") : "");
    setIsCustom(true);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!effectiveAmount || effectiveAmount < 10_000) {
      setErrorMessage("Nominal donasi minimal Rp 10.000");
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      setErrorMessage("Mohon isi nama Anda atau pilih opsi donasi anonim.");
      return;
    }

    if (!donorEmail.trim()) {
      setErrorMessage("Email wajib diisi untuk tanda terima donasi resmi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          amount: effectiveAmount,
          donor_name: isAnonymous ? "Hamba Allah" : donorName.trim(),
          is_anonymous: isAnonymous,
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses donasi.");
      }

      // Bila ada Snap token / redirect dari Midtrans
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else if (data.order_id) {
        window.location.href = `/donasi/sukses/${data.order_id}`;
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-line bg-parchment p-6 sm:p-8 shadow-sm">
      <div className="border-b border-line/70 pb-4">
        <span className="eyebrow text-forest">Formulir Donasi</span>
        <h2 className="mt-1 font-display text-2xl font-normal text-ink">
          Salurkan Kebaikan Anda
        </h2>
        <p className="mt-1 text-xs text-muted">
          Penyaluran resmi Yayasan Abdi Laksata Raya
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Pilihan Nominal */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-ink mb-3">
            Pilih Nominal Donasi
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {PRESET_AMOUNTS.map((amt) => {
              const active = !isCustom && selectedAmount === amt;
              return (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleSelectPreset(amt)}
                  className={`rounded-sm border py-2.5 px-2 text-center text-xs sm:text-sm font-medium transition-all ${
                    active
                      ? "border-forest bg-forest text-parchment shadow-sm"
                      : "border-line bg-ivory/50 text-ink hover:border-gold/60 hover:bg-ivory"
                  }`}
                >
                  {formatRupiah(amt)}
                </button>
              );
            })}
          </div>

          {/* Nominal Kustom */}
          <div className="mt-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Nominal lainnya (min. 10.000)"
                value={customAmount}
                onChange={handleCustomChange}
                className={`w-full rounded-sm border bg-ivory py-2.5 pl-10 pr-3.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-1 ${
                  isCustom
                    ? "border-forest ring-1 ring-forest"
                    : "border-line focus:border-forest focus:ring-forest"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Data Donatur */}
        <div className="space-y-4 border-t border-line/60 pt-5">
          <label className="block text-xs font-medium uppercase tracking-wider text-ink">
            Data Donatur
          </label>

          <div>
            <input
              type="text"
              placeholder="Nama Lengkap Anda"
              disabled={isAnonymous}
              value={isAnonymous ? "Hamba Allah (Anonim)" : donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full rounded-sm border border-line bg-ivory px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 disabled:bg-line/20 disabled:text-muted focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <label className="mt-2 flex items-center gap-2 cursor-pointer text-xs text-muted hover:text-ink">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-line text-forest focus:ring-forest"
              />
              <span>Sembunyikan nama saya (Donasi sebagai Hamba Allah)</span>
            </label>
          </div>

          <div>
            <input
              type="email"
              required
              placeholder="Alamat Email (untuk bukti donasi resmi)"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full rounded-sm border border-line bg-ivory px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div>
            <input
              type="tel"
              placeholder="Nomor WhatsApp (opsional)"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              className="w-full rounded-sm border border-line bg-ivory px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="Tuliskan doa atau pesan dukungan (opsional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-sm border border-line bg-ivory px-3.5 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest resize-none"
            />
          </div>
        </div>

        {/* Ringkasan & Tombol Aksi */}
        {errorMessage && (
          <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="border-t border-line/60 pt-4">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-xs text-muted uppercase tracking-wider">Total Donasi</span>
            <span className="font-display text-2xl font-normal text-forest">
              {formatRupiah(effectiveAmount || 0)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || effectiveAmount < 10_000}
            className="w-full rounded-sm bg-forest py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-parchment shadow-sm transition-all duration-300 hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Lanjutkan Pembayaran →"}
          </button>

          <p className="mt-3 text-center text-[0.68rem] text-muted leading-relaxed">
            🔒 Pembayaran aman & terverifikasi. Seluruh donasi dicatat transparan di pembukuan yayasan.
          </p>
        </div>
      </form>
    </div>
  );
}
