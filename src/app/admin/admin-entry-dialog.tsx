"use client";

import type { CollectionConfig } from "./fields";
import { AdminEntryForm, type FormValues } from "./admin-entry-form";

/**
 * Dialog tambah / ubah entri.
 *
 * Tombol simpan dinonaktifkan bila ada field wajib yang masih kosong, dan
 * nama field yang kurang ditampilkan sebagai petunjuk.
 */
export function EntryDialog({
  collection,
  values,
  saving,
  error,
  onChange,
  onSave,
  onClose,
}: {
  collection: CollectionConfig;
  values: FormValues;
  saving: boolean;
  error: string;
  onChange: (column: string, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const missing = collection.fields
    .filter((f) => f.required)
    .filter((f) => !(values[f.column] ?? "").trim())
    .map((f) => f.label);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 py-10">
      <div className="w-full max-w-xl rounded-lg border border-line bg-parchment">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-light text-ink">{collection.label}</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded border border-line px-2 py-1 text-xs text-muted disabled:opacity-60"
          >
            Tutup
          </button>
        </div>
        <div className="px-5 py-5">
          <AdminEntryForm
            fields={collection.fields}
            values={values}
            onChange={onChange}
            disabled={saving}
          />
          {error ? (
            <p className="mt-4 rounded-md border border-red-900/30 bg-red-50 px-3 py-2 text-sm text-red-900">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-line px-4 py-2 text-sm text-muted disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving || missing.length > 0}
            title={missing.length > 0 ? `Isi dulu: ${missing.join(", ")}` : undefined}
            className="rounded-md bg-ink px-4 py-2 text-sm text-parchment disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
