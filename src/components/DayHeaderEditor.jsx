import { useState } from "react";
import { Field, inputCls, btnPrimary, btnGhost } from "./formStyles";

export default function DayHeaderEditor({ day, onSave, onCancel }) {
  const [form, setForm] = useState({
    day: day.day || "",
    dayName: day.dayName || "",
    date: day.date || "",
    location: day.location || "",
    tagline: day.tagline || "",
    catatan: day.catatan || "",
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Field label="Label Hari"><input value={form.day} onChange={(e) => update("day", e.target.value)} className={inputCls} placeholder="H1" /></Field>
        <Field label="Hari"><input value={form.dayName} onChange={(e) => update("dayName", e.target.value)} className={inputCls} placeholder="Rabu" /></Field>
        <Field label="Tanggal"><input value={form.date} onChange={(e) => update("date", e.target.value)} className={inputCls} placeholder="15 Okt 2026" /></Field>
      </div>
      <Field label="Lokasi"><input value={form.location} onChange={(e) => update("location", e.target.value)} className={inputCls} /></Field>
      <Field label="Tagline"><input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputCls} /></Field>
      <Field label="Catatan khusus"><textarea value={form.catatan} onChange={(e) => update("catatan", e.target.value)} className={inputCls} rows="3" /></Field>
      <div className="flex gap-2 pt-3">
        <button type="button" onClick={() => onSave(form)} className={`flex-1 ${btnPrimary}`}>Simpan</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Batal</button>
      </div>
    </div>
  );
}
