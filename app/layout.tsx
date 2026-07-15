import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { BridgeProvider } from "@/components/bridge-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { AuthButtons } from "@/components/auth-buttons";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const appName = "Expers";

export const metadata: Metadata = {
  title: `${appName} — Каталог экспертных статей`,
  description: "Бесплатный каталог экспертных статей по 13 отраслям бизнеса",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/favicon-180x180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen bg-white flex flex-col">
        <BridgeProvider />
        <AuthProvider>
          <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
            <div className="mx-auto px-4 h-14 max-w-7xl flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt={appName}
                  width={100}
                  height={28}
                  className="h-7 w-auto"
                  priority
                />
                <span className="text-lg font-semibold tracking-tight text-[#2C3E50]">
                  EXPERS
                </span>
              </Link>
              <nav className="hidden sm:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-sm font-medium text-[#2C3E50] hover:text-[#0039CA] transition-colors"
                >
                  Главная
                </Link>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 hover:text-[#2C3E50] transition-colors"
                >
                  О Каталоге
                </Link>
                <Link
                  href="/services"
                  className="text-sm text-gray-500 hover:text-[#2C3E50] transition-colors"
                >
                  Услуги
                </Link>
                <Link
                  href="/contacts"
                  className="text-sm text-gray-500 hover:text-[#2C3E50] transition-colors"
                >
                  Контакты
                </Link>
              </nav>
              <div className="flex items-center">
                <AuthButtons />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-gray-50">
            <div className="mx-auto px-4 py-8 max-w-7xl text-center text-xs text-gray-400">
              © {new Date().getFullYear()} {appName}. Все права защищены.
            </div>
          </footer>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
