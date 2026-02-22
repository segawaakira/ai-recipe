import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken, setToken as saveToken, removeToken, decodeToken, isTokenExpired } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";

interface User {
  userId: number;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await getToken();
        if (stored && !isTokenExpired(stored)) {
          setToken(stored);
          const payload = decodeToken(stored);
          if (payload) {
            setUser({ userId: payload.sub, email: payload.email });
          }
        } else if (stored) {
          await removeToken();
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error, response } = await apiClient.POST("/auth/login", {
      body: { email, password },
    });
    if (response.status === 403) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }
    if (error || !data) {
      throw new Error("ログインに失敗しました");
    }
    const accessToken = (data as { accessToken: string }).accessToken;
    await saveToken(accessToken);
    setToken(accessToken);
    const payload = decodeToken(accessToken);
    if (payload) {
      setUser({ userId: payload.sub, email: payload.email });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await apiClient.POST("/users", {
      body: { email, password },
    });
    if (error) {
      throw new Error("アカウント作成に失敗しました");
    }
    // 自動ログインは行わない（メール認証が必要）
  }, []);

  const signOut = useCallback(async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!token) return;
    const { createAuthClient } = await import("@/lib/auth-api-client");
    const authClient = createAuthClient(token);
    await authClient.DELETE("/users");
    await signOut();
  }, [token, signOut]);

  const resendVerification = useCallback(async (email: string) => {
    await apiClient.POST("/auth/resend-verification", {
      body: { email },
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, signIn, signUp, signOut, deleteAccount, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
