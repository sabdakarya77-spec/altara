"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!agreedPrivacy) {
      setErrorMessage(
        "Mohon setujui klausul pemrosesan data kontak donatur untuk melanjutkan."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          campaign_slug: campaign.slug,
          donor_name: donorName.trim(),
          donor_email: donorEmail.trim(),
          donor_phone: donorPhone.trim(),
          is_anonymous: isAnonymous,
          amount: effectiveAmount,
          message: message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.order_id) {
        throw new Error(data.error || "Gagal mencatat donasi ke server. Silakan coba kembali.");
      }

      setRefCode(data.order_id);
      setStep("instruction");
    } catch (err) {
      setErrorMessage(
        (err as Error).message ||
          "Terjadi kendala saat menghubungi server. Donasi belum dapat dicatat."
      );
    } finally {
      setIsSubmitting(false);
    }
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
  const hasWhatsApp = Boolean(cleanWa);
  const contactEmail = settings?.contact_email?.trim() || "";
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

  const waUrl = hasWhatsApp
    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(waMessage)}`
    : "";

  const bankName = settings?.bank_name?.trim() || "Rekening Resmi Yayasan";
  const bankAccountNo = settings?.bank_account_no?.trim() || "";
  const hasBankAccount = Boolean(bankAccountNo);
  const bankAccountHolder =
    settings?.bank_account_holder?.trim() || "Yayasan Abdi Laksata Raya";

  if (campaign.is_placeholder) {
    return (
      <div className="rounded-sm border border-amber-300 bg-amber-50/70 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-amber-200/90 border border-amber-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
            Program Simulasi
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-normal text-ink">
          Penerimaan Donasi Belum Dibuka
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          Program ini saat ini berstatus peragaan desain/simulasi sistem dan belum membuka penerimaan donasi publik. Tombol dan formulir transaksi dinonaktifkan demi keamanan.
        </p>
        <div className="mt-6 rounded-sm border border-amber-200/80 bg-white/90 p-4 text-xs text-amber-950">
          <p className="font-semibold text-ink">Ingin mendukung program aktif kami?</p>
          <p className="mt-1 text-muted leading-relaxed">
            Anda dapat melihat program donasi lain yang sedang berjalan atau menghubungi narahubung yayasan.
          </p>
          <div className="mt-4">
            <Link
              href="/donasi"
              className="inline-block rounded-sm bg-forest px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-parchment hover:bg-forest/90 transition-colors"
            >
              Jelajahi Program Aktif Lainnya →
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

          {!hasBankAccount ? (
            <div className="rounded-sm border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
              <strong className="block font-semibold mb-1">Rekening Resmi Belum Dikonfigurasi</strong>
              Kanal transfer bank langsung sedang dalam pemutakhiran data oleh pihak yayasan.
              {contactEmail ? (
                <span> Silakan hubungi kami melalui email <strong>{contactEmail}</strong> untuk petunjuk rekening penyaluran.</span>
              ) : (
                <span> Mohon hubungi narahubung yayasan sebelum melakukan transaksi.</span>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between border-b border-line/60 pb-3">
                <div>
                  <span className="text-xs text-muted">Bank Tujuan</span>
                  <p className="text-sm font-semibold text-ink">{bankName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankAccountNo, "account")}
                  className="text-xs font-medium text-forest hover:text-ink transition-colors"
                >
                  {copiedAccount ? "✓ Tersalin" : "Salin No. Rekening"}
                </button>
              </div>

              <div className="border-b border-line/60 pb-3">
                <span className="text-xs text-muted">Nomor Rekening</span>
                <p className="font-mono text-lg font-bold tracking-wider text-forest">
                  {bankAccountNo}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted">Atas Nama</span>
                <p className="text-sm font-medium text-ink">{bankAccountHolder}</p>
              </div>
            </>
          )}

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

        {/* Tombol Konfirmasi WhatsApp / Email */}
        <div className="mt-6 space-y-3 border-t border-line/70 pt-5">
          {hasWhatsApp ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-700 py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-300 hover:bg-emerald-800"
            >
              <span>💬 Konfirmasi via WhatsApp Yayasan →</span>
            </a>
          ) : contactEmail ? (
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Konfirmasi Donasi: ${refCode}`)}&body=${encodeURIComponent(waMessage)}`}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-forest py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-all duration-300 hover:bg-forest/90"
            >
              <span>✉️ Konfirmasi via Email Yayasan →</span>
            </a>
          ) : (
            <div className="rounded-sm border border-line bg-parchment p-3 text-center text-xs text-muted">
              Simpan Kode Referensi Donasi Anda: <strong className="font-mono text-ink">{refCode}</strong>
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep("input")}
            className="w-full rounded-sm border border-line py-2.5 text-center text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
          >
            ← Kembali / Ubah Data Donasi
          </button>

          <p className="text-center text-[0.68rem] text-muted leading-relaxed">
            Setelah transfer, kirimkan bukti transfer agar tanda terima donasi resmi segera diterbitkan yayasan.
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

      {!hasBankAccount && !hasWhatsApp && (
        <div className="mt-4 rounded-sm border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
          <strong className="block font-semibold mb-0.5">Catatan Kanal Penyaluran:</strong>
          Rekening resmi yayasan dan kontak WhatsApp saat ini sedang dalam proses konfigurasi administrasi oleh admin. Anda tetap dapat mendaftarkan niat donasi untuk memperoleh kode referensi resmi.
        </div>
      )}

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

        {/* Klausul Persetujuan Kebijakan Privasi (UU PDP No. 27/2022) */}
        <div className="rounded-sm border border-line/80 bg-ivory/70 p-3 sm:p-3.5">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted hover:text-ink leading-relaxed">
            <input
              type="checkbox"
              checked={agreedPrivacy}
              onChange={(e) => {
                setAgreedPrivacy(e.target.checked);
                if (e.target.checked && errorMessage.includes("kebijakan privasi")) {
                  setErrorMessage("");
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-line text-forest focus:ring-forest cursor-pointer"
            />
            <span>
              Saya menyetujui pemrosesan data kontak untuk keperluan verifikasi donasi, penerbitan tanda terima resmi, dan komunikasi yayasan sesuai ketentuan{" "}
              <Link
                href="/kebijakan-privasi"
                className="text-forest underline hover:text-ink transition-colors font-medium"
                target="_blank"
              >
                Kebijakan Privasi
              </Link>{" "}
              (UU PDP No. 27/2022).
            </span>
          </label>
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
            disabled={isSubmitting || effectiveAmount < 10_000 || !agreedPrivacy}
            className="w-full rounded-sm bg-forest py-3.5 px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-parchment shadow-sm transition-all duration-300 hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Memproses Donasi..." : "Lanjutkan Donasi (Transfer Manual) →"}
          </button>

          <p className="mt-3 text-center text-[0.68rem] text-muted leading-relaxed">
            🔒 Donasi disalurkan langsung ke rekening resmi Yayasan Abdi Laksata Raya. Data kontak Anda dilindungi dan semata-mata digunakan untuk konfirmasi donasi resmi.
          </p>
        </div>
      </form>
    </div>
  );
}
