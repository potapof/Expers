"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  startTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Expert {
  id: string;
  name: string;
  email: string;
  role?: "reader" | "expert";
  hasPaid?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  expert: Expert | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: "reader" | "expert"
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function emitAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("expers-auth-changed"));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      startTransition(() => setLoading(false));
      return;
    }

    let cancelled = false;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setExpert(data.expert);
          emitAuthChanged();
        }
      })
      .catch(() => {
        if (!cancelled) localStorage.removeItem("token");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const id = toast.loading("Вход...");
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Ошибка входа", { id });
          return;
        }

        localStorage.setItem("token", data.token);
        setExpert(data.expert);
        emitAuthChanged();
        toast.success("Вы вошли в систему", { id });
        router.push(data.expert?.role === "reader" ? "/" : "/cabinet");
      } catch {
        toast.error("Ошибка соединения", { id });
      }
    },
    [router]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "reader" | "expert" = "reader"
    ) => {
      const id = toast.loading("Регистрация...");
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Ошибка регистрации", { id });
          return;
        }

        localStorage.setItem("token", data.token);
        setExpert(data.expert);
        emitAuthChanged();
        toast.success("Регистрация завершена", { id });
        router.push(data.expert?.role === "reader" ? "/" : "/cabinet");
      } catch {
        toast.error("Ошибка соединения", { id });
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setExpert(null);
    emitAuthChanged();
    toast.success("Вы вышли из системы");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ expert, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
