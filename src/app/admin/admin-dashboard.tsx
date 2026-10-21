"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { COLLECTIONS, type CollectionConfig } from "./fields";
import { emptyValues, toPayload, valuesFromRow, type FormValues } from "./admin-entry-form";
import { EntryTable, type Row } from "./admin-entry-table";
import { EntryDialog } from "./admin-entry-dialog";
import { SettingsView } from "./settings-view";

/**
 * Panel admin ALTARA.
 *
 * Semua operasi melewati `/api/admin/*` yang memvalidasi session di server.
 * UI ini hanya menampilkan status; otorisasi tidak pernah bergantung pada
 * kode sisi klien.
 */

type Modal =
  | { mode: "create"; collection: CollectionConfig }
  | { mode: "edit"; collection: CollectionConfig; row: Row }
  | null;

export default function AdminDashboard() {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState(COLLECTIONS[0].key);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [values, setValues] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  const active = useMemo(
    () => COLLECTIONS.find((c) => c.key === activeKey) ?? COLLECTIONS[0],
    [activeKey]
  );

  const load = useCallback(async (key: string) => {
    setLoading(true);
    setLoadError("");

    if (key === "settings") {
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/${key}`, { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        rows?: Row[];
        error?: string;
      };
      if (!res.ok) {
        setLoadError(data.error ?? "Gagal memuat data.");
        setRows([]);
        return;
      }
      setRows(data.rows ?? []);
    } catch {
      setLoadError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load(activeKey);
  }, [activeKey, load]);

  function openCreate() {
    setValues(emptyValues(active.fields));
    setSaveError("");
    setModal({ mode: "create", collection: active });
  }

  function openEdit(row: Row) {
    setValues(valuesFromRow(row, active.fields));
    setSaveError("");
    setModal({ mode: "edit", collection: active, row });
  }

  async function save() {
    if (!modal) return;
    setSaving(true);
    setSaveError("");
    try {
      const payload = toPayload(values, modal.collection.fields) as Record<string, unknown>;
      if (modal.mode === "edit") payload.id = modal.row.id;

      const res = await fetch(`/api/admin/${modal.collection.key}`, {
        method: modal.mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSaveError(data.error ?? "Gagal menyimpan.");
        return;
      }
      setModal(null);
      setNotice("Tersimpan. Situs publik sudah diperbarui.");
      await load(modal.collection.key);
    } catch {
      setSaveError("Tidak dapat menghubungi server.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(row: Row) {
    setNotice("");
    const res = await fetch(`/api/admin/${active.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, published: !row.published }),
    });
    if (!res.ok) {
      setNotice("Gagal mengubah status terbit.");
      return;
    }
    await load(active.key);
  }

  async function remove(row: Row) {
    if (!confirm("Hapus entri ini? Tindakan tidak dapat dibatalkan.")) return;
    setNotice("");
    const res = await fetch(`/api/admin/${active.key}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    if (!res.ok) {
      setNotice("Gagal menghapus entri.");
      return;
    }
    setNotice("Entri dihapus.");
    await load(active.key);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const tableFields = active.fields.filter((f) => f.inTable);

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-parchment md:flex">
        <div className="border-b border-line px-5 py-5">
          <Image
            src="/assets/logo-emblem.png"
            alt="Lambang Yayasan Abdi Laksata Raya"
            width={583}
            height={640}
            sizes="40px"
            className="h-10 w-auto object-contain object-left"
          />
          <p className="mt-3 text-sm font-medium text-ink">Panel Admin</p>
          <p className="eyebrow mt-1 leading-relaxed">Abdi Laksata Raya</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {COLLECTIONS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveKey(item.key)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeKey === item.key
                  ? "bg-ink font-medium text-parchment"
                  : "text-muted hover:bg-forest/10 hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-line px-3 py-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:text-ink"
          >
            Lihat Situs →
          </a>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted hover:text-ink"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-parchment px-4 py-3 md:px-6">
          <p className="eyebrow">Pengelolaan konten — {active.label}</p>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">Administrator</span>
            <button
              onClick={logout}
              className="rounded border border-line px-2 py-1 text-xs text-muted md:hidden"
            >
              Keluar
            </button>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-light text-ink">{active.label}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                {activeKey === "settings"
                  ? "Kelola identitas kontak yayasan, nomor rekening donasi resmi, dan media sosial resmi."
                  : "Perubahan tersimpan langsung di Postgres dan tampil di situs publik."}
              </p>
            </div>
            {activeKey !== "settings" ? (
              <button
                onClick={openCreate}
                className="rounded-md bg-ink px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest"
              >
                + Tambah
              </button>
            ) : null}
          </div>

          {notice ? (
            <p className="mt-4 rounded-md border border-line bg-parchment px-4 py-2.5 text-sm text-ink">
              {notice}
            </p>
          ) : null}
          {loadError ? (
            <p className="mt-4 rounded-md border border-red-900/30 bg-red-50 px-4 py-2.5 text-sm text-red-900">
              {loadError}
            </p>
          ) : null}

          {activeKey === "settings" ? (
            <SettingsView />
          ) : (
            <EntryTable
              fields={tableFields}
              rows={rows}
              loading={loading}
              onEdit={openEdit}
              onTogglePublished={togglePublished}
              onRemove={remove}
            />
          )}
        </main>
      </div>

      {modal ? (
        <EntryDialog
          collection={modal.collection}
          values={values}
          saving={saving}
          error={saveError}
          onChange={(column, value) =>
            setValues((prev) => ({ ...prev, [column]: value }))
          }
          onSave={save}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
