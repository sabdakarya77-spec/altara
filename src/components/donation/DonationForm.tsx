"use client";

import { useState } from "react";
import { type Campaign, formatRupiah } from "@/data/campaigns";
import type { SiteSettings } from "@/data/settings";

interface Props {
  campaign: Campaign;
  settings?: SiteSettings;
}

const PRESET_AMOUNTS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export function DonationForm({ campaign, settings }: Props) {
  const [step, setStep] = useState<"input" | "instruction">("input");
  const [selectedAmount, setSelectedAmount] = useState<number>(100_000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [message, setMessage] = useState("");

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const effectiveAmount = isCustom
    ? Number(customAmount.replace(/\D/g, ""))
    : selectedAmount;

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

  const handleSubmit = (e: React.FormEvent) => {
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

    // Buat kode referensi unik 4-digit
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setRefCode(`ALTR-${randomCode}`);
    setStep("instruction");
  };

  const copyToClipboard = async (text: string, type: "account" | "amount") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "account") {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      } else {
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
      }
    } catch {
      // Fallback bila clipboard API diblokir
    }
  };

  // Nomor WA dan Pesan Konfirmasi WhatsApp
  const rawWa = settings?.contact_whatsapp || "";
  const cleanWa = rawWa.replace(/\D/g, "").replace(/^0/, "62");
  const displayName = isAnonymous ? "Hamba Allah (Anonim)" : donorName.trim();

  const waMessage = [
    `Halo Yayasan Abdi Laksata Raya, saya telah melakukan transfer donasi:`,
    ``,
    `• Program: ${campaign.title}`,
    `• Nominal: ${formatRupiah(effectiveAmount)}`,
    `• Donatur: ${displayName}`,
    `• Email: ${donorEmail.trim()}`,
    donorPhone.trim() ? `• No. Kontak: ${donorPhone.trim()}` : "",
    `• Kode Referensi: ${refCode}`,
    message.trim() ? `• Doa/Pesan: "${message.trim()}"` : "",
    ``,
    `Berikut saya lampirkan bukti transfer. Mohon dikonfirmasi. Terima kasih.`,
  ]
    .filter(Boolean)
    .join("\n");

  const waUrl = cleanWa
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  const bankName = settings?.bank_name || "Rekening Resmi Yayasan";
  const bankAccountNo = settings?.bank_account_no || "";
  const bankAccountHolder =
    settings?.bank_account_holder || "Yayasan Abdi Laksata Raya";

  if (step === "instruction") {
    return (
      <div className="rounded-sm border border-line bg-parchment p-6 sm:p-8 shadow-sm">
        <div className="border-b border-line/70 pb-4">
          <span className="eyebrow text-forest">Instruksi Transfer Donasi</span>
          <h2 className="mt-1 font-display text-2xl font-normal text-ink">
            Selesaikan Donasi Anda
          </h2>
          <p className="mt-1 text-xs text-muted">
            Salurkan donasi melalui transfer bank resmi berikut:
          </p>
        </div>

        {/* Kotak Nominal yang Harus Ditransfer */}
        <div className="mt-6 rounded-sm border border-forest/30 bg-forest/5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted font-medium">
              Nominal Transfer
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(String(effectiveAmount), "amount")}
              className="text-xs font-medium text-forest hover:text-ink transition-colors"
            >
              {copiedAmount ? "✓ Tersalin" : "Salin Nominal"}
            </button>
          </div>
          <p className="mt-1 font-display text-2xl sm:text-3xl text-forest font-normal">
            {formatRupiah(effectiveAmount)}
          </p>
          <p className="mt-1 text-[0.72rem] text-muted">
            Donasi untuk: <strong className="text-ink">{campaign.title}</strong>
          </p>
        </div>

        {/* Kotak Rekening Tujuan */}
        <div className="mt-5 space-y-3 rounded-sm border border-line bg-ivory/80 p-4 sm:p-5">
          <span className="block text-[0.68rem] uppercase tracking-wider text-muted">
            Rekening Tujuan
          </span>

          <div className="flex items-baseline justify-between border-b border-line/60 pb-3">
            <div>
              <span className="text-xs text-muted">Bank Tujuan</span>
              <p className="text-sm font-semibold text-ink">{bankName}</p>
            </div>
            {bankAccountNo ? (
              <button
                type="button"
                onClick={() => copyToClipboard(bankAccountNo, "account")}
                className="text-xs font-medium text-forest hover:text-ink transition-colors"
              >
                {copiedAccount ? "✓ Tersalin" : "Salin No. Rekening"}
              </button>
            ) : null}
          </div>

          <div className="border-b border-line/60 pb-3">
            <span className="text-xs text-muted">Nomor Rekening</span>
            <p className="font-mono text-lg font-bold tracking-wider text-forest">
              {bankAccountNo || "Hubungi Narahubung Yayasan"}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted">Atas Nama</span>
            <p className="text-sm font-medium text-ink">{bankAccountHolder}</p>
          </div>

          {refCode && (
            <div className="border-t border-line/60 pt-3">
              <span className="text-xs text-muted">Kode Referensi Donasi</span>
              <p className="font-mono text-sm font-bold text-ink">{refCode}</p>
              <span className="text-[0.68rem] text-muted">
                (Cantumkan pada berita transfer bila memungkinkan)
              </span>
            </div>
          )}
        </div>

        {/* Tombol Konfirmasi WhatsApp */}
        <div className="mt-6 space-y-3 border-t border-line/70 pt-5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-700 py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-300 hover:bg-emerald-800"
          >
            <span>💬 Konfirmasi via WhatsApp Yayasan →</span>
          </a>

          <button
            type="button"
            onClick={() => setStep("input")}
            className="w-full rounded-sm border border-line py-2.5 text-center text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
          >
            ← Kembali / Ubah Data Donasi
          </button>

          <p className="text-center text-[0.68rem] text-muted leading-relaxed">
            Setelah transfer, kirimkan bukti transfer ke WhatsApp resmi agar tanda terima donasi resmi segera diterbitkan.
          </p>
        </div>
      </div>
    );
  }

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
            disabled={effectiveAmount < 10_000}
            className="w-full rounded-sm bg-forest py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-parchment shadow-sm transition-all duration-300 hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lanjutkan Donasi (Transfer Manual) →
          </button>

          <p className="mt-3 text-center text-[0.68rem] text-muted leading-relaxed">
            🔒 Donasi disalurkan langsung ke rekening resmi Yayasan Abdi Laksata Raya. Konfirmasi instan via WhatsApp.
          </p>
        </div>
      </form>
    </div>
  );
}
