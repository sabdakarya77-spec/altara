import AdminDashboard from "./admin-dashboard";

/**
 * Halaman panel admin (Fase 2).
 *
 * Halaman ini hanya merender shell; proteksi akses ditangani middleware
 * (kehadiran cookie) dan divalidasi penuh di setiap endpoint API.
 */
export default function AdminPage() {
  return <AdminDashboard />;
}
