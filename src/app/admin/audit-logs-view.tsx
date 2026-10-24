"use client";

import { useEffect, useState } from "react";
import type { AuditLogRow } from "@/app/api/admin/audit-logs/route";

function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(d) + " WIB";
  } catch {
    return isoStr;
  }
}

function getActionBadge(action: string) {
  switch (action) {
    case "AUTH_LOGIN":
      return <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">LOGIN</span>;
    case "AUTH_LOGIN_FAILED":
      return <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 text-xs font-semibold">LOGIN GAGAL</span>;
    case "AUTH_LOGOUT":
      return <span className="rounded bg-gray-200 text-gray-800 px-2 py-0.5 text-xs font-semibold">LOGOUT</span>;
    case "DONATION_STATUS_UPDATE":
      return <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-semibold">STATUS DONASI</span>;
    case "SETTINGS_UPDATE":
      return <span className="rounded bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-semibold">PENGATURAN</span>;
    case "ENTRY_CREATE":
      return <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-semibold">+ BUAT ENTRI</span>;
    case "ENTRY_UPDATE":
      return <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-semibold">UBAH ENTRI</span>;
    case "ENTRY_DELETE":
      return <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-xs font-semibold">HAPUS ENTRI</span>;
    default:
      return <span className="rounded bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-semibold">{action}</span>;
  }
}

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/audit-logs", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil log audit");
      const data = (await res.json()) as { rows?: AuditLogRow[] };
      setLogs(data.rows ?? []);
    } catch (err) {
      setError((err as Error).message || "Terjadi kendala saat memuat catatan audit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Menampilkan hingga 100 rekaman audit trail dan forensik aktivitas terbaru.
        </p>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="rounded border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-forest/10 transition-colors disabled:opacity-50"
        >
          {loading ? "Menyegarkan..." : "🔄 Segarkan Log"}
        </button>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-line bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-parchment/70 text-[11px] font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Waktu (WIB)</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Entitas / ID</th>
                <th className="px-4 py-3">IP Aktor</th>
                <th className="px-4 py-3">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    Memuat catatan audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">
                    Belum ada riwayat aktivitas yang tercatat di database.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-ink/80">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                      <span className="capitalize">{log.entity_type}</span>
                      {log.entity_id ? (
                        <span className="ml-1.5 font-mono text-[11px] text-muted">
                          #{log.entity_id}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted">
                      {log.actor_ip || "127.0.0.1"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <pre className="max-w-md overflow-x-auto rounded bg-ivory/80 p-1.5 font-mono text-[10px] text-ink/90 whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 1)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
