import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Mail,
  Sparkles,
  Bot,
  Code2,
  Megaphone,
  Users,
  Zap,
  ArrowRight,
  PenSquare,
  MessageSquare,
  Phone,
  Clock,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Контакты — EXPERS.ru",
  description:
    "ООО «ФОНИИ» — научно-производственная компания из Москвы. Цифровой маркетинг, внедрение ИИ и Generative Engine Optimization.",
};

export default function ContactsPage() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="gradient-hero-vibrant pattern-grid relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0039CA]/10 px-4 py-1.5 text-sm font-medium text-[#0039CA] backdrop-blur mb-6">
            <Building2 className="h-4 w-4" />
            ООО «ФОНИИ»
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2C3E50] mb-5">
            Контакты
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Каталог EXPERS.ru создан и развивается командой
            научно-производственной компании «ФОНИИ»
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-14 space-y-16">
        {/* О компании */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-gray-100 bg-white p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0039CA]">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#2C3E50] mb-3">
                  ООО «ФОНИИ»
                </h2>
                <p className="text-base leading-relaxed text-gray-600 mb-4">
                  Научно-производственная компания из Москвы, объединяющая
                  экспертизу в цифровом маркетинге, web-разработке и
                  prompt-инжиниринге. Мы помогаем бизнесу автоматизировать
                  задачи — от текстов и дизайна до музыки и видео — с помощью
                  ИИ-решений.
                </p>
                <p className="text-base leading-relaxed text-gray-600">
                  Мы создаём экосистему, где технологии и профессионалы работают{" "}
                  <strong className="text-[#2C3E50]">
                    в связке, а не вместо друг друга
                  </strong>{" "}
                  — так достигается скорость, предсказуемость и качество.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Направления */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold tracking-tight text-[#2C3E50] text-center mb-8">
            Чем мы занимаемся
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Megaphone className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                Цифровой маркетинг
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Комплексное продвижение бизнеса в цифровой среде: стратегия,
                контент, аналитика. Видимость там, где ваши клиенты ищут
                решения.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Bot className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                Внедрение искусственного интеллекта
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Автоматизация бизнес-задач с помощью ИИ: генерация текстов,
                дизайна, музыки и видео. Решения, которые экономят часы работы
                каждый день.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Sparkles className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                Generative Engine Optimization
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Адаптация сайтов и контента так, чтобы их лучше «понимали» и
                цитировали генеративные нейросети — ChatGPT, ЯндексGPT и другие.
                EXPERS.ru — флагманский продукт этого подхода.
              </p>
            </div>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Code2 className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                Web-разработка и prompt-инжиниринг
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Разработка сайтов и сервисов с интегрированными ИИ-решениями.
                Профессиональная работа с генеративными моделями на уровне
                инженерии, а не экспериментов.
              </p>
            </div>
          </div>
        </section>

        {/* Принцип */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border-l-4 border-[#0039CA] bg-blue-50/60 px-8 py-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0039CA]/10">
                <Zap className="h-5 w-5 text-[#0039CA]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
                  Наш принцип
                </h3>
                <p className="text-base leading-relaxed text-gray-600">
                  Технологии не заменяют профессионалов — они усиливают их.
                  Каждый проект «ФОНИИ» строится на связке экспертизы человека и
                  возможностей ИИ. Именно поэтому наши решения работают быстро,
                  предсказуемо и качественно.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Контактные данные */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold tracking-tight text-[#2C3E50] text-center mb-8">
            Как с нами связаться
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0039CA]/10">
                  <MapPin className="h-6 w-6 text-[#0039CA]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-1.5">Адрес</h3>
              <p className="text-sm text-gray-500">
                111141, г. Москва, пр-кт Зелёный, д. 3а, стр. 1
              </p>
            </div>

            <a
              href="mailto:info@fonai.ru"
              className="card-hover rounded-2xl border border-gray-100 bg-white p-6 text-center block"
            >
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0039CA]/10">
                  <Mail className="h-6 w-6 text-[#0039CA]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-1.5">Email</h3>
              <p className="text-sm text-[#0039CA] font-medium">
                info@fonai.ru
              </p>
            </a>

            <a
              href="tel:+74953243088"
              className="card-hover rounded-2xl border border-gray-100 bg-white p-6 text-center block"
            >
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0039CA]/10">
                  <Phone className="h-6 w-6 text-[#0039CA]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-1.5">Телефон</h3>
              <p className="text-sm text-[#0039CA] font-medium">
                +7 (495) 324-30-88
              </p>
            </a>

            <div className="card-hover rounded-2xl border border-gray-100 bg-white p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0039CA]/10">
                  <Clock className="h-6 w-6 text-[#0039CA]" />
                </div>
              </div>
              <h3 className="font-semibold text-[#2C3E50] mb-1.5">
                Режим работы
              </h3>
              <p className="text-sm text-gray-500">пн–пт 10:00–18:00 (МСК)</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-[#0039CA]" />
                <h3 className="font-semibold text-[#2C3E50]">
                  По вопросам публикаций
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Хотите опубликовать экспертную статью или создать страницу
                автора? Зарегистрируйтесь на сайте и воспользуйтесь мастером
                публикации — либо напишите нам, и мы поможем на каждом шаге.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="h-5 w-5 text-[#0039CA]" />
                <h3 className="font-semibold text-[#2C3E50]">
                  По вопросам сотрудничества
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                Реклама в каталоге, корпоративные пакеты для команд экспертов,
                внедрение GEO-подхода для вашего бизнеса — напишите нам на
                email, и мы обсудим детали.
              </p>
            </div>
          </div>
        </section>

        {/* Реквизиты */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-5 w-5 text-[#0039CA]" />
              <h2 className="text-xl font-bold tracking-tight text-[#2C3E50]">
                Реквизиты
              </h2>
            </div>
            <dl className="grid gap-y-2.5 gap-x-6 sm:grid-cols-[240px_1fr] text-sm text-gray-600">
              <dt className="font-medium text-[#2C3E50]">Наименование</dt>
              <dd>ООО «ФОНИИ»</dd>
              <dt className="font-medium text-[#2C3E50]">
                Юридический / фактический адрес
              </dt>
              <dd>111141, г. Москва, пр-кт Зелёный, д. 3а, стр. 1</dd>
              <dt className="font-medium text-[#2C3E50]">ИНН / КПП</dt>
              <dd>7720943604 / 772001001</dd>
              <dt className="font-medium text-[#2C3E50]">ОГРН</dt>
              <dd>1257700013141</dd>
              <dt className="font-medium text-[#2C3E50]">ОКВЭД</dt>
              <dd>62.01</dd>
              <dt className="font-medium text-[#2C3E50]">Расчётный счёт</dt>
              <dd>40702810738710001105</dd>
              <dt className="font-medium text-[#2C3E50]">Банк</dt>
              <dd>ПАО Сбербанк</dd>
              <dt className="font-medium text-[#2C3E50]">Корр. счёт</dt>
              <dd>30101810400000000225</dd>
              <dt className="font-medium text-[#2C3E50]">БИК</dt>
              <dd>044525225</dd>
              <dt className="font-medium text-[#2C3E50]">
                Генеральный директор
              </dt>
              <dd>
                Потапов Алексей Станиславович, действует на основании Устава
              </dd>
              <dt className="font-medium text-[#2C3E50]">Сайт / email</dt>
              <dd>www.fonai.ru / info@fonai.ru</dd>
            </dl>
            <p className="text-xs text-gray-400 mt-6">
              Документы:{" "}
              <Link href="/offer" className="text-[#0039CA] hover:underline">
                Публичная оферта
              </Link>
              {" · "}
              <Link href="/privacy" className="text-[#0039CA] hover:underline">
                Политика обработки персональных данных
              </Link>
              {" · "}
              <Link href="/refund" className="text-[#0039CA] hover:underline">
                Условия возврата
              </Link>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl bg-[#0039CA] px-6 py-10 sm:px-10 text-center relative overflow-hidden">
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Знакомство лучше начать с каталога
              </h2>
              <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
                Посмотрите, как работает EXPERS.ru: структурированные экспертные
                статьи, страницы авторов и GEO-оптимизация в действии.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0039CA] hover:bg-blue-50 transition-colors"
                >
                  Смотреть каталог
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/articles/new"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <PenSquare className="h-4 w-4" />
                  Опубликовать статью
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
