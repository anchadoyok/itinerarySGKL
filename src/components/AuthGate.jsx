import { useAuth } from "../contexts/AuthContext";

export default function AuthGate({ children }) {
  const { user, loading, error } = useAuth();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EFE6] px-4 text-[#3D2817]">
        <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-base font-semibold text-red-600">Gagal koneksi</h1>
          <p className="mt-2 text-sm text-[#8B7355]">
            {error.message || "Tidak bisa autentikasi. Pastikan Anonymous sign-in di-enable di Firebase Console."}
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EFE6] text-[#5C3A2E]">
        <p className="text-sm">Memuat…</p>
      </div>
    );
  }

  return children;
}
