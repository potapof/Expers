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

export function AuthButtons() {
  const { expert, loading, login, register, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regIsExpert, setRegIsExpert] = useState(false);

  const isExpert = expert?.role === "expert";

  function switchToRegister() {
    setShowLogin(false);
    setShowRegister(true);
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
          <Link href="/cabinet/favorites">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Мой кабинет
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User className="h-4 w-4" />
          {expert.name}
        </div>
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
          isExpert={regIsExpert}
          onIsExpertChange={setRegIsExpert}
          onSubmit={() => {
            register(
              regName,
              regEmail,
              regPassword,
              regIsExpert ? "expert" : "reader"
            );
            setShowRegister(false);
          }}
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
        isExpert={regIsExpert}
        onIsExpertChange={setRegIsExpert}
        onSubmit={() => {
          register(
            regName,
            regEmail,
            regPassword,
            regIsExpert ? "expert" : "reader"
          );
          setShowRegister(false);
        }}
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
  onSwitchToRegister: () => void;
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
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Войти</Button>
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
  isExpert,
  onIsExpertChange,
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
  isExpert: boolean;
  onIsExpertChange: (v: boolean) => void;
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
          <label className="flex items-start gap-2 rounded-lg border border-gray-200 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isExpert}
              onChange={(e) => onIsExpertChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#3498DB]"
            />
            <span className="text-sm text-gray-600">
              Я эксперт — хочу публиковать статьи
              <span className="block text-xs text-gray-400">
                Без галочки вы регистрируетесь как читатель (избранное, подписки,
                история).
              </span>
            </span>
          </label>
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
