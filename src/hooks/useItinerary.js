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
            meta: d.meta,
            peserta: d.peserta || [],
            days: d.days || [],
            checklist: d.checklist || {},
            budget: d.budget,
          });
          setAppStateLocal({
            checkedActivities: d.state?.checkedActivities || {},
            checkedChecklist: d.state?.checkedChecklist || {},
            rates: { ...DEFAULT_RATES, ...(d.state?.rates || {}) },
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

  return {
    data,
    appState,
    setAppState,
    loading,
    exists,
    seed,
    updateActivity,
    addActivity,
    deleteActivity,
    updateParticipant,
  };
}
