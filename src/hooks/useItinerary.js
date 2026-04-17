import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_RATES, SEED_ITINERARY } from "../data/seed";

const TRIP_ID = "sgkl-2026";

const DEFAULT_STATE = {
  checkedActivities: {},
  checkedChecklist: {},
  rates: DEFAULT_RATES,
};

export function useItinerary() {
  const [data, setData] = useState(null);
  const [appState, setAppStateLocal] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(true);

  useEffect(() => {
    const ref = doc(db, "trips", TRIP_ID);
    const unsub = onSnapshot(
      ref,
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
    setAppStateLocal(next); // optimistic
    try {
      await setDoc(
        doc(db, "trips", TRIP_ID),
        { state: next, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to persist state:", err);
    }
  };

  const seed = async () => {
    await setDoc(doc(db, "trips", TRIP_ID), {
      ...SEED_ITINERARY,
      state: DEFAULT_STATE,
      updatedAt: serverTimestamp(),
    });
  };

  return { data, appState, setAppState, loading, exists, seed };
}
