import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { api } from "./api";

const KEY = "colunas_admin_token";

async function readToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}
async function writeToken(v: string | null) {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") return;
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    } catch {}
    return;
  }
  if (v) await SecureStore.setItemAsync(KEY, v);
  else await SecureStore.deleteItemAsync(KEY);
}

type AuthCtx = {
  token: string | null;
  loading: boolean;
  signIn: (u: string, p: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readToken().then(setToken).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      loading,
      async signIn(u, p) {
        const r = await api.login(u, p);
        await writeToken(r.access_token);
        setToken(r.access_token);
      },
      async signOut() {
        await writeToken(null);
        setToken(null);
      },
    }),
    [token, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
