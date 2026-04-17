import { useState } from "react";
import { Field, inputCls, btnPrimary, btnGhost } from "./formStyles";

export default function MetaEditor({ meta, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: meta.title || "",
    dateRange: meta.dateRange || "",
    travelers: meta.travelers || "",
    budgetTarget: meta.budgetTarget ?? 0,
    hotelSg: meta.hotels?.sg || "",
    hotelKl: meta.hotels?.kl || "",
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({
      title: form.title,
      dateRange: form.dateRange,
      travelers: form.travelers,
      budgetTarget: Number(form.budgetTarget) || 0,
      hotels: { sg: form.hotelSg, kl: form.hotelKl },
    });
  };

  return (
    <div className="space-y-3">
      <Field label="Judul"><input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} /></Field>
      <Field label="Rentang tanggal"><input value={form.dateRange} onChange={(e) => update("dateRange", e.target.value)} className={inputCls} placeholder="15–21 Oktober 2026" /></Field>
      <Field label="Peserta (deskripsi)"><input value={form.travelers} onChange={(e) => update("travelers", e.target.value)} className={inputCls} /></Field>
      <Field label="Hotel SG"><input value={form.hotelSg} onChange={(e) => update("hotelSg", e.target.value)} className={inputCls} /></Field>
      <Field label="Hotel/Apartemen KL"><input value={form.hotelKl} onChange={(e) => update("hotelKl", e.target.value)} className={inputCls} /></Field>
      <Field label="Target Budget (IDR)"><input type="number" inputMode="numeric" value={form.budgetTarget} onChange={(e) => update("budgetTarget", e.target.value)} className={inputCls} /></Field>
      <div className="flex gap-2 pt-3">
        <button type="button" onClick={handleSave} className={`flex-1 ${btnPrimary}`}>Simpan</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Batal</button>
      </div>
    </div>
  );
}
