import { useState } from "react";
import { Field, inputCls, btnPrimary, btnGhost, btnDanger } from "./formStyles";

export default function BudgetItemEditor({ row, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({
    item: row?.item || "",
    perOrang: row?.perOrang ?? 0,
    catatan: row?.catatan || "",
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.item.trim()) {
      alert("Nama item wajib diisi");
      return;
    }
    onSave({ ...form, perOrang: Number(form.perOrang) || 0 });
  };

  return (
    <div className="space-y-3">
      <Field label="Item"><input value={form.item} onChange={(e) => update("item", e.target.value)} className={inputCls} /></Field>
      <Field label="Per orang (IDR)">
        <input type="number" inputMode="numeric" value={form.perOrang} onChange={(e) => update("perOrang", e.target.value)} className={inputCls} />
      </Field>
      <Field label="Catatan"><input value={form.catatan} onChange={(e) => update("catatan", e.target.value)} className={inputCls} /></Field>
      <div className="flex flex-wrap gap-2 pt-3">
        <button type="button" onClick={handleSave} className={`flex-1 ${btnPrimary}`}>Simpan</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Batal</button>
        {onDelete ? (
          <button type="button" onClick={() => { if (window.confirm("Hapus item ini?")) onDelete(); }} className={btnDanger}>
            Hapus
          </button>
        ) : null}
      </div>
    </div>
  );
}
