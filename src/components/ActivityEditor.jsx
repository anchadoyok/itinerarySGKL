import { useState } from "react";

const CATEGORIES = ["Transport", "Makan", "Wisata", "Shopping", "Istirahat", "Check-in/out"];
const CURRENCIES = ["IDR", "SGD", "MYR"];
const inputCls =
  "w-full rounded-xl border border-[#D9C9B5] bg-white px-3 py-2 text-sm text-[#3D2817] outline-none transition focus:border-[#A67B5B]";

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-[#8B7355]">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function ActivityEditor({ activity, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({
    time: activity?.time || "",
    name: activity?.name || "",
    category: activity?.category || "Wisata",
    detail: activity?.detail || "",
    est: activity?.est ?? 0,
    actual: activity?.actual ?? 0,
    currency: activity?.currency || "IDR",
    mapUrl: activity?.mapUrl || "",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Nama aktivitas wajib diisi");
      return;
    }
    onSave({
      ...form,
      est: Number(form.est) || 0,
      actual: Number(form.actual) || 0,
    });
  };

  return (
    <div className="space-y-3">
      <Field label="Waktu">
        <input value={form.time} onChange={(e) => update("time", e.target.value)} className={inputCls} placeholder="09:00-10:00" />
      </Field>
      <Field label="Nama aktivitas">
        <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputCls} />
      </Field>
      <Field label="Kategori">
        <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Detail">
        <textarea value={form.detail} onChange={(e) => update("detail", e.target.value)} className={inputCls} rows="3" />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <Field label="Estimasi biaya">
            <input type="number" inputMode="numeric" value={form.est} onChange={(e) => update("est", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Mata uang">
          <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputCls}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Aktual (terpakai)">
        <input type="number" inputMode="numeric" value={form.actual} onChange={(e) => update("actual", e.target.value)} className={inputCls} placeholder="Isi setelah trip" />
      </Field>
      <Field label="Link Maps (opsional)">
        <input value={form.mapUrl} onChange={(e) => update("mapUrl", e.target.value)} className={inputCls} placeholder="https://maps.app.goo.gl/..." />
      </Field>
      <div className="flex flex-wrap gap-2 pt-3">
        <button type="button" onClick={handleSave} className="flex-1 rounded-full bg-[#5C3A2E] px-4 py-2.5 text-sm font-semibold text-white">
          Simpan
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-[#D9C9B5] bg-white px-4 py-2.5 text-sm text-[#5C3A2E]">
          Batal
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Hapus aktivitas ini?")) onDelete();
            }}
            className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600"
          >
            Hapus
          </button>
        ) : null}
      </div>
    </div>
  );
}
