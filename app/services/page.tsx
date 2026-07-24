import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  Bell,
  MessageSquare,
  PenSquare,
  Globe,
  LayoutDashboard,
  TrendingUp,
  Megaphone,
  Rocket,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Code2,
  UserCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Услуги — EXPERS.ru",
  description:
    "Бесплатный доступ к каталогу экспертных статей для читателей. Публикация GEO-оптимизированных статей и страница автора для экспертов.",
};

export default function ServicesPage() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="gradient-hero-vibrant pattern-grid relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0039CA]/10 px-4 py-1.5 text-sm font-medium text-[#0039CA] backdrop-blur mb-6">
            <Sparkles className="h-4 w-4" />
            Читателям и экспертам
          </span>
          <h1 suppressHydrationWarning className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2C3E50] mb-5">
            Услуги EXPERS.ru
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Бесплатно для читателей. Инвестиция в видимость для экспертов.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-14 space-y-16">
        {/* Читателю */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 suppressHydrationWarning className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C3E50] mb-3">
              Читателю — бесплатно
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              <span className="font-semibold text-[#1ABC9C]">
                0 ₽ — навсегда.
              </span>{" "}
              Без скрытых условий, без пробных периодов, без «подпишитесь, чтобы
              продолжить».
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <BookOpen className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 suppressHydrationWarning className="text-lg font-semibold text-[#2C3E50] mb-2">
                Каталог статей по 13 отраслям
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Структурированная навигация по разделам и темам — от IT и
                маркетинга до медицины и юриспруденции. Каждая статья проходит
                редакционную проверку, так что в каталоге нет SEO-спама и
                сгенерированного мусора. Только реальные эксперты, реальные
                кейсы, практические выводы.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Heart className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 suppressHydrationWarning className="text-lg font-semibold text-[#2C3E50] mb-2">
                Личный кабинет
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Сохраняйте статьи в избранное, возвращайтесь к прочитанному —
                история просмотров доступна в любой момент. Ваша библиотека
                экспертизы под рукой.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Bell className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 suppressHydrationWarning className="text-lg font-semibold text-[#2C3E50] mb-2">
                Подписки
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Подписывайтесь на авторов, разделы и темы — и получайте
                уведомления о новых публикациях. Не пропустите статью от
                эксперта, чьё мнение для вас важно.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <MessageSquare className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 suppressHydrationWarning className="text-lg font-semibold text-[#2C3E50] mb-2">
                Комментарии
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Обсуждайте статьи напрямую с авторами. Задавайте вопросы,
                спорьте, уточняйте детали. Каталог — не Одноклассники и не
                Medium, а площадка, где эксперт видит ваш комментарий и
                отвечает.
              </p>
            </div>
          </div>
        </section>

        {/* Автору */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 suppressHydrationWarning className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C3E50] mb-3">
              Автору-эксперту — публикация статьи
            </h2>
            <div className="inline-flex items-baseline gap-2 rounded-full bg-[#0039CA] px-6 py-2.5">
              <span className="text-2xl font-bold text-white">5 000 ₽</span>
              <span className="text-sm text-white/80">
                за публикацию одной статьи
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <h3 suppressHydrationWarning className="font-semibold text-[#2C3E50] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#1ABC9C]" />
                Что входит
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex gap-4 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0039CA]/10 mt-0.5">
                  <PenSquare className="h-5 w-5 text-[#0039CA]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2C3E50] mb-1">
                    Публикация в каталоге
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Ваша статья размещается в соответствующем разделе среди
                    других экспертных материалов. 12-шаговый мастер публикации
                    проведёт вас через структурирование, заголовки, аннотацию,
                    ключевые тезисы — и на каждом шаге подскажет, как оформить
                    контент так, чтобы его цитировали AI-системы. Это
                    GEO-оптимизация «из коробки»: вам не нужно разбираться в
                    Schema.org и промпт-инжиниринге — мастер делает это за вас.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0039CA]/10 mt-0.5">
                  <Code2 className="h-5 w-5 text-[#0039CA]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2C3E50] mb-1">
                    Микроразметка Schema.org — автоматически
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-500">
                    При публикации формируются структуры Person и Article в
                    формате JSON-LD. Для поисковых систем и для генеративных
                    моделей (ChatGPT, Perplexity, Gemini, Яндекс.Гид) это
                    сигнал: здесь — верифицированный автор с экспертным
                    контентом. Именно это повышает вероятность цитирования вашей
                    статьи в AI-ответах.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0039CA]/10 mt-0.5">
                  <UserCheck className="h-5 w-5 text-[#0039CA]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2C3E50] mb-1">
                    Страница автора — после первой оплаченной публикации
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Как только ваша первая статья прошла редакцию и размещена,
                    вы получаете доступ к созданию полноценной Страницы автора:
                    регалии, области экспертизы, опыт работы, список публикаций,
                    FAQ, отзывы, полноценный JSON-LD. Эта страница — ваш якорь
                    для AI: когда модель ищет «кто такой [Фамилия]», она находит
                    структурированный профиль, а не разрозненные упоминания.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0039CA]/10 mt-0.5">
                  <LayoutDashboard className="h-5 w-5 text-[#0039CA]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2C3E50] mb-1">
                    Кабинет автора
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Статистика просмотров и цитируемости, управление
                    комментариями, список подписчиков, финансовая панель — всё в
                    одном месте.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1ABC9C]/10 mt-0.5">
                  <Zap className="h-5 w-5 text-[#1ABC9C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2C3E50] mb-1">
                    Двойной эффект: SEO + GEO
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Статья работает одновременно на традиционное поисковое
                    ранжирование и на цитируемость в генеративных моделях. Вы
                    инвестируете один раз — а видимость растёт по двум каналам.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5 text-center">
              <Link
                href="/articles/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0039CA] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0039CA]/90 transition-colors"
              >
                <PenSquare className="h-4 w-4" />
                Опубликовать статью
              </Link>
              <p className="text-xs text-gray-400 mt-4 max-w-xl mx-auto">
                Оплачивая, вы приобретаете бессрочное право публикации одной
                статьи и принимаете условия{" "}
                <Link href="/offer" className="text-[#0039CA] hover:underline">
                  публичной оферты
                </Link>
                . Право не имеет срока действия и погашается при размещении
                статьи. Возврат за неиспользованное право — по{" "}
                <Link href="/refund" className="text-[#0039CA] hover:underline">
                  условиям возврата
                </Link>
                . Исполнитель: ООО «ФОНИИ», ИНН 7720943604. Цена указана в
                рублях, НДС не облагается (АУСН). Размещение — до 5 рабочих дней
                после редакционной проверки.
              </p>
            </div>
          </div>
        </section>

        {/* Скоро */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h2 suppressHydrationWarning className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2C3E50] mb-3">
              Скоро
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Мы расширяем набор инструментов для экспертов. Следите за
              обновлениями.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200/60">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 uppercase tracking-wide">
                  Скоро
                </span>
              </div>
              <h3 suppressHydrationWarning className="font-semibold text-[#2C3E50] mb-2">
                Приоритетное размещение
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Ваша статья выше в разделе и на главной странице каталога —
                больше просмотров в первые дни после публикации, больше шансов
                на цитирование.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200/60">
                  <Megaphone className="h-5 w-5 text-gray-400" />
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 uppercase tracking-wide">
                  Скоро
                </span>
              </div>
              <h3 suppressHydrationWarning className="font-semibold text-[#2C3E50] mb-2">
                Реклама в каталоге
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Баннерные и нативные форматы — для тех, кому нужно не только
                публиковать экспертный контент, но и привлекать целевую
                аудиторию к своим продуктам и услугам.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200/60">
                  <Rocket className="h-5 w-5 text-gray-400" />
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 uppercase tracking-wide">
                  Скоро
                </span>
              </div>
              <h3 suppressHydrationWarning className="font-semibold text-[#2C3E50] mb-2">
                Продвижение страницы автора
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Расширенная аналитика цитируемости в AI, рекомендации по
                усилению профиля, корпоративные пакеты для команд экспертов.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl bg-[#0039CA] px-6 py-10 sm:px-10 text-center relative overflow-hidden">
            <div className="relative">
              <div className="flex justify-center mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <Globe className="h-6 w-6 text-white" />
                </span>
              </div>
              <h2 suppressHydrationWarning className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Начните публиковаться сегодня
              </h2>
              <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
                Станьте видимым для аудитории, которая ищет экспертизу, — и для
                AI, которые рекомендуют экспертов миллионам пользователей.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/articles/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0039CA] hover:bg-blue-50 transition-colors"
                >
                  <PenSquare className="h-4 w-4" />
                  Опубликовать статью
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Смотреть каталог
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
