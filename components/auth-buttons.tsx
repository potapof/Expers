"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PenSquare, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { NotificationCenter } from "@/components/notification-center";
import { toast } from "sonner";

export function AuthButtons() {
  const { expert, loading, login, register, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");

  const isExpert = expert?.role === "expert";

  function switchToRegister() {
    setShowLogin(false);
    setShowRegister(true);
  }

  function switchToForgotPassword() {
    setShowLogin(false);
    setForgotEmail(loginEmail);
    setForgotStep("email");
    setShowForgotPassword(true);
  }

  async function handleForgotEmail() {
    if (!forgotEmail) return;
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      setForgotCode(data.code);
      setForgotStep("reset");
      toast.success("Код сброса пароля получен");
    } else {
      toast.error(data.error || "Ошибка");
    }
  }

  async function handleResetPassword() {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: forgotEmail,
        code: forgotCode,
        password: forgotPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Пароль изменён. Войдите с новым паролем.");
      setShowForgotPassword(false);
      setShowLogin(true);
    } else {
      toast.error(data.error || "Ошибка");
    }
  }

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-gray-100" />;
  }

  if (expert) {
    return (
      <div className="flex items-center gap-3">
        {isExpert ? (
          <>
            <Link href="/articles/new">
              <Button variant="default" size="sm" className="gap-2">
                <PenSquare className="h-4 w-4" />
                Опубликовать статью
              </Button>
            </Link>
            <NotificationCenter />
          </>
        ) : (
          <>
            <Link href="/cabinet">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Мой кабинет
              </Button>
            </Link>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>

        <LoginDialog
          open={showLogin}
          onOpenChange={setShowLogin}
          email={loginEmail}
          onEmailChange={setLoginEmail}
          password={loginPassword}
          onPasswordChange={setLoginPassword}
          onSubmit={() => {
            login(loginEmail, loginPassword);
            setShowLogin(false);
          }}
          onSwitchToRegister={switchToRegister}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
        <RegisterDialog
          open={showRegister}
          onOpenChange={setShowRegister}
          name={regName}
          onNameChange={setRegName}
          email={regEmail}
          onEmailChange={setRegEmail}
          password={regPassword}
          onPasswordChange={setRegPassword}
          onSubmit={() => {
            register(regName, regEmail, regPassword);
            setShowRegister(false);
          }}
        />
        <ForgotPasswordDialog
          open={showForgotPassword}
          onOpenChange={setShowForgotPassword}
          email={forgotEmail}
          onEmailChange={setForgotEmail}
          code={forgotCode}
          onCodeChange={setForgotCode}
          password={forgotPassword}
          onPasswordChange={setForgotPassword}
          step={forgotStep}
          onSendEmail={handleForgotEmail}
          onReset={handleResetPassword}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowLogin(true)}
        className="gap-2"
      >
        <LogIn className="h-4 w-4" />
        Войти
      </Button>

      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        email={loginEmail}
        onEmailChange={setLoginEmail}
        password={loginPassword}
        onPasswordChange={setLoginPassword}
        onSubmit={() => {
          login(loginEmail, loginPassword);
          setShowLogin(false);
        }}
        onSwitchToRegister={switchToRegister}
        onSwitchToForgotPassword={switchToForgotPassword}
      />
      <RegisterDialog
        open={showRegister}
        onOpenChange={setShowRegister}
        name={regName}
        onNameChange={setRegName}
        email={regEmail}
        onEmailChange={setRegEmail}
        password={regPassword}
        onPasswordChange={setRegPassword}
        onSubmit={() => {
          register(regName, regEmail, regPassword);
          setShowRegister(false);
        }}
      />
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        email={forgotEmail}
        onEmailChange={setForgotEmail}
        code={forgotCode}
        onCodeChange={setForgotCode}
        password={forgotPassword}
        onPasswordChange={setForgotPassword}
        step={forgotStep}
        onSendEmail={handleForgotEmail}
        onReset={handleResetPassword}
      />
    </div>
  );
}

function LoginDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вход</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Пароль</label>
            <Input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2 justify-between items-center">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Забыли пароль?
            </button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Войти</Button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Зарегистрироваться
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RegisterDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  onNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Регистрация</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-gray-700">Имя</label>
            <Input
              placeholder="Иван Петров"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Пароль</label>
            <Input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Зарегистрироваться</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ForgotPasswordDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  code,
  onCodeChange,
  password,
  onPasswordChange,
  step,
  onSendEmail,
  onReset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  email: string;
  onEmailChange: (v: string) => void;
  code: string;
  onCodeChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  step: "email" | "reset";
  onSendEmail: () => void;
  onReset: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Восстановление пароля</DialogTitle>
        </DialogHeader>
        {step === "email" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSendEmail();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Отправить код</Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onReset();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-gray-700">
                Код сброса
              </label>
              <Input
                placeholder="••••••"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                required
                maxLength={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Новый пароль
              </label>
              <Input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Сменить пароль</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
