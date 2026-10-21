import { Suspense } from "react";
import AdminLoginForm from "./login-form";

/**
 * Halaman login admin (Fase 2).
 *
 * Server component: `useSearchParams` dipakai di komponen client di bawah,
 * jadi halaman ini dibungkus Suspense agar Next.js bisa mem-build-nya.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <AdminLoginForm />
    </Suspense>
  );
}

function LoginShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <p className="text-sm text-muted">Memuat…</p>
    </main>
  );
}
