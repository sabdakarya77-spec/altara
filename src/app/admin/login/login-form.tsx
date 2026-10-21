"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

/**
 * Form login admin (Fase 2).
 * Kirim password ke `/api/admin/login`, lalu arahkan kembali ke panel.
 * Pesan error sengaja generik agar tidak membocorkan apakah session sudah ada.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") ?? "";
  // Izinkan hanya path internal: harus diawali "/" dan tidak "//" (protocol-relative URL).
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(nextPath);
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Gagal masuk.");
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/assets/logo-emblem.png"
            alt="Lambang Yayasan Abdi Laksata Raya"
            width={583}
            height={640}
            sizes="64px"
            className="h-14 w-auto object-contain"
            priority
          />
          <p className="eyebrow mt-6">Panel Admin</p>
          <h1 className="mt-3 font-display text-3xl font-light text-ink">
            Masuk untuk mengelola konten
          </h1>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <div>
            <label htmlFor="password" className="eyebrow">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              autoFocus
              className="mt-2 w-full rounded-md border border-line bg-parchment px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-forest"
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs text-red-800">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm text-parchment transition-opacity disabled:opacity-60"
          >
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted">
          <a href="/" className="hover:text-ink">
            ← Kembali ke situs
          </a>
        </p>
      </div>
    </main>
  );
}
