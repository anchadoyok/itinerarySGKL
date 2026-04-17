import { useAuth } from "../contexts/AuthContext";

export default function AuthGate({ children }) {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EFE6] text-[#5C3A2E]">
        <p className="text-sm">Memuat…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EFE6] px-4 text-[#3D2817]">
        <div className="w-full max-w-sm rounded-3xl border border-[#E5D9C8] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Itinerary SG & KL</h1>
          <p className="mt-2 text-sm text-[#8B7355]">
            Login untuk melihat & mengedit itinerary keluarga.
          </p>
          <button
            type="button"
            onClick={login}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5C3A2E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3D2817]"
          >
            Login dengan Google
          </button>
        </div>
      </div>
    );
  }

  return children;
}
