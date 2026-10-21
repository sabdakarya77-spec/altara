"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/data/settings";
import { DEFAULT_SETTINGS } from "@/data/settings";

export function SettingsView() {
  const [values, setValues] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (!res.ok) {
          setError("Gagal memuat pengaturan.");
          return;
        }
        const data = (await res.json()) as { settings?: Partial<SiteSettings> };
        if (data.settings) {
          setValues((prev) => ({ ...prev, ...data.settings }));
        }
      } catch {
        setError("Tidak dapat terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan pengaturan.");
        return;
      }

      setNotice("Pengaturan berhasil disimpan. Perubahan sudah langsung diterapkan ke website publik.");
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(key: keyof SiteSettings, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-lg border border-line bg-parchment p-8 text-center text-sm text-muted">
        Memuat pengaturan yayasan…
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-8 max-w-4xl">
      {notice ? (
        <div className="rounded-lg border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-forest">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-900/30 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      {/* ── 1. Kontak & Operasional ──────────────────────────────────── */}
      <div className="rounded-xl border border-line bg-parchment p-6">
        <h2 className="font-display text-2xl text-ink">Kontak & Operasional Yayasan</h2>
        <p className="mt-1 text-xs text-muted">
          Informasi narahubung resmi yang ditampilkan pada bagian footer dan formulir dukungan.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="eyebrow block" htmlFor="contact_whatsapp">
              Nomor WhatsApp Resmi
            </label>
            <input
              id="contact_whatsapp"
              type="text"
              value={values.contact_whatsapp}
              onChange={(e) => updateField("contact_whatsapp", e.target.value)}
              placeholder="+62 812-3456-7890"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">Untuk tombol chat WhatsApp donasi / layanan.</p>
          </div>

          <div>
            <label className="eyebrow block" htmlFor="contact_email">
              Alamat Email Resmi
            </label>
            <input
              id="contact_email"
              type="email"
              value={values.contact_email}
              onChange={(e) => updateField("contact_email", e.target.value)}
              placeholder="halo@altara.or.id"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">Email korespondensi kemitraan dan surat menyurat.</p>
          </div>

          <div className="sm:col-span-2">
            <label className="eyebrow block" htmlFor="office_address">
              Wilayah Operasional / Kantor Cabang
            </label>
            <input
              id="office_address"
              type="text"
              value={values.office_address}
              onChange={(e) => updateField("office_address", e.target.value)}
              placeholder="Jakarta · Yogyakarta · Kupang"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted">Ringkasan kota/wilayah operasional yayasan.</p>
          </div>
        </div>
      </div>

      {/* ── 2. Rekening Donasi Resmi ─────────────────────────────────── */}
      <div className="rounded-xl border border-line bg-parchment p-6">
        <h2 className="font-display text-2xl text-ink">Rekening Donasi Resmi</h2>
        <p className="mt-1 text-xs text-muted">
          Rekening bank resmi atas nama badan hukum yayasan untuk transfer donasi langsung.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div>
            <label className="eyebrow block" htmlFor="bank_name">
              Nama Bank
            </label>
            <input
              id="bank_name"
              type="text"
              value={values.bank_name}
              onChange={(e) => updateField("bank_name", e.target.value)}
              placeholder="Bank Mandiri"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="bank_account_no">
              Nomor Rekening
            </label>
            <input
              id="bank_account_no"
              type="text"
              value={values.bank_account_no}
              onChange={(e) => updateField("bank_account_no", e.target.value)}
              placeholder="137-00-1234567-8"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="bank_account_holder">
              Atas Nama (Nama Akun)
            </label>
            <input
              id="bank_account_holder"
              type="text"
              value={values.bank_account_holder}
              onChange={(e) => updateField("bank_account_holder", e.target.value)}
              placeholder="Yayasan Abdi Laksata Raya"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── 3. Media Sosial Resmi ─────────────────────────────────────── */}
      <div className="rounded-xl border border-line bg-parchment p-6">
        <h2 className="font-display text-2xl text-ink">Media Sosial Resmi</h2>
        <p className="mt-1 text-xs text-muted">
          Tautan ke akun media sosial yayasan. Kolom yang dikosongkan tidak akan menampilkan ikon di website publik.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="eyebrow block" htmlFor="social_instagram">
              Instagram URL
            </label>
            <input
              id="social_instagram"
              type="url"
              value={values.social_instagram}
              onChange={(e) => updateField("social_instagram", e.target.value)}
              placeholder="https://instagram.com/altara.or.id"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="social_youtube">
              YouTube URL
            </label>
            <input
              id="social_youtube"
              type="url"
              value={values.social_youtube}
              onChange={(e) => updateField("social_youtube", e.target.value)}
              placeholder="https://youtube.com/@altara"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="social_linkedin">
              LinkedIn URL
            </label>
            <input
              id="social_linkedin"
              type="url"
              value={values.social_linkedin}
              onChange={(e) => updateField("social_linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/altara"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="social_tiktok">
              TikTok URL
            </label>
            <input
              id="social_tiktok"
              type="url"
              value={values.social_tiktok}
              onChange={(e) => updateField("social_tiktok", e.target.value)}
              placeholder="https://tiktok.com/@altara.or.id"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="social_facebook">
              Facebook URL
            </label>
            <input
              id="social_facebook"
              type="url"
              value={values.social_facebook}
              onChange={(e) => updateField("social_facebook", e.target.value)}
              placeholder="https://facebook.com/altara.or.id"
              className={inputClass}
            />
          </div>

          <div>
            <label className="eyebrow block" htmlFor="social_x">
              X / Twitter URL
            </label>
            <input
              id="social_x"
              type="url"
              value={values.social_x}
              onChange={(e) => updateField("social_x", e.target.value)}
              placeholder="https://x.com/altara_or_id"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Submit button bar ────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-4 border-t border-line/60 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-parchment transition-colors hover:bg-forest disabled:opacity-50"
        >
          {saving ? "Menyimpan Pengaturan…" : "Simpan Pengaturan Yayasan"}
        </button>
      </div>
    </form>
  );
}
