import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50/50 p-4 flex flex-col gap-1">
        <div className="mb-4 px-2">
          <h2 className="text-sm font-semibold text-gray-900">
            Администрирование
          </h2>
        </div>
        <NavItem href="/admin" icon={LayoutDashboard}>
          Дашборд
        </NavItem>
        <NavItem href="/admin/articles" icon={FileText}>
          Статьи
        </NavItem>
        <NavItem href="/admin/experts" icon={Users}>
          Эксперты
        </NavItem>
        <NavItem href="/admin/comments" icon={MessageSquare}>
          Комментарии
        </NavItem>
        <NavItem href="/admin/moderation" icon={ShieldCheck}>
          Модерация
        </NavItem>
        <div className="mt-auto pt-4 border-t">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
