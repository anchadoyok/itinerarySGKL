import { useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Coins,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Settings2,
  Share2,
  Users,
  Wallet,
} from "lucide-react";
import { useItinerary } from "./hooks/useItinerary";
import { DEFAULT_RATES } from "./data/seed";
import Modal from "./components/Modal";
import ActivityEditor from "./components/ActivityEditor";
import ParticipantEditor from "./components/ParticipantEditor";
import MetaEditor from "./components/MetaEditor";
import DayHeaderEditor from "./components/DayHeaderEditor";
import ChecklistItemEditor from "./components/ChecklistItemEditor";
import PhaseEditor from "./components/PhaseEditor";
import BudgetItemEditor from "./components/BudgetItemEditor";
import BudgetSummaryEditor from "./components/BudgetSummaryEditor";

const CATEGORY_STYLES = {
  Transport: "bg-gray-100 text-gray-700",
  Makan: "bg-yellow-100 text-yellow-800",
  Wisata: "bg-green-100 text-green-800",
  Shopping: "bg-pink-100 text-pink-800",
  Istirahat: "bg-blue-100 text-blue-800",
  "Check-in/out": "bg-teal-100 text-teal-800",
};
const TABS = [
  { id: "itinerary", label: "Itinerary", icon: CalendarDays },
  { id: "peserta", label: "Peserta", icon: Users },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "setting", label: "Setting", icon: Settings2 },
];

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6,
  agu: 7, agt: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11,
};

function parseDate(text) {
  if (!text) return null;
  const m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTH_MAP[m[2].slice(0, 3).toLowerCase()];
  const year = Number(m[3]);
  if (month === undefined) return null;
  return new Date(year, month, day);
}

function isElapsed(dateText) {
  const d = parseDate(dateText);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}
function formatNumber(value) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value || 0);
}
function formatActivityCost(value, currency) {
  if (!value) return currency === "IDR" ? "Rp 0" : currency === "SGD" ? "SGD 0" : "RM 0";
  if (currency === "IDR") return `Rp ${formatNumber(value)}`;
  if (currency === "SGD") return `SGD ${formatNumber(value)}`;
  return `RM ${formatNumber(value)}`;
}
function convertToIdr(amount, currency, rates) {
  if (!amount) return 0;
  if (currency === "SGD") return amount * (rates.sgdToIdr || 0);
  if (currency === "MYR") return amount * (rates.myrToIdr || 0);
  return amount;
}
function vibrateLight() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(10);
}

