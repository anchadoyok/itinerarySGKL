import { useState } from "react";
import { Field, inputCls, btnPrimary, btnGhost, btnDanger } from "./formStyles";

export default function ChecklistItemEditor({ item, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({
    text: item?.text || "",
    critical: !!item?.critical,
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.text.trim()) {
      alert("Teks wajib diisi");
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-3">
      <Field label="Item"><input value={form.text} onChange={(e) => update("text", e.target.value)} className={inputCls} /></Field>
      <label className="flex items-center gap-2 text-sm text-[#5C3A2E]">
        <input type="checkbox" checked={form.critical} onChange={(e) => update("critical", e.target.checked)} />
        Tandai sebagai CRITICAL
      </label>
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
