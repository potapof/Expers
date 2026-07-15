import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  Search,
  Quote,
  UserCheck,
  FileText,
  Link2,
  Sparkles,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  FolderTree,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Layers,
  Globe,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "О каталоге — EXPERS.ru",
  description:
    "EXPERS.ru — инфраструктура экспертной видимости в эпоху AI-поиска. Generative Engine Optimization для экспертов и бизнеса.",
};

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-[#2C3E50] mb-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0039CA]/10">
        <Icon className="h-5 w-5 text-[#0039CA]" />
      </span>
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="gradient-hero-vibrant pattern-grid relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0039CA]/10 px-4 py-1.5 text-sm font-medium text-[#0039CA] backdrop-blur mb-6">
            <Sparkles className="h-4 w-4" />
            Generative Engine Optimization
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2C3E50] mb-5">
            О каталоге EXPERS.ru
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Инфраструктура экспертной видимости в эпоху AI-поиска
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-14 space-y-16">
        {/* Поиск изменился */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeading icon={Search}>
            Поиск изменился. А ваш контент — нет
          </SectionHeading>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              Пользователи всё реже кликают по ссылкам в поисковой выдаче.
              Вместо этого они получают готовый ответ от ChatGPT, Perplexity,
              Gemini, Яндекс.Гид или другой AI-модели. Этот ответ составлен
              откуда-то — из ваших статей или из статей ваших конкурентов. И вот
              в чём ключевой момент: AI не просто индексирует страницы, он ищет
              на них <strong className="text-[#2C3E50]">экспертность</strong> —
              автора с доказанной компетенцией, статьи которого можно цитировать
              и на которого можно ссылаться.
            </p>
            <div className="rounded-xl border-l-4 border-[#0039CA] bg-blue-50/60 px-5 py-4">
              <p className="text-[#2C3E50]">
                Если на вашем сайте нет структурированной страницы
                автора-эксперта с превью экспертных статей, AI-система не сможет
                подтвердить вашу экспертность. А значит, не станет цитировать
                ваши материалы в своих ответах.
              </p>
            </div>
            <p>
              Вот почему EXPERS.ru создан именно для этого — чтобы дать
              экспертам и бизнесу инфраструктуру, которая работает не только для
              людей, но и для искусственного интеллекта.
            </p>
          </div>
        </section>

        {/* GEO */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeading icon={Bot}>
            Что такое Generative Engine Optimization (GEO)
          </SectionHeading>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              Generative Engine Optimization — это следующий этап после SEO.
              Если классическое SEO оптимизирует страницы для поисковых роботов,
              то GEO оптимизирует контент для генеративных систем — ChatGPT,
              Perplexity, Gemini, Яндекс.Гид и других AI-моделей, которые сейчас
              являются основным источником информации для миллионов
              пользователей.
            </p>
            <p>
              GEO означает, что ваша статья должна быть не просто индексируемой,
              а <strong className="text-[#2C3E50]">цитируемой</strong>. Не
              просто найденной, а использованной как источник при формировании
              AI-ответа. Для этого нужны четыре элемента:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 my-6">
              {[
                { icon: Layers, label: "Ясная структура" },
                { icon: FileText, label: "Смысловая полнота" },
                {
                  icon: UserCheck,
                  label: "Подтверждённая экспертность автора",
                },
                { icon: Bot, label: "Машинная считываемость" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="card-hover flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0039CA]/10">
                    <item.icon className="h-4 w-4 text-[#0039CA]" />
                  </span>
                  <span className="text-sm font-medium text-[#2C3E50]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p>
              Именно последнее — подтверждение экспертности автора — сейчас
              является самым слабым звеном у большинства сайтов.
            </p>
            <p>
              Когда AI-система читает статью, она ищет в микроразметке ссылку на
              аккаунт автора. Не просто имя в шапке статьи, а именно ссылку на
              страницу, где видно: это эксперт, у него есть набор экспертных
              статей, на них можно опираться. Если такой ссылки нет —
              вероятность попасть в AI-ответ снижается кратно.
            </p>
          </div>
        </section>

        {/* Проблема */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeading icon={UserCheck}>
            Проблема: где создать страницу автора-эксперта
          </SectionHeading>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              Допустим, вы написали ряд экспертных статей и хотите, чтобы AI их
              цитировал. Вам нужна страница автора-эксперта — специальный
              профиль с превью ваших статей, который AI может прочесть и понять:
              да, это настоящий эксперт в своей области. Где же её создать?
            </p>

            <div className="space-y-3 my-6">
              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                  <h3 className="font-semibold text-[#2C3E50]">LinkedIn</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Крупнейшая профессиональная соцсеть в мире. Но для российского
                  бизнеса это не работает. Русскоязычная аудитория минимальна,
                  платформа ориентирована на международный рынок, а формат
                  профиля не подходит для публикации длинных экспертных статей
                  со структурой, понятной AI. LinkedIn — это резюме и короткие
                  посты, а не каталог экспертных материалов.
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                  <h3 className="font-semibold text-[#2C3E50]">ТенЧат</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Российская платформа, но с сильным фокусом на медийную
                  рекламу, новости и развлечения. Для
                  профессионалов-производителей, консультантов, руководителей и
                  экспертов в определённых отраслях там просто нет места. Формат
                  платформы не предполагает длинные экспертные статьи,
                  структурированные по темам и отраслям, с микроразметкой для
                  AI-систем.
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                  <h3 className="font-semibold text-[#2C3E50]">
                    Собственный сайт компании
                  </h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  У некоторых экспертов просто нет своего сайта. Даже если сайт
                  есть, на нём редко есть специальная страница автора с превью
                  экспертных статей, оптимизированная под AI-считывание. И
                  главное — сайт компании не является независимым источником в
                  глазах AI: контент на нём воспринимается как рекламный, а не
                  как экспертный.
                </p>
              </div>

              <div className="rounded-xl border-2 border-[#0039CA]/30 bg-blue-50/40 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1ABC9C] shrink-0" />
                  <h3 className="font-semibold text-[#2C3E50]">EXPERS.ru</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Каталог, специально спроектированный для того, чтобы эксперты
                  могли публиковать статьи, создавать страницу автора с превью
                  экспертных материалов — и получать подтверждённую
                  экспертность, которую AI-системы будут доверять и цитировать.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Как это работает */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeading icon={Link2}>
            Как это работает: путь статьи в AI-ответ
          </SectionHeading>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <div className="space-y-0 my-2">
              {[
                {
                  n: 1,
                  text: "Вы публикуете экспертную статью на EXPERS.ru — с ясной структурой, оптимизированной под AI-считывание.",
                },
                {
                  n: 2,
                  text: "В микроразметке статьи указана ссылка на вашу страницу автора: имя, регалии, компетенции и превью всех ваших экспертных статей.",
                },
                {
                  n: 3,
                  text: "AI-система читает статью, переходит на страницу автора и убеждается: это настоящий эксперт с доказанной компетенцией.",
                },
                {
                  n: 4,
                  text: "Ваша статья попадает в AI-ответ как авторитетный источник. Ваш бренд усиливается и в традиционном поиске, и в генеративном.",
                },
              ].map((step, i, arr) => (
                <div key={step.n} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-sm font-bold text-white">
                      {step.n}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="w-px flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <p className="pb-8 pt-1.5 text-gray-600">{step.text}</p>
                </div>
              ))}
            </div>
            <p>
              Это не теория. Сейчас AI-системы активно используют
              структурированные данные (Schema.org, Open Graph, микроразметка)
              для определения достоверности источника. Если на странице есть
              разметка Person со ссылкой на профиль эксперта — это сигнал для
              AI, что материалу можно доверять. Именно эту разметку и структуру
              EXPERS.ru предоставляет из коробки.
            </p>
          </div>
        </section>

        {/* Автор и компания */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0039CA]/10 mb-4">
                <Users className="h-5 w-5 text-[#0039CA]" />
              </div>
              <h2 className="text-xl font-bold text-[#2C3E50] mb-3">
                Что получает автор-эксперт
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  Публикация на EXPERS.ru — это превращение вашей экспертизы в
                  цифровой актив, который работает на вас круглосуточно. Вы
                  получаете страницу автора-эксперта, которую можно указать в
                  микроразметке любого сайта, где вы публикуетесь. Эта страница
                  подтверждает вашу экспертность для любой AI-системы.
                </p>
                <p>
                  Ваши статьи получают шанс быть процитированными в AI-ответах:
                  органический трафик, доверие к личному бренду, видимость в
                  новой среде поиска. Такой материал работает на вас долгое
                  время, а не пропадает через неделю после публикации.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1ABC9C]/10 mb-4">
                <Building2 className="h-5 w-5 text-[#1ABC9C]" />
              </div>
              <h2 className="text-xl font-bold text-[#2C3E50] mb-3">
                Что получает компания
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  Когда руководители и сотрудники компании публикуют экспертные
                  статьи на EXPERS.ru, компания получает независимое
                  подтверждение экспертности. Это не реклама на собственном
                  сайте, а независимая платформа, где ваши эксперты — признанные
                  авторитеты.
                </p>
                <p>
                  Это особенно важно для B2B: если потенциальный клиент
                  спрашивает у AI-ассистента о решении в вашей нише — и получает
                  ответ с цитатой из вашей статьи — это сильнейший сигнал
                  доверия прямо в момент принятия решения. При этом контент
                  поддерживает и SEO, и GEO одновременно.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Для кого */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeading icon={Briefcase}>
            Для кого создан каталог
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 mb-5">
            {[
              {
                icon: TrendingUp,
                title: "Руководителям",
                text: "которым нужно подтвердить экспертность компании в новой среде поиска",
              },
              {
                icon: Sparkles,
                title: "Маркетологам",
                text: "которые разрабатывают контент-стратегию с учётом AI-каналов продвижения",
              },
              {
                icon: UserCheck,
                title: "Экспертам и консультантам",
                text: "которые развивают личный бренд и хотят цитируемости в AI-ответах",
              },
              {
                icon: Briefcase,
                title: "B2B-командам",
                text: "которым нужен контент для доверия и поддержки продаж на длинном цикле сделки",
              },
              {
                icon: Building2,
                title: "Производителям",
                text: "которым негде было показать свою экспертность онлайн",
              },
              {
                icon: Globe,
                title: "Предпринимателям",
                text: "в формате, понятном и людям, и искусственному интеллекту",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card-hover rounded-xl border border-gray-100 bg-white p-4"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <item.icon className="h-4.5 w-4.5 text-[#0039CA] shrink-0" />
                  <h3 className="text-sm font-semibold text-[#2C3E50]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <p className="text-base leading-relaxed text-gray-600">
            Если вы пишете экспертные статьи — вам нужно место, где они будут не
            просто храниться, а работать на вас. Где они будут структурированы
            так, чтобы AI их читал, понимал и цитировал. Именно это делает
            EXPERS.ru.
          </p>
        </section>

        {/* Почему удобен */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SectionHeading icon={FolderTree}>
            Почему каталог удобен
          </SectionHeading>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              EXPERS.ru построен не как случайная лента публикаций, а как
              структурированная экспертная среда. Каталог объединяет материалы
              по <strong className="text-[#2C3E50]">13 отраслям бизнеса</strong>
              , что позволяет AI-системам лучше понимать контекст каждой статьи
              и определять её релевантность. Логичная организация по темам и
              отраслям — это не только удобство для человека, но и сигнал для
              AI, что это серьёзная экспертная платформа, а не случайный блог.
            </p>
            <p>
              Пользователь получает удобную навигацию по темам, статьи,
              сгруппированные по смыслу, и материалы, которые можно
              непосредственно использовать в работе. AI-система получает
              структурированный, связанный контент с подтверждёнными авторами —
              идеальную базу для формирования ответов.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl bg-[#0039CA] px-6 py-10 sm:px-10 text-center relative overflow-hidden">
            <div className="relative">
              <div className="flex justify-center mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                EXPERS.ru — инфраструктура видимости
              </h2>
              <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-3">
                Бизнесу сейчас важно быть не просто в интернете, а{" "}
                <strong className="text-white">в ответе</strong>. В ответе
                поисковика, AI-ассистента, чат-модели, профессионального
                дайджеста. И чтобы попасть в этот ответ, недостаточно просто
                писать хорошие статьи — нужна подтверждённая экспертность
                автора.
              </p>
              <p className="text-white/80 leading-relaxed max-w-2xl mx-auto mb-8">
                Публикуйте экспертные статьи. Создавайте страницу автора с
                превью экспертных статей. Указывайте ссылку на неё в
                микроразметке своих сайтов. И AI будет цитировать вас и доверять
                вашим материалам. EXPERS.ru — это не архив статей. Это
                инфраструктура видимости, доверия и экспертного влияния в новой
                реальности поиска.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0039CA] hover:bg-blue-50 transition-colors"
                >
                  Смотреть каталог статей
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/articles/new"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Quote className="h-4 w-4" />
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
