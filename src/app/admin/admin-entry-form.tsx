"use client";

import type { Field } from "./fields";
import { toDateInput } from "./fields";
import { ImageField } from "./admin-image-field";

/**
 * Form satu entri. Digunakan untuk tambah maupun ubah.
 *
 * Nilai disimpan dalam bentuk string (sesuai input HTML) lalu dikonversi
 * ke tipe database saat dikirim. Foto diunggah terpisah lewat
 * `/api/admin/upload` dan URL hasilnya disimpan di kolom gambar.
 */

export type FormValues = Record<string, string>;

export function valuesFromRow(row: Record<string, unknown>, fields: Field[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const raw = row[field.column];
    if (field.type === "boolean") {
      values[field.column] = raw ? "1" : "";
    } else if (field.type === "date") {
      values[field.column] = toDateInput(raw);
    } else {
      values[field.column] = raw === null || raw === undefined ? "" : String(raw);
    }
  }
  return values;
}

export function emptyValues(fields: Field[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    if (field.type === "select" && field.options && field.options.length > 0) {
      values[field.column] = field.options[0];
    } else {
      values[field.column] = "";
    }
  }
  return values;
}

/** Ubah nilai form menjadi payload yang sesuai tipe kolom database. */
export function toPayload(values: FormValues, fields: Field[]): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.readOnly) continue;
    const value = values[field.column] ?? "";
    if (field.type === "boolean") {
      payload[field.column] = value === "1";
    } else if (field.type === "number") {
      payload[field.column] = value === "" ? 0 : Number(value);
    } else if (field.type === "date") {
      payload[field.column] = value === "" ? null : new Date(value).toISOString();
    } else {
      payload[field.column] = value;
    }
  }
  return payload;
}

export function AdminEntryForm({
  fields,
  values,
  onChange,
  disabled,
}: {
  fields: Field[];
  values: FormValues;
  onChange: (column: string, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FieldInput
          key={field.column}
          field={field}
          value={values[field.column] ?? ""}
          onChange={(v) => onChange(field.column, v)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function FieldInput({
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
  const inputClass =
    "mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest disabled:opacity-60";

  if (field.readOnly) {
    let displayVal = value;
    if (field.type === "boolean") {
      displayVal = value === "1" ? "Ya" : "Tidak";
    } else if (field.type === "number" && (field.column.includes("amount") || field.column === "amount")) {
      const num = Number(value || 0);
      displayVal = `Rp ${num.toLocaleString("id-ID")}`;
    }

    return (
      <div>
        <label htmlFor={`field-${field.column}`} className="eyebrow">
          {field.label}
        </label>
        <input
          id={`field-${field.column}`}
          type="text"
          value={displayVal}
          readOnly
          disabled
          className={`${inputClass} bg-stone-100/80 text-muted cursor-not-allowed`}
        />
        {field.hint ? <p className="mt-1.5 text-xs text-muted">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={value === "1"}
          onChange={(e) => onChange(e.target.checked ? "1" : "")}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 accent-forest"
        />
        <span>
          {field.label}
          {field.hint ? (
            <span className="mt-1 block text-xs text-muted">{field.hint}</span>
          ) : null}
        </span>
      </label>
    );
  }

  if (field.type === "image") {
    return <ImageField field={field} value={value} onChange={onChange} disabled={disabled} />;
  }

  return (
    <div>
      <label htmlFor={`field-${field.column}`} className="eyebrow">
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={`field-${field.column}`}
          value={value}
          rows={field.rows ?? 4}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      ) : field.type === "select" ? (
        <select
          id={`field-${field.column}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`field-${field.column}`}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      )}
      {field.hint ? <p className="mt-1.5 text-xs text-muted">{field.hint}</p> : null}
    </div>
  );
}
