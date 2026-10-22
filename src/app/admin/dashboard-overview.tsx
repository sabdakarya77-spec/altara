"use client";

import { useEffect, useState } from "react";
import type { OverviewResponse } from "./../api/admin/overview/route";

export function DashboardOverview({
  onNavigate,
  onQuickCreate,
}: {
  onNavigate: (key: string) => void;
  onQuickCreate: (collectionKey: string) => void;
}) {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/overview", { cache: "no-store" });
        if (!res.ok) {
          setError("Gagal memuat ringkasan data.");
          return;
        }
        const json = (await res.json()) as OverviewResponse;
        setData(json);
      } catch {
        setError("Tidak dapat terhubung ke server.");
      } finally {
        setLoading(false);
      }
    }
    void fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-lg border border-line bg-parchment p-12 text-center text-sm text-muted">
        Menyiapkan ringkasan data yayasan…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-8 rounded-lg border border-red-900/30 bg-red-50 p-6 text-sm text-red-900">
        {error || "Terjadi kesalahan saat memuat overview."}
      </div>
    );
  }

  const { metrics, recentEntries, dbConnected } = data;

  const cards = [
    {
      key: "hero_slides",
      label: "Hero Slider",
      value: `${metrics.hero.published} aktif`,
      sub: `dari total ${metrics.hero.total} slide`,
      accent: "border-forest/30",
    },
    {
      key: "campaigns",
      label: "Program Donasi",
      value: `${metrics.campaigns?.published ?? 0}`,
      sub: `dari total ${metrics.campaigns?.total ?? 0} program`,
      accent: "border-forest/30",
    },
    {
      key: "programs",
      label: "Program",
      value: `${metrics.programs.published}`,
      sub: `dari total ${metrics.programs.total} program`,
      accent: "border-line",
    },
    {
      key: "stories",
      label: "Cerita Dampak",
      value: `${metrics.stories.published}`,
      sub: `dari total ${metrics.stories.total} kisah`,
      accent: "border-line",
    },
    {
      key: "journal",
      label: "Artikel Jurnal",
      value: `${metrics.journal.published}`,
      sub: `dari total ${metrics.journal.total} publikasi`,
      accent: "border-line",
    },
    {
      key: "documents",
      label: "Dokumen Publik",
      value: `${metrics.documents.published}`,
      sub: `dari total ${metrics.documents.total} berkas`,
      accent: "border-line",
    },
    {
      key: "partners",
      label: "Mitra & Pendukung",
      value: `${metrics.partners.published}`,
      sub: `dari total ${metrics.partners.total} institusi`,
      accent: "border-line",
    },
  ];

  return (
    <div className="mt-6 space-y-8">
      {/* ── Status Banner & Selamat Datang ─────────────────────────────── */}
      <div className="rounded-xl border border-line bg-parchment p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Pusat Komando Konten</p>
            <h2 className="mt-1 font-display text-2xl font-light text-ink">
              Yayasan Abdi Laksata Raya
            </h2>
            <p className="mt-1 max-w-xl text-xs text-muted">
              Kelola seluruh narasi publik, transparansi program, dan identitas yayasan dari satu tempat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block size-2.5 rounded-full ${
                dbConnected ? "bg-emerald-600" : "bg-amber-600"
              }`}
            />
            <span className="text-xs text-muted">
              {dbConnected ? "PostgreSQL Terhubung" : "Mode Cadangan Statis"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Kartu Metrik Ringkasan ─────────────────────────────────────── */}
      <div>
        <p className="eyebrow mb-3">Ringkasan Konten Aktif</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="group flex flex-col justify-between rounded-xl border border-line bg-parchment p-4 text-left transition-all hover:border-forest hover:bg-forest/5"
            >
              <div>
                <p className="text-xs text-muted group-hover:text-forest">{card.label}</p>
                <p className="mt-2 font-display text-3xl font-light text-ink">
                  {card.value}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-muted">{card.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Aksi Cepat (Quick Actions) ─────────────────────────────────── */}
      <div className="rounded-xl border border-line bg-parchment p-6">
        <p className="eyebrow">Aksi Cepat</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            onClick={() => onQuickCreate("hero_slides")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-forest hover:bg-forest/5"
          >
            <span>+ Slide Hero Baru</span>
          </button>
          <button
            onClick={() => onQuickCreate("journal")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-forest hover:bg-forest/5"
          >
            <span>+ Tulis Jurnal Baru</span>
          </button>
          <button
            onClick={() => onQuickCreate("programs")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-forest hover:bg-forest/5"
          >
            <span>+ Tambah Program</span>
          </button>
          <button
            onClick={() => onQuickCreate("stories")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-forest hover:bg-forest/5"
          >
            <span>+ Tambah Cerita Dampak</span>
          </button>
          <button
            onClick={() => onQuickCreate("documents")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-forest hover:bg-forest/5"
          >
            <span>+ Unggah Dokumen</span>
          </button>
          <button
            onClick={() => onNavigate("settings")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-ink hover:text-ink"
          >
            <span>⚙ Kelola Pengaturan Yayasan</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-ink px-3.5 py-2 text-xs font-medium text-parchment transition-colors hover:bg-forest"
          >
            <span>Buka Website Publik</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>

      {/* ── Entri Terbaru yang Diperbarui ─────────────────────────────── */}
      <div className="rounded-xl border border-line bg-parchment p-6">
        <div className="flex items-center justify-between border-b border-line/60 pb-4">
          <div>
            <h3 className="font-display text-xl font-light text-ink">Pembaruan Konten Terbaru</h3>
            <p className="mt-0.5 text-xs text-muted">
              Daftar artikel, program, dan cerita dampak yang baru diperbarui.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-line/60">
          {recentEntries.length === 0 ? (
            <p className="py-4 text-xs text-muted">Belum ada aktivitas konten.</p>
          ) : (
            recentEntries.map((item, idx) => {
              const typeLabel =
                item.type === "journal"
                  ? "Jurnal"
                  : item.type === "program"
                  ? "Program"
                  : "Cerita";
              const typeKey =
                item.type === "journal"
                  ? "journal"
                  : item.type === "program"
                  ? "programs"
                  : "stories";
              const publicUrl =
                item.type === "journal"
                  ? `/jurnal/${item.slug}`
                  : item.type === "program"
                  ? `/program/${item.slug}`
                  : `/cerita/${item.slug}`;

              return (
                <div
                  key={`${item.type}-${item.slug}-${idx}`}
                  className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-line/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted font-medium">
                        {typeLabel}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          item.published ? "bg-forest/10 text-forest" : "bg-gold/20 text-muted"
                        }`}
                      >
                        {item.published ? "Terbit" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-ink">{item.title}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() => onNavigate(typeKey)}
                      className="rounded border border-line bg-white px-2.5 py-1 text-xs text-muted hover:border-forest hover:text-ink"
                    >
                      Buka Koleksi
                    </button>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted hover:text-forest"
                    >
                      <span>Lihat di Web</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
