export const inputCls =
  "w-full rounded-xl border border-[#D9C9B5] bg-white px-3 py-2 text-sm text-[#3D2817] outline-none transition focus:border-[#A67B5B]";

export const btnPrimary =
  "rounded-full bg-[#5C3A2E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3D2817]";

export const btnGhost =
  "rounded-full border border-[#D9C9B5] bg-white px-4 py-2.5 text-sm text-[#5C3A2E]";

export const btnDanger =
  "rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600";

export function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#8B7355]">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
