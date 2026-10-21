"use client";

import { useRef, useState } from "react";
import type { Field } from "./fields";

/**
 * Kolom gambar: pratinjau, tombol unggah, dan pembersihan.
 * Upload memakai `fetch` + FormData lalu URL hasilnya disimpan di kolom gambar.
 */
export function ImageField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Gagal mengunggah gambar.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label htmlFor={`field-${field.column}`} className="eyebrow">
        {field.label}
      </label>
      {value ? (
        <div className="mt-2 flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-20 w-28 rounded-md border border-line object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{value}</p>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="mt-2 rounded border border-line px-2 py-1 text-xs text-red-800 disabled:opacity-60"
            >
              Hapus gambar
            </button>
          </div>
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={`field-${field.column}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="text-xs text-muted file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:text-parchment"
        />
        {uploading ? <span className="text-xs text-muted">Mengunggah…</span> : null}
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-800">{error}</p> : null}
      {field.hint ? <p className="mt-1.5 text-xs text-muted">{field.hint}</p> : null}
    </div>
  );
}