export default function SGKLItineraryApp() {
  const itin = useItinerary();
  const {
    data: ITINERARY,
    appState,
    setAppState,
    loading,
    exists,
    seed,
    updateMeta,
    updateDay,
    updateActivity,
    addActivity,
    deleteActivity,
    updateParticipant,
    updateChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    renamePhase,
    addPhase,
    deletePhase,
    updateBudgetItem,
    addBudgetItem,
    deleteBudgetItem,
    updateBudgetSummary,
  } = itin;
  const [activeTab, setActiveTab] = useState("itinerary");
  const [dayFilter, setDayFilter] = useState("Semua");
  const [shareReady] = useState(typeof navigator !== "undefined" && typeof navigator.share === "function");
  const [seeding, setSeeding] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // modal states
  const [activityEditor, setActivityEditor] = useState(null);
  const [participantEditor, setParticipantEditor] = useState(null);
  const [metaEditorOpen, setMetaEditorOpen] = useState(false);
  const [dayEditor, setDayEditor] = useState(null); // { dayIndex, day }
  const [checklistEditor, setChecklistEditor] = useState(null); // { phase, item, isNew }
  const [phaseEditor, setPhaseEditor] = useState(null); // { name, isNew }
  const [budgetEditor, setBudgetEditor] = useState(null); // { section, index, row, isNew }
  const [summaryEditorOpen, setSummaryEditorOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EFE6] text-[#5C3A2E]">
        <p className="text-sm">Memuat data…</p>
      </div>
    );
  }

  if (!exists || !ITINERARY) {
    const handleSeed = async () => {
      setSeeding(true);
      try {
        await seed();
      } catch (err) {
        alert("Gagal seed data: " + err.message);
      } finally {
        setSeeding(false);
      }
    };
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5EFE6] px-4 text-[#3D2817]">
        <div className="w-full max-w-sm rounded-3xl border border-[#E5D9C8] bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold">Database masih kosong</h1>
          <p className="mt-2 text-sm text-[#8B7355]">
            Klik di bawah untuk mengisi itinerary awal (template SG-KL Okt 2026). Cuma sekali.
          </p>
          <button type="button" onClick={handleSeed} disabled={seeding}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5C3A2E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3D2817] disabled:opacity-50">
            {seeding ? "Mengisi…" : "Isi data awal"}
          </button>
        </div>
      </div>
    );
  }

  const allActivities = ITINERARY.days.flatMap((day) => day.activities);
  const allChecklistItems = Object.values(ITINERARY.checklist).flat();
  const checkedActivityCount = allActivities.filter((a) => appState.checkedActivities[a.id]).length;
  const totalActivityCount = allActivities.length;
  const totalActualIdr = allActivities.reduce((t, a) => t + convertToIdr(a.actual || 0, a.currency, appState.rates), 0);
  const unfinishedEstimateIdr = allActivities.reduce(
    (t, a) => (appState.checkedActivities[a.id] ? t : t + convertToIdr(a.est, a.currency, appState.rates)),
    0
  );
  const roomMap = ITINERARY.peserta.reduce((result, person) => {
    if (!result[person.kamar]) result[person.kamar] = [];
    result[person.kamar].push(person);
    return result;
  }, {});

  const hideElapsed = !!appState.hideElapsedDays;
  const filteredDays = ITINERARY.days.filter((d) => !hideElapsed || !isElapsed(d.date));
  const visibleDays = dayFilter === "Semua" ? filteredDays : filteredDays.filter((day) => day.day === dayFilter);
  const tripDurationDays = ITINERARY.days.filter((day) => /^H\d+$/.test(day.day)).length;
  const checklistDone = allChecklistItems.filter((item) => appState.checkedChecklist[item.id]).length;

  const toggleActivity = (activityId) => {
    vibrateLight();
    setAppState((prev) => ({ ...prev, checkedActivities: { ...prev.checkedActivities, [activityId]: !prev.checkedActivities[activityId] } }));
  };
  const toggleChecklist = (itemId) => {
    vibrateLight();
    setAppState((prev) => ({ ...prev, checkedChecklist: { ...prev.checkedChecklist, [itemId]: !prev.checkedChecklist[itemId] } }));
  };
  const handleRateChange = (key, value) => {
    const numericValue = Number(String(value).replace(/[^\d]/g, ""));
    setAppState((prev) => ({ ...prev, rates: { ...prev.rates, [key]: Number.isNaN(numericValue) ? 0 : numericValue } }));
  };
  const toggleHideElapsed = () => {
    setAppState((prev) => ({ ...prev, hideElapsedDays: !prev.hideElapsedDays }));
  };
  const handleDayFilter = (value) => {
    setDayFilter(value);
    if (typeof window === "undefined") return;
    const targetId = value === "Semua" ? "itinerary-top" : `day-card-${value}`;
    window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const handleReset = () => {
    if (!window.confirm("Reset semua progres itinerary dan checklist?")) return;
    setAppState((prev) => ({ ...prev, checkedActivities: {}, checkedChecklist: {} }));
  };
  const handleShare = async () => {
    if (!shareReady) return;
    try {
      await navigator.share({ title: ITINERARY.meta.title, text: "Itinerary keluarga", url: window.location.href });
    } catch { /* dismissed */ }
  };

  // ----- handlers for editors -----
  const handleSaveActivity = async (form) => {
    const { dayIndex, activityIndex, isNew } = activityEditor;
    try {
      if (isNew) await addActivity(dayIndex, form);
      else await updateActivity(dayIndex, activityIndex, form);
      setActivityEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleDeleteActivity = async () => {
    try {
      await deleteActivity(activityEditor.dayIndex, activityEditor.activityIndex);
      setActivityEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSaveParticipant = async (form) => {
    try {
      await updateParticipant(participantEditor.index, form);
      setParticipantEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSaveMeta = async (form) => {
    try { await updateMeta(form); setMetaEditorOpen(false); }
    catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSaveDay = async (form) => {
    try {
      await updateDay(dayEditor.dayIndex, form);
      setDayEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSaveChecklistItem = async (form) => {
    const { phase, item, isNew } = checklistEditor;
    try {
      if (isNew) await addChecklistItem(phase, form);
      else await updateChecklistItem(phase, item.id, form);
      setChecklistEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleDeleteChecklistItem = async () => {
    try {
      await deleteChecklistItem(checklistEditor.phase, checklistEditor.item.id);
      setChecklistEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSavePhase = async (newName) => {
    const { name, isNew } = phaseEditor;
    try {
      if (isNew) await addPhase(newName);
      else await renamePhase(name, newName);
      setPhaseEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleDeletePhase = async () => {
    try { await deletePhase(phaseEditor.name); setPhaseEditor(null); }
    catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSaveBudgetItem = async (form) => {
    const { section, index, isNew } = budgetEditor;
    try {
      if (isNew) await addBudgetItem(section, form);
      else await updateBudgetItem(section, index, form);
      setBudgetEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleDeleteBudgetItem = async () => {
    try {
      await deleteBudgetItem(budgetEditor.section, budgetEditor.index);
      setBudgetEditor(null);
    } catch (err) { alert("Gagal: " + err.message); }
  };
  const handleSaveSummary = async (form) => {
    try { await updateBudgetSummary(form); setSummaryEditorOpen(false); }
    catch (err) { alert("Gagal: " + err.message); }
  };

  // ----- renderers -----
  const renderItineraryTab = () => (
    <section className="space-y-4" id="itinerary-top">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {["Semua", ...filteredDays.map((day) => day.day)].map((pill) => (
          <button key={pill} type="button" onClick={() => handleDayFilter(pill)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition duration-200 ${
              dayFilter === pill ? "border-[#5C3A2E] bg-[#5C3A2E] text-white" : "border-[#E5D9C8] bg-[#FFF8DC] text-[#5C3A2E]"
            }`}>
            {pill}
          </button>
        ))}
      </div>
      {hideElapsed && filteredDays.length < ITINERARY.days.length ? (
        <p className="text-xs text-[#8B7355]">
          {ITINERARY.days.length - filteredDays.length} hari yang sudah lewat disembunyikan. Bisa diubah di Setting.
        </p>
      ) : null}
      <div className="space-y-4">
        {visibleDays.map((day) => {
          const dayIndex = ITINERARY.days.findIndex((d) => d.id === day.id);
          return (
            <article key={day.id} id={`day-card-${day.day}`} className="overflow-hidden rounded-2xl border border-[#E5D9C8] bg-white shadow-sm">
              <div
                onClick={() => editMode && setDayEditor({ dayIndex, day })}
                className={`flex items-start justify-between gap-3 bg-[#5C3A2E] px-4 py-3 text-white ${editMode ? "cursor-pointer" : ""}`}
              >
                <h3 className="text-base font-semibold">{day.day} · {day.dayName}, {day.date}</h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{day.location}</span>
                  {editMode ? <Pencil className="h-3.5 w-3.5" /> : null}
                </div>
              </div>
              <div className="border-b border-[#F0E7DA] bg-[#FFF8DC] px-4 py-3 text-sm text-[#5C3A2E]">
                <span className="mr-2">💡</span>{day.tagline}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] table-fixed">
                  <thead className="bg-[#FBF6EF] text-left text-xs uppercase tracking-wide text-[#8B7355]">
                    <tr>
                      <th className="w-12 px-3 py-3">✓</th>
                      <th className="w-28 px-3 py-3">Waktu</th>
                      <th className="w-44 px-3 py-3">Aktivitas</th>
                      <th className="px-3 py-3">Detail</th>
                      <th className="w-28 px-3 py-3">Est. / Aktual</th>
                      {editMode ? <th className="w-12 px-3 py-3"></th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {day.activities.map((activity, activityIndex) => {
                      const isChecked = Boolean(appState.checkedActivities[activity.id]);
                      const handleRowClick = () => {
                        if (editMode) {
                          setActivityEditor({ dayIndex, activityIndex, activity, isNew: false });
                        } else {
                          toggleActivity(activity.id);
                        }
                      };
                      return (
                        <tr key={activity.id} onClick={handleRowClick}
                          className={`cursor-pointer border-t border-[#F3ECE1] align-top transition duration-200 ${
                            isChecked && !editMode ? "opacity-50 line-through" : "hover:bg-[#FCF8F1]"
                          }`}>
                          <td className="px-3 py-3">
                            <div className="flex justify-center">
                              <div className={`flex h-5 w-5 items-center justify-center rounded border ${isChecked ? "border-[#059669] bg-[#059669] text-white" : "border-[#D6C6B2] bg-white text-transparent"}`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-[#5C3A2E]">{activity.time}</td>
                          <td className="px-3 py-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-[#3D2817]">{activity.name}</p>
                                {activity.mapUrl ? (
                                  <a href={activity.mapUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#A67B5B]" title="Buka di Maps">
                                    <MapPin className="h-3.5 w-3.5" />
                                  </a>
                                ) : null}
                              </div>
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLES[activity.category]}`}>{activity.category}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm leading-6 text-[#6B543D]">
                            <p>{activity.detail || "-"}</p>
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <p className="font-semibold text-[#5C3A2E]">{formatActivityCost(activity.est, activity.currency)}</p>
                            {activity.actual ? <p className="mt-0.5 text-xs text-[#059669]">{formatActivityCost(activity.actual, activity.currency)}</p> : null}
                          </td>
                          {editMode ? <td className="px-3 py-3"><Pencil className="h-4 w-4 text-[#A67B5B]" /></td> : null}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {editMode ? (
                <div className="border-t border-[#F0E7DA] bg-[#FBF6EF] px-4 py-3">
                  <button type="button"
                    onClick={() => setActivityEditor({ dayIndex, activityIndex: -1, activity: { time: "", name: "", category: "Wisata", detail: "", est: 0, actual: 0, currency: "MYR", mapUrl: "" }, isNew: true })}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B5] bg-white px-3 py-2 text-sm font-medium text-[#5C3A2E]">
                    <Plus className="h-4 w-4" />Tambah aktivitas
                  </button>
                </div>
              ) : null}
              {day.catatan ? (
                <div className="border-t border-[#D7E9F7] bg-[#EAF5FF] px-4 py-3 text-sm leading-6 text-[#2C5372]">
                  <span className="font-semibold">Catatan khusus:</span> {day.catatan}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );

  const renderPesertaTab = () => (
    <section className="space-y-4">
      <div className="grid gap-3">
        {ITINERARY.peserta.map((person, index) => (
          <article key={person.kode}
            onClick={() => editMode && setParticipantEditor({ index, participant: person })}
            className={`rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm transition ${editMode ? "cursor-pointer hover:border-[#A67B5B]" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-[#FBF2E7] px-3 py-1 text-xs font-semibold text-[#A67B5B]">Peserta {person.kode}</div>
                <h3 className="text-base font-semibold text-[#3D2817]">{person.nama}</h3>
                <p className="text-sm text-[#8B7355]">{person.relasi} · {person.usia} tahun · {person.gender}</p>
              </div>
              <div className="flex items-center gap-2">
                {!person.pasporReady ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-[#DC2626]">Paspor belum ada</span> : null}
                {editMode ? <Pencil className="h-4 w-4 text-[#A67B5B]" /> : null}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#5C3A2E]">
              <BedDouble className="h-4 w-4" />Kamar {person.kamar}
            </div>
          </article>
        ))}
      </div>
      <section className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-[#3D2817]">Pembagian Kamar</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {Object.entries(roomMap).map(([room, people]) => (
            <div key={room} className="rounded-2xl border border-[#EFE3D4] bg-[#FBF6EF] p-4">
              <p className="text-sm font-semibold text-[#5C3A2E]">{room}</p>
              <div className="mt-3 space-y-2">
                {people.map((person) => (
                  <div key={person.kode} className="rounded-xl bg-white px-3 py-2 text-sm text-[#6B543D]">
                    {person.kode} · {person.nama}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );

  const renderChecklistTab = () => (
    <section className="space-y-4">
      {Object.entries(ITINERARY.checklist).map(([phase, items]) => {
        const doneCount = items.filter((item) => appState.checkedChecklist[item.id]).length;
        const progress = items.length ? (doneCount / items.length) * 100 : 0;
        return (
          <article key={phase} className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#3D2817]">{phase}</h3>
                <p className="text-sm text-[#8B7355]">{doneCount}/{items.length} selesai</p>
              </div>
              {editMode ? (
                <button type="button" onClick={() => setPhaseEditor({ name: phase, isNew: false })}
                  className="rounded-full border border-[#D9C9B5] bg-white px-2 py-1 text-xs text-[#5C3A2E]">
                  <Pencil className="inline h-3 w-3" /> Fase
                </button>
              ) : null}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0E7DA]">
              <div className="h-full rounded-full bg-[#A67B5B] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 space-y-2">
              {items.map((item) => {
                const isChecked = Boolean(appState.checkedChecklist[item.id]);
                const handleClick = () => {
                  if (editMode) setChecklistEditor({ phase, item, isNew: false });
                  else toggleChecklist(item.id);
                };
                return (
                  <button key={item.id} type="button" onClick={handleClick}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 ${
                      isChecked && !editMode ? "border-[#D8EADF] bg-[#F3FBF7] opacity-60 line-through" : "border-[#F0E7DA] bg-[#FCFAF6]"
                    }`}>
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isChecked ? "border-[#059669] bg-[#059669] text-white" : "border-[#D6C6B2] bg-white text-transparent"}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[#3D2817]">{item.text}</span>
                        {item.critical ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#DC2626]">
                            <AlertTriangle className="h-3.5 w-3.5" />CRITICAL
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {editMode ? <Pencil className="h-4 w-4 text-[#A67B5B]" /> : null}
                  </button>
                );
              })}
            </div>
            {editMode ? (
              <button type="button"
                onClick={() => setChecklistEditor({ phase, item: { text: "", critical: false }, isNew: true })}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D9C9B5] bg-white px-3 py-2 text-sm text-[#5C3A2E]">
                <Plus className="h-4 w-4" />Tambah item
              </button>
            ) : null}
          </article>
        );
      })}
      {editMode ? (
        <button type="button"
          onClick={() => setPhaseEditor({ name: "", isNew: true })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D9C9B5] bg-white px-4 py-3 text-sm font-medium text-[#5C3A2E]">
          <Plus className="h-4 w-4" />Tambah fase baru
        </button>
      ) : null}
    </section>
  );

  const renderBudgetTable = (title, items, section) => (
    <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-[#3D2817]">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead className="text-left text-xs uppercase tracking-wide text-[#8B7355]">
            <tr className="border-b border-[#F0E7DA]">
              <th className="px-0 py-3">Item</th>
              <th className="px-3 py-3">Per Orang</th>
              <th className="px-3 py-3">Catatan</th>
              {editMode ? <th className="w-10 px-3 py-3"></th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={`${section}-${index}`}
                onClick={() => editMode && setBudgetEditor({ section, index, row, isNew: false })}
                className={`border-b border-[#F7F1E8] last:border-b-0 ${editMode ? "cursor-pointer hover:bg-[#FCF8F1]" : ""}`}>
                <td className="px-0 py-3 text-sm font-medium text-[#3D2817]">{row.item}</td>
                <td className="px-3 py-3 text-sm font-semibold text-[#5C3A2E]">{formatRupiah(row.perOrang)}</td>
                <td className="px-3 py-3 text-sm text-[#8B7355]">{row.catatan}</td>
                {editMode ? <td className="px-3 py-3"><Pencil className="h-4 w-4 text-[#A67B5B]" /></td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editMode ? (
        <button type="button"
          onClick={() => setBudgetEditor({ section, index: -1, row: { item: "", perOrang: 0, catatan: "" }, isNew: true })}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D9C9B5] bg-white px-3 py-2 text-sm text-[#5C3A2E]">
          <Plus className="h-4 w-4" />Tambah item
        </button>
      ) : null}
    </article>
  );

  const renderBudgetTab = () => {
    const summary = ITINERARY.budget.summary || {};
    const difference = (summary.target || 0) - (summary.totalSixPeople || 0);
    return (
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Total per orang</p>
            <p className="mt-2 text-lg font-semibold text-[#3D2817]">{formatRupiah(summary.totalPerOrang)}</p>
          </div>
          <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Total 6 orang</p>
            <p className="mt-2 text-lg font-semibold text-[#3D2817]">{formatRupiah(summary.totalSixPeople)}</p>
          </div>
          <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Target</p>
            <p className="mt-2 text-lg font-semibold text-[#3D2817]">{formatRupiah(summary.target)}</p>
            <p className="mt-1 text-sm text-[#059669]">Selisih {formatRupiah(difference)}</p>
          </div>
        </div>
        {editMode ? (
          <button type="button" onClick={() => setSummaryEditorOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B5] bg-white px-4 py-2 text-sm font-medium text-[#5C3A2E]">
            <Pencil className="h-4 w-4" />Edit angka summary
          </button>
        ) : null}
        <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#3D2817]">Aktual terpakai (dari aktivitas)</p>
          <p className="mt-2 text-2xl font-bold text-[#059669]">{formatRupiah(totalActualIdr)}</p>
          <p className="mt-1 text-xs text-[#8B7355]">Hasil isian kolom &quot;Aktual&quot; pada tiap aktivitas. Aktifkan Mode Edit untuk isi.</p>
        </div>
        <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-[#3D2817]">Pembagian Biaya</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#FBF6EF] p-4">
              <p className="text-sm text-[#8B7355]">D / E / F</p>
              <p className="mt-1 text-lg font-semibold text-[#5C3A2E]">{formatRupiah(summary.flatDEF)}/orang</p>
              <p className="mt-1 text-sm text-[#8B7355]">Skema flat</p>
            </div>
            <div className="rounded-2xl bg-[#FBF6EF] p-4">
              <p className="text-sm text-[#8B7355]">A / B / C</p>
              <p className="mt-1 text-lg font-semibold text-[#5C3A2E]">~{formatRupiah(summary.abcShare)}/orang</p>
              <p className="mt-1 text-sm text-[#8B7355]">Menutup subsidi rombongan</p>
            </div>
          </div>
        </div>
        {renderBudgetTable("Singapura", ITINERARY.budget.sg || [], "sg")}
        {renderBudgetTable("Kuala Lumpur", ITINERARY.budget.kl || [], "kl")}
        <p className="text-xs text-[#8B7355]">Belanja personal & kereta Malang-JKT tidak termasuk.</p>
      </section>
    );
  };

  const renderSettingTab = () => (
    <section className="space-y-4">
      <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-[#3D2817]">Tampilan</h3>
        <button type="button" onClick={toggleHideElapsed}
          className={`mt-3 inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${
            hideElapsed ? "border-[#5C3A2E] bg-[#FBF6EF]" : "border-[#E5D9C8] bg-white"
          }`}>
          <span className="flex items-center gap-2 text-sm font-medium text-[#5C3A2E]">
            <EyeOff className="h-4 w-4" />Sembunyikan hari yang sudah lewat
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs ${hideElapsed ? "bg-[#5C3A2E] text-white" : "bg-[#F0E7DA] text-[#8B7355]"}`}>
            {hideElapsed ? "ON" : "OFF"}
          </span>
        </button>
        <p className="mt-2 text-xs text-[#8B7355]">
          Hari yang tanggalnya sudah lewat (sebelum hari ini) tidak akan muncul di tab Itinerary.
        </p>
      </article>

      <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Coins className="mt-0.5 h-5 w-5 text-[#A67B5B]" />
          <div>
            <h3 className="text-base font-semibold text-[#3D2817]">Kurs manual</h3>
            <p className="mt-1 text-sm leading-6 text-[#8B7355]">
              Nilai awal dari kurs referensi {DEFAULT_RATES.sourceDate}. Ubah agar hitungan tetap relevan.
            </p>
          </div>
        </div>
      </article>
      <div className="grid gap-3">
        <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#3D2817]">Rate SGD → IDR</p>
          <div className="mt-3 rounded-2xl border border-[#EFE3D4] bg-[#FBF6EF] px-4 py-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8B7355]">1 SGD</label>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm font-medium text-[#5C3A2E]">Rp</span>
              <input type="number" inputMode="numeric" value={appState.rates.sgdToIdr}
                onChange={(event) => handleRateChange("sgdToIdr", event.target.value)}
                className="w-full rounded-xl border border-[#D9C9B5] bg-white px-3 py-2 text-base font-semibold text-[#3D2817] outline-none transition duration-150 focus:border-[#A67B5B]" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#3D2817]">Rate MYR → IDR</p>
          <div className="mt-3 rounded-2xl border border-[#EFE3D4] bg-[#FBF6EF] px-4 py-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#8B7355]">1 MYR</label>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm font-medium text-[#5C3A2E]">Rp</span>
              <input type="number" inputMode="numeric" value={appState.rates.myrToIdr}
                onChange={(event) => handleRateChange("myrToIdr", event.target.value)}
                className="w-full rounded-xl border border-[#D9C9B5] bg-white px-3 py-2 text-base font-semibold text-[#3D2817] outline-none transition duration-150 focus:border-[#A67B5B]" />
            </div>
          </div>
        </div>
      </div>
      <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-[#3D2817]">Ringkasan kurs aktif</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#FBF6EF] p-4">
            <p className="text-sm text-[#8B7355]">SGD</p>
            <p className="mt-1 text-lg font-semibold text-[#5C3A2E]">{formatRupiah(appState.rates.sgdToIdr)}</p>
          </div>
          <div className="rounded-2xl bg-[#FBF6EF] p-4">
            <p className="text-sm text-[#8B7355]">MYR</p>
            <p className="mt-1 text-lg font-semibold text-[#5C3A2E]">{formatRupiah(appState.rates.myrToIdr)}</p>
          </div>
        </div>
      </article>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#3D2817]">
      <div className="mx-auto max-w-[600px] px-3 py-3 sm:px-4">
        <header className="sticky top-0 z-30 -mx-3 border-b border-[#E5D9C8] bg-[#F5EFE6]/95 px-3 pb-3 pt-2 backdrop-blur sm:-mx-4 sm:px-4">
          <div
            onClick={() => editMode && setMetaEditorOpen(true)}
            className={`rounded-3xl border border-[#E5D9C8] bg-white px-4 py-4 shadow-sm ${editMode ? "cursor-pointer hover:border-[#A67B5B]" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-[#3D2817]">{ITINERARY.meta.title}</h1>
                <p className="mt-1 text-sm text-[#8B7355]">{ITINERARY.meta.dateRange} · {ITINERARY.meta.travelers}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setEditMode((v) => !v); }}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  editMode ? "border-[#5C3A2E] bg-[#5C3A2E] text-white" : "border-[#D9C9B5] bg-white text-[#5C3A2E]"
                }`}
                title="Mode Edit"
              >
                <Pencil className="inline h-3.5 w-3.5" />{editMode ? " Edit ON" : " Edit"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ITINERARY.meta.hotels?.sg ? (
                <span className="rounded-full bg-[#FBF6EF] px-3 py-1.5 text-xs font-medium text-[#5C3A2E]">{ITINERARY.meta.hotels.sg}</span>
              ) : null}
              {ITINERARY.meta.hotels?.kl ? (
                <span className="rounded-full bg-[#FBF6EF] px-3 py-1.5 text-xs font-medium text-[#5C3A2E]">{ITINERARY.meta.hotels.kl}</span>
              ) : null}
              {ITINERARY.meta.budgetTarget ? (
                <span className="rounded-full bg-[#FBF6EF] px-3 py-1.5 text-xs font-medium text-[#5C3A2E]">Budget {formatRupiah(ITINERARY.meta.budgetTarget)}</span>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Durasi</p>
            <p className="mt-2 text-lg font-semibold text-[#3D2817]">{tripDurationDays} Hari</p>
          </article>
          <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Selesai</p>
            <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#059669]">
              <CheckCircle2 className="h-5 w-5" />{checkedActivityCount}/{totalActivityCount}
            </div>
          </article>
          <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Aktual</p>
            <p className="mt-2 text-lg font-semibold text-[#059669]">{formatRupiah(totalActualIdr)}</p>
          </article>
          <article className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm text-[#8B7355]">Sisa Est.</p>
            <p className="mt-2 text-lg font-semibold text-[#3D2817]">{formatRupiah(unfinishedEstimateIdr)}</p>
          </article>
        </section>

        <nav className="sticky top-[124px] z-20 mt-4 -mx-1 border-b border-[#E5D9C8] bg-[#F5EFE6]/95 px-1 pb-3 pt-1 backdrop-blur">
          <div className="grid grid-cols-5 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-2 py-3 text-center text-xs font-semibold transition duration-150 ${
                    isActive ? "bg-[#5C3A2E] text-white shadow-sm" : "bg-[#FBF6EF] text-[#5C3A2E]"
                  }`}>
                  <Icon className="mx-auto mb-1 h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="mt-4 pb-6">
          {activeTab === "itinerary" ? renderItineraryTab() : null}
          {activeTab === "peserta" ? renderPesertaTab() : null}
          {activeTab === "checklist" ? renderChecklistTab() : null}
          {activeTab === "budget" ? renderBudgetTab() : null}
          {activeTab === "setting" ? renderSettingTab() : null}
        </main>

        <footer className="space-y-3 pb-8">
          <div className="rounded-2xl border border-[#E5D9C8] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#3D2817]">Ringkasan progres</p>
            <p className="mt-1 text-sm text-[#8B7355]">
              {checkedActivityCount}/{totalActivityCount} aktivitas dan {checklistDone}/{allChecklistItems.length} checklist selesai
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B5] bg-[#FBF6EF] px-4 py-2 text-sm font-medium text-[#5C3A2E] transition duration-150 hover:bg-[#F5EBDD]">
                <RefreshCcw className="h-4 w-4" />Reset Progress
              </button>
              {shareReady ? (
                <button type="button" onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D9C9B5] bg-white px-4 py-2 text-sm font-medium text-[#5C3A2E] transition duration-150 hover:bg-[#FBF6EF]">
                  <Share2 className="h-4 w-4" />Bagikan link ini
                </button>
              ) : null}
            </div>
          </div>
        </footer>
      </div>

      {/* ----- Modals ----- */}
      <Modal open={!!activityEditor} title={activityEditor?.isNew ? "Tambah Aktivitas" : "Edit Aktivitas"} onClose={() => setActivityEditor(null)}>
        {activityEditor ? (
          <ActivityEditor activity={activityEditor.activity} onSave={handleSaveActivity}
            onDelete={activityEditor.isNew ? null : handleDeleteActivity}
            onCancel={() => setActivityEditor(null)} />
        ) : null}
      </Modal>

      <Modal open={!!participantEditor} title="Edit Peserta" onClose={() => setParticipantEditor(null)}>
        {participantEditor ? (
          <ParticipantEditor participant={participantEditor.participant} onSave={handleSaveParticipant} onCancel={() => setParticipantEditor(null)} />
        ) : null}
      </Modal>

      <Modal open={metaEditorOpen} title="Edit Info Trip" onClose={() => setMetaEditorOpen(false)}>
        {metaEditorOpen ? (
          <MetaEditor meta={ITINERARY.meta} onSave={handleSaveMeta} onCancel={() => setMetaEditorOpen(false)} />
        ) : null}
      </Modal>

      <Modal open={!!dayEditor} title="Edit Hari" onClose={() => setDayEditor(null)}>
        {dayEditor ? (
          <DayHeaderEditor day={dayEditor.day} onSave={handleSaveDay} onCancel={() => setDayEditor(null)} />
        ) : null}
      </Modal>

      <Modal open={!!checklistEditor} title={checklistEditor?.isNew ? "Tambah Item Checklist" : "Edit Item Checklist"} onClose={() => setChecklistEditor(null)}>
        {checklistEditor ? (
          <ChecklistItemEditor item={checklistEditor.item} onSave={handleSaveChecklistItem}
            onDelete={checklistEditor.isNew ? null : handleDeleteChecklistItem}
            onCancel={() => setChecklistEditor(null)} />
        ) : null}
      </Modal>

      <Modal open={!!phaseEditor} title={phaseEditor?.isNew ? "Tambah Fase" : "Edit Fase"} onClose={() => setPhaseEditor(null)}>
        {phaseEditor ? (
          <PhaseEditor name={phaseEditor.name} onSave={handleSavePhase}
            onDelete={phaseEditor.isNew ? null : handleDeletePhase}
            onCancel={() => setPhaseEditor(null)} />
        ) : null}
      </Modal>

      <Modal open={!!budgetEditor} title={budgetEditor?.isNew ? "Tambah Item Budget" : "Edit Item Budget"} onClose={() => setBudgetEditor(null)}>
        {budgetEditor ? (
          <BudgetItemEditor row={budgetEditor.row} onSave={handleSaveBudgetItem}
            onDelete={budgetEditor.isNew ? null : handleDeleteBudgetItem}
            onCancel={() => setBudgetEditor(null)} />
        ) : null}
      </Modal>

      <Modal open={summaryEditorOpen} title="Edit Summary Budget" onClose={() => setSummaryEditorOpen(false)}>
        {summaryEditorOpen ? (
          <BudgetSummaryEditor summary={ITINERARY.budget.summary} onSave={handleSaveSummary} onCancel={() => setSummaryEditorOpen(false)} />
        ) : null}
      </Modal>
    </div>
  );
}
