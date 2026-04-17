import { useState } from "react";
import { Field, inputCls, btnPrimary, btnGhost } from "./formStyles";

export default function BudgetSummaryEditor({ summary, onSave, onCancel }) {
  const [form, setForm] = useState({
    sgPerOrang: summary?.sgPerOrang ?? 0,
    klPerOrang: summary?.klPerOrang ?? 0,
    totalPerOrang: summary?.totalPerOrang ?? 0,
    totalSixPeople: summary?.totalSixPeople ?? 0,
    target: summary?.target ?? 0,
    flatDEF: summary?.flatDEF ?? 0,
    abcShare: summary?.abcShare ?? 0,
  });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSave = () => {
    const out = {};
    for (const [k, v] of Object.entries(form)) out[k] = Number(v) || 0;
    onSave(out);
  };

  const fields = [
    ["sgPerOrang", "SG per orang"],
    ["klPerOrang", "KL per orang"],
    ["totalPerOrang", "Total per orang"],
    ["totalSixPeople", "Total semua orang"],
    ["target", "Target"],
    ["flatDEF", "Flat D/E/F per orang"],
    ["abcShare", "Share A/B/C per orang"],
  ];

  return (
    <div className="space-y-3">
      {fields.map(([k, label]) => (
        <Field key={k} label={label}>
          <input type="number" inputMode="numeric" value={form[k]} onChange={(e) => update(k, e.target.value)} className={inputCls} />
        </Field>
      ))}
      <div className="flex gap-2 pt-3">
        <button type="button" onClick={handleSave} className={`flex-1 ${btnPrimary}`}>Simpan</button>
        <button type="button" onClick={onCancel} className={btnGhost}>Batal</button>
      </div>
    </div>
  );
}
