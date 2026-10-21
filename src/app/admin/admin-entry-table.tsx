"use client";

import type { Field } from "./fields";

export type Row = Record<string, unknown> & { id: number };

/**
 * Tabel daftar entri untuk satu koleksi.
 * Kolom yang ditampilkan ditentukan oleh `inTable` pada definisi field.
 */
export function EntryTable({
  collectionKey,
  fields,
  rows,
  loading,
  onEdit,
  onTogglePublished,
  onRemove,
}: {
  collectionKey?: string;
  fields: Field[];
  rows: Row[];
  loading: boolean;
  onEdit: (row: Row) => void;
  onTogglePublished: (row: Row) => void;
  onRemove: (row: Row) => void;
}) {
  function getPreviewUrl(row: Row): string | null {
    if (!collectionKey) return null;
    if (collectionKey === "programs" && row.slug) return `/program/${row.slug}`;
    if (collectionKey === "stories" && row.slug) return `/cerita/${row.slug}`;
    if (collectionKey === "journal" && row.slug) return `/jurnal/${row.slug}`;
    if (collectionKey === "hero_slides") return "/";
    if (collectionKey === "stats") return "/#dampak";
    if (collectionKey === "documents") {
      return typeof row.file_url === "string" && row.file_url ? row.file_url : "/#transparansi";
    }
    if (collectionKey === "partners") return "/#";
    return null;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-parchment">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            {fields.map((field) => (
              <th key={field.column} className="px-4 py-3 font-medium">
                {field.label}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={fields.length + 1} className="px-4 py-8 text-center text-muted">
                Memuat…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={fields.length + 1} className="px-4 py-8 text-center text-muted">
                Belum ada data. Klik “+ Tambah” untuk membuat entri pertama.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const previewUrl = getPreviewUrl(row);

              return (
                <tr key={row.id} className="border-b border-line/60 last:border-0">
                  {fields.map((field) => (
                    <td key={field.column} className="px-4 py-3 text-ink">
                      <CellValue field={field} row={row} />
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {previewUrl ? (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Lihat di Web"
                        className="mr-2 inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-forest hover:text-ink"
                      >
                        <span>Lihat</span>
                        <span className="text-[10px]">↗</span>
                      </a>
                    ) : null}
                    <button
                      onClick={() => onEdit(row)}
                      className="mr-2 rounded border border-line px-2 py-1 text-xs transition-colors hover:border-ink hover:text-ink"
                    >
                      Ubah
                    </button>
                    {"published" in row ? (
                      <button
                        onClick={() => onTogglePublished(row)}
                        className="mr-2 rounded border border-line px-2 py-1 text-xs transition-colors hover:border-ink"
                      >
                        {row.published ? "Draft" : "Terbit"}
                      </button>
                    ) : null}
                    <button
                      onClick={() => onRemove(row)}
                      className="rounded border border-line px-2 py-1 text-xs text-red-800 transition-colors hover:border-red-900/40 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Render nilai sel sesuai tipe kolom. */
function CellValue({ field, row }: { field: Field; row: Row }) {
  const raw = row[field.column];

  if (field.type === "boolean") {
    return (
      <span
        className={`rounded-full px-2 py-1 text-[11px] ${
          raw ? "bg-forest/10 text-forest" : "bg-gold/20 text-muted"
        }`}
      >
        {raw ? "Terbit" : "Draft"}
      </span>
    );
  }

  if (field.type === "image") {
    if (!raw) return <span className="text-muted">—</span>;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={String(raw)}
        alt=""
        className="h-10 w-14 rounded border border-line object-cover"
      />
    );
  }

  if (field.type === "date") {
    return raw ? (
      <span className="text-muted">{String(raw).slice(0, 10)}</span>
    ) : (
      <span className="text-muted">—</span>
    );
  }

  const text = raw === null || raw === undefined ? "" : String(raw);
  if (!text) return <span className="text-muted">—</span>;
  return <span className="line-clamp-2 max-w-xs">{text}</span>;
}
