import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_RATES, SEED_ITINERARY } from "../data/seed";

const TRIP_ID = "sgkl-2026";
const tripRef = () => doc(db, "trips", TRIP_ID);

const DEFAULT_STATE = {
  checkedActivities: {},
  checkedChecklist: {},
  rates: DEFAULT_RATES,
  hideElapsedDays: false,
};

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function useItinerary() {
  const [data, setData] = useState(null);
  const [appState, setAppStateLocal] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      tripRef(),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setData({
            meta: d.meta || {},
            peserta: d.peserta || [],
            days: d.days || [],
            checklist: d.checklist || {},
            budget: d.budget || { sg: [], kl: [], summary: {} },
          });
          setAppStateLocal({
            checkedActivities: d.state?.checkedActivities || {},
            checkedChecklist: d.state?.checkedChecklist || {},
            rates: { ...DEFAULT_RATES, ...(d.state?.rates || {}) },
            hideElapsedDays: !!d.state?.hideElapsedDays,
          });
          setExists(true);
        } else {
          setData(null);
          setExists(false);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore subscribe error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const setAppState = async (updater) => {
    const next = typeof updater === "function" ? updater(appState) : updater;
    setAppStateLocal(next);
    try {
      await setDoc(tripRef(), { state: next, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error("Failed to persist state:", err);
    }
  };

  const seed = async () => {
    await setDoc(tripRef(), {
      ...SEED_ITINERARY,
      state: DEFAULT_STATE,
      updatedAt: serverTimestamp(),
    });
  };

  const updateField = async (field, value) => {
    await updateDoc(tripRef(), { [field]: value, updatedAt: serverTimestamp() });
  };

  const updateMeta = async (partial) => {
    if (!data) return;
    await updateField("meta", { ...data.meta, ...partial });
  };

  const updateDay = async (dayIndex, partial) => {
    if (!data) return;
    const days = data.days.map((d, i) => (i === dayIndex ? { ...d, ...partial } : d));
    await updateField("days", days);
  };

  const updateActivity = async (dayIndex, activityIndex, partial) => {
    if (!data) return;
    const days = data.days.map((d, i) => {
      if (i !== dayIndex) return d;
      const activities = d.activities.map((a, j) => (j === activityIndex ? { ...a, ...partial } : a));
      return { ...d, activities };
    });
    await updateField("days", days);
  };

  const addActivity = async (dayIndex, activity) => {
    if (!data) return;
    const days = data.days.map((d, i) => {
      if (i !== dayIndex) return d;
      return { ...d, activities: [...d.activities, { id: newId("a"), ...activity }] };
    });
    await updateField("days", days);
  };

  const deleteActivity = async (dayIndex, activityIndex) => {
    if (!data) return;
    const days = data.days.map((d, i) => {
      if (i !== dayIndex) return d;
      return { ...d, activities: d.activities.filter((_, j) => j !== activityIndex) };
    });
    await updateField("days", days);
  };

  const updateParticipant = async (index, partial) => {
    if (!data) return;
    const peserta = data.peserta.map((p, i) => (i === index ? { ...p, ...partial } : p));
    await updateField("peserta", peserta);
  };

  // ---------- Checklist ----------
  const updateChecklistItem = async (phase, itemId, partial) => {
    if (!data) return;
    const items = data.checklist[phase].map((it) => (it.id === itemId ? { ...it, ...partial } : it));
    await updateField("checklist", { ...data.checklist, [phase]: items });
  };

  const addChecklistItem = async (phase, item) => {
    if (!data) return;
    const items = [...(data.checklist[phase] || []), { id: newId("c"), critical: false, ...item }];
    await updateField("checklist", { ...data.checklist, [phase]: items });
  };

  const deleteChecklistItem = async (phase, itemId) => {
    if (!data) return;
    const items = data.checklist[phase].filter((it) => it.id !== itemId);
    await updateField("checklist", { ...data.checklist, [phase]: items });
  };

  const renamePhase = async (oldName, newName) => {
    if (!data || oldName === newName || !newName.trim()) return;
    if (data.checklist[newName]) {
      throw new Error("Nama fase sudah dipakai");
    }
    const next = {};
    for (const [k, v] of Object.entries(data.checklist)) {
      next[k === oldName ? newName : k] = v;
    }
    await updateField("checklist", next);
  };

  const addPhase = async (name) => {
    if (!data || !name.trim() || data.checklist[name]) return;
    await updateField("checklist", { ...data.checklist, [name]: [] });
  };

  const deletePhase = async (name) => {
    if (!data) return;
    const next = { ...data.checklist };
    delete next[name];
    await updateField("checklist", next);
  };

  // ---------- Budget ----------
  const updateBudgetItem = async (section, index, partial) => {
    if (!data) return;
    const items = data.budget[section].map((row, i) => (i === index ? { ...row, ...partial } : row));
    await updateField("budget", { ...data.budget, [section]: items });
  };

  const addBudgetItem = async (section, item) => {
    if (!data) return;
    const items = [...(data.budget[section] || []), { item: "Item baru", perOrang: 0, catatan: "", ...item }];
    await updateField("budget", { ...data.budget, [section]: items });
  };

  const deleteBudgetItem = async (section, index) => {
    if (!data) return;
    const items = data.budget[section].filter((_, i) => i !== index);
    await updateField("budget", { ...data.budget, [section]: items });
  };

  const updateBudgetSummary = async (partial) => {
    if (!data) return;
    await updateField("budget", { ...data.budget, summary: { ...data.budget.summary, ...partial } });
  };

  return {
    data,
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
  };
}
