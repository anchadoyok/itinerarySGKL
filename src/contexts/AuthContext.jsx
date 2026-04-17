import { createContext, useContext, useEffect, useState } from "react";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

// Mobile / non-localhost: pakai redirect (popup sering diblokir browser HP)
const isMobileLike =
  typeof window !== "undefined" &&
  (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    !["localhost", "127.0.0.1"].includes(window.location.hostname));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Selesaikan redirect login kalau ada
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect login error:", err);
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = () =>
    isMobileLike
      ? signInWithRedirect(auth, googleProvider)
      : signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
