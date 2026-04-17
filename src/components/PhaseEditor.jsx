import { useState } from "react";
import { Field, inputCls, btnPrimary, btnGhost, btnDanger } from "./formStyles";

export default function PhaseEditor({ name, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({ name: name || "" });

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Nama fase wajib diisi");
      return;
    }
    onSave(form.name.trim());
  };

  return (
    <div className="space-y-3">
      <Field label="Nama fase">
        <input value={form.name} onChange={(e) => setForm({ name: e.target.value })} className={inputCls} placeholder="Misal: 1 Bulan Sebelum" />
      </Field>
      <div className="flex flex-wrap gap-2 pt-3">
        <button type="button" onClick={handleSave} className={`flex-1 ${btnPrimary}`}>Simpan</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Batal</button>
        {onDelete ? (
          <button type="button" onClick={() => { if (window.confirm("Hapus fase beserta semua item-nya?")) onDelete(); }} className={btnDanger}>
            Hapus
          </button>
        ) : null}
      </div>
    </div>
  );
}
