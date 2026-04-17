import { useState } from "react";

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

export default function ParticipantEditor({ participant, onSave, onCancel }) {
  const [form, setForm] = useState({
    nama: participant.nama || "",
    relasi: participant.relasi || "",
    usia: participant.usia ?? 0,
    gender: participant.gender || "L",
    kamar: participant.kamar || "K1",
    pasporReady: !!participant.pasporReady,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.nama.trim()) {
      alert("Nama wajib diisi");
      return;
    }
    onSave({ ...form, usia: Number(form.usia) || 0 });
  };

  return (
    <div className="space-y-3">
      <Field label="Nama"><input value={form.nama} onChange={(e) => update("nama", e.target.value)} className={inputCls} /></Field>
      <Field label="Relasi"><input value={form.relasi} onChange={(e) => update("relasi", e.target.value)} className={inputCls} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Usia">
          <input type="number" inputMode="numeric" value={form.usia} onChange={(e) => update("usia", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Gender">
          <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inputCls}>
            <option value="L">L</option>
            <option value="P">P</option>
          </select>
        </Field>
      </div>
      <Field label="Kamar">
        <input value={form.kamar} onChange={(e) => update("kamar", e.target.value)} className={inputCls} placeholder="K1" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-[#5C3A2E]">
        <input type="checkbox" checked={form.pasporReady} onChange={(e) => update("pasporReady", e.target.checked)} />
        Paspor sudah ready
      </label>
      <div className="flex gap-2 pt-3">
        <button type="button" onClick={handleSave} className="flex-1 rounded-full bg-[#5C3A2E] px-4 py-2.5 text-sm font-semibold text-white">
          Simpan
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-[#D9C9B5] bg-white px-4 py-2.5 text-sm text-[#5C3A2E]">
          Batal
        </button>
      </div>
    </div>
  );
}
