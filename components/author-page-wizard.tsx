"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { transliterate } from "@/lib/translit";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Save,
  Plus,
  Trash2,
  User,
  GraduationCap,
  Award,
  Briefcase,
  FileText,
  Globe,
  MessageSquare,
  Star,
  Link,
  HelpCircle,
} from "lucide-react";

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Publication {
  title: string;
  url?: string;
  date?: string;
  description?: string;
}

interface Achievement {
  title: string;
  date?: string;
  description?: string;
}

interface MediaMention {
  outlet: string;
  title: string;
  url?: string;
  date?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface Testimonial {
  name: string;
  role?: string;
  text: string;
  avatar?: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface AuthorPageData {
  name: string;
  avatar: string;
  bio: string;
  credentials: { title: string; organization?: string; year?: string }[];
  expertise: { area: string; description?: string }[];
  workExperience: WorkExperience[];
  publications: Publication[];
  achievements: Achievement[];
  mediaMentions: MediaMention[];
  socialLinks: SocialLink[];
  faq: FAQItem[];
  testimonials: Testimonial[];
  callToAction: string;
}

type WizardStep = {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  geoHint: string;
};

const STEPS: WizardStep[] = [
  {
    id: 1,
    label: "Имя и bio",
    icon: User,
    geoHint:
      "Имя и bio формируют Schema.org Person — основу для AI-поисковиков",
  },
  {
    id: 2,
    label: "Образование",
    icon: GraduationCap,
    geoHint:
      "Сертификаты попадают в EducationalOccupationalCredential — сигнал E-E-A-T",
  },
  {
    id: 3,
    label: "Экспертиза",
    icon: Award,
    geoHint:
      "Области экспертизы через knowsAbout + DefinedTerm — ключ к тематическому ранжированию",
  },
  {
    id: 4,
    label: "Опыт работы",
    icon: Briefcase,
    geoHint:
      "workLocation и alumniOf в Schema.org подтверждают практический опыт",
  },
  {
    id: 5,
    label: "Публикации",
    icon: FileText,
    geoHint: "Внешние citation-ссылки повышают авторитетность в AI-индексах",
  },
  {
    id: 6,
    label: "Достижения",
    icon: Award,
    geoHint: "award в Schema.org — прямой сигнал признания в отрасли",
  },
  {
    id: 7,
    label: "Упоминания в СМИ",
    icon: Globe,
    geoHint: "mentions в Schema.org + внешние ссылки на авторитетные медиа",
  },
  {
    id: 8,
    label: "Соцсети и контакты",
    icon: Link,
    geoHint: "sameAs в Schema.org связывает профили для entity resolution",
  },
  {
    id: 9,
    label: "FAQ",
    icon: MessageSquare,
    geoHint:
      "FAQPage с Question/Answer — самый цитируемый формат AI-сниппетами",
  },
  {
    id: 10,
    label: "Отзывы",
    icon: Star,
    geoHint: "Review в Schema.org — social proof повышает trust-score для AI",
  },
  {
    id: 11,
    label: "Призыв к действию",
    icon: MessageSquare,
    geoHint: "Явный CTA улучшает click-through из AI-сниппетов",
  },
  {
    id: 12,
    label: "Предпросмотр",
    icon: Eye,
    geoHint: "Проверьте Schema.org разметку и внешний вид перед публикацией",
  },
];

export function AuthorPageWizard() {
  const { expert } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<AuthorPageData>(() => ({
    name: expert?.name ?? "",
    avatar: expert?.avatar ?? "",
    bio: expert?.bio ?? "",
    credentials:
      expert?.credentials?.map((c) => ({
        title: c,
        organization: "",
        year: "",
      })) ?? [],
    expertise:
      expert?.expertise?.map((e) => ({ area: e, description: "" })) ?? [],
    workExperience: expert?.workExperience ?? [],
    publications: expert?.publications ?? [],
    achievements: expert?.achievements ?? [],
    mediaMentions: expert?.mediaMentions ?? [],
    socialLinks: expert?.socialLinks ?? [],
    faq: expert?.faq ?? [],
    testimonials: expert?.testimonials ?? [],
    callToAction: expert?.callToAction ?? "",
  }));

  const update = useCallback(
    <K extends keyof AuthorPageData>(key: K, value: AuthorPageData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  if (!expert) return null;

  const stepDef = STEPS[step - 1];
  const isLast = step === 12;

  const handleSave = async () => {
    setSaving(true);
    try {
      const slug = transliterate(
        data.name.toLowerCase().replace(/\s+/g, "-")
      ).slice(0, 80);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const saveRes = await fetch("/api/author-page", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          authorPageSlug: slug,
          authorPagePublished: true,
        }),
      });

      if (!saveRes.ok) throw new Error("Ошибка сохранения");
      toast.success("Страница автора опубликована!");
    } catch {
      toast.error("Ошибка при сохранении");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3E50]">
            Создание страницы автора
          </h2>
          <p className="text-sm text-gray-400">
            Шаг {step} из 12: {stepDef.label}
          </p>
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Назад
            </Button>
          )}
          {!isLast && (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Далее <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {isLast && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Сохранение..." : "Опубликовать страницу"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 overflow-x-auto w-full">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              step === s.id
                ? "bg-white text-[#2C3E50] shadow-sm"
                : step > s.id
                  ? "text-[#0039CA] hover:text-[#0039CA]/80"
                  : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {step > s.id ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0039CA] text-[10px] text-white">
                ✓
              </span>
            ) : (
              <s.icon className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 text-[#0039CA] mt-0.5 shrink-0" />
          <p className="text-sm text-[#0039CA]/80">{stepDef.geoHint}</p>
        </div>
      </div>

      <div className="min-h-[300px]">
        {step === 1 && <StepNameBio data={data} update={update} />}
        {step === 2 && <StepCredentials data={data} update={update} />}
        {step === 3 && <StepExpertise data={data} update={update} />}
        {step === 4 && <StepWorkExperience data={data} update={update} />}
        {step === 5 && <StepPublications data={data} update={update} />}
        {step === 6 && <StepAchievements data={data} update={update} />}
        {step === 7 && <StepMediaMentions data={data} update={update} />}
        {step === 8 && <StepSocialLinks data={data} update={update} />}
        {step === 9 && <StepFAQ data={data} update={update} />}
        {step === 10 && <StepTestimonials data={data} update={update} />}
        {step === 11 && <StepCTA data={data} update={update} />}
        {step === 12 && <StepPreview data={data} />}
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function DynList<T>({
  items,
  onChange,
  fields,
  labels,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: string[];
  labels: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex gap-2 items-start rounded-lg border border-gray-100 p-3 bg-gray-50/50"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fields.map((f) => (
              <Input
                key={f}
                placeholder={labels[f]}
                value={(item as Record<string, string | undefined>)[f] ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  (next[i] as Record<string, string | undefined>)[f] =
                    e.target.value;
                  onChange(next);
                }}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-red-400 hover:text-red-600 shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const empty: Record<string, string | undefined> = {};
          fields.forEach((f) => (empty[f] = ""));
          onChange([...items, empty as unknown as T]);
        }}
        className="text-[#0039CA]"
      >
        <Plus className="h-4 w-4 mr-1" /> Добавить
      </Button>
    </div>
  );
}

function StepNameBio({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <FieldGroup label="Имя">
        <Input
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Василий Петров"
        />
      </FieldGroup>
      <FieldGroup label="Фото (URL)">
        <Input
          value={data.avatar}
          onChange={(e) => update("avatar", e.target.value)}
          placeholder="https://..."
        />
      </FieldGroup>
      <FieldGroup label="Bio">
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
          value={data.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="Расскажите о себе: опыт, специализация, достижения..."
          maxLength={2000}
        />
        <p className="text-xs text-gray-400 mt-1">{data.bio.length}/2000</p>
      </FieldGroup>
    </div>
  );
}

function StepCredentials({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.credentials}
      onChange={(v) => update("credentials", v)}
      fields={["title", "organization", "year"]}
      labels={{ title: "Название", organization: "Организация", year: "Год" }}
    />
  );
}

function StepExpertise({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.expertise}
      onChange={(v) => update("expertise", v)}
      fields={["area", "description"]}
      labels={{ area: "Область", description: "Описание" }}
    />
  );
}

function StepWorkExperience({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.workExperience}
      onChange={(v) =>
        update("workExperience", v as unknown as WorkExperience[])
      }
      fields={["company", "position", "startDate", "endDate", "description"]}
      labels={{
        company: "Компания",
        position: "Должность",
        startDate: "Начало",
        endDate: "Конец",
        description: "Описание",
      }}
    />
  );
}

function StepPublications({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.publications}
      onChange={(v) => update("publications", v as unknown as Publication[])}
      fields={["title", "url", "date", "description"]}
      labels={{
        title: "Название",
        url: "Ссылка",
        date: "Дата",
        description: "Описание",
      }}
    />
  );
}

function StepAchievements({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.achievements}
      onChange={(v) => update("achievements", v as unknown as Achievement[])}
      fields={["title", "date", "description"]}
      labels={{ title: "Название", date: "Дата", description: "Описание" }}
    />
  );
}

function StepMediaMentions({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.mediaMentions}
      onChange={(v) => update("mediaMentions", v as unknown as MediaMention[])}
      fields={["outlet", "title", "url", "date"]}
      labels={{
        outlet: "Издание",
        title: "Заголовок",
        url: "Ссылка",
        date: "Дата",
      }}
    />
  );
}

function StepSocialLinks({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.socialLinks}
      onChange={(v) => update("socialLinks", v as unknown as SocialLink[])}
      fields={["platform", "url"]}
      labels={{ platform: "Платформа", url: "Ссылка" }}
    />
  );
}

function StepFAQ({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.faq}
      onChange={(v) => update("faq", v as unknown as FAQItem[])}
      fields={["question", "answer"]}
      labels={{ question: "Вопрос", answer: "Ответ" }}
    />
  );
}

function StepTestimonials({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <DynList
      items={data.testimonials}
      onChange={(v) => update("testimonials", v as unknown as Testimonial[])}
      fields={["name", "role", "text"]}
      labels={{ name: "Имя", role: "Роль", text: "Текст отзыва" }}
    />
  );
}

function StepCTA({
  data,
  update,
}: {
  data: AuthorPageData;
  update: <K extends keyof AuthorPageData>(k: K, v: AuthorPageData[K]) => void;
}) {
  return (
    <FieldGroup label="Текст призыва к действию">
      <textarea
        className="w-full min-h-[80px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
        value={data.callToAction}
        onChange={(e) => update("callToAction", e.target.value)}
        placeholder="Например: Запишитесь на консультацию или Свяжитесь для сотрудничества"
        maxLength={500}
      />
    </FieldGroup>
  );
}

function StepPreview({ data }: { data: AuthorPageData }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-xl font-bold text-[#0039CA]">
            {data.name?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#2C3E50]">{data.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {data.bio?.slice(0, 150)}...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.expertise.length > 0 && (
            <PreviewBadge label="Экспертиза" count={data.expertise.length} />
          )}
          {data.credentials.length > 0 && (
            <PreviewBadge label="Сертификаты" count={data.credentials.length} />
          )}
          {data.workExperience.length > 0 && (
            <PreviewBadge label="Опыт" count={data.workExperience.length} />
          )}
          {data.publications.length > 0 && (
            <PreviewBadge label="Публикации" count={data.publications.length} />
          )}
          {data.achievements.length > 0 && (
            <PreviewBadge label="Достижения" count={data.achievements.length} />
          )}
          {data.mediaMentions.length > 0 && (
            <PreviewBadge label="СМИ" count={data.mediaMentions.length} />
          )}
          {data.faq.length > 0 && (
            <PreviewBadge label="FAQ" count={data.faq.length} />
          )}
          {data.testimonials.length > 0 && (
            <PreviewBadge label="Отзывы" count={data.testimonials.length} />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-[#2C3E50] mb-2">
          Schema.org JSON-LD
        </h4>
        <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(generateSchemaOrg(data), null, 2)}
        </pre>
      </div>
    </div>
  );
}

function PreviewBadge({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="block font-semibold text-[#2C3E50]">{count}</span>
    </div>
  );
}

function generateSchemaOrg(data: AuthorPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    description: data.bio,
    knowsAbout: data.expertise.map((e) => e.area),
    ...(data.credentials.length > 0 && {
      hasCredential: data.credentials.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.title,
        ...(c.organization && {
          recognizedBy: { "@type": "Organization", name: c.organization },
        }),
      })),
    }),
    ...(data.socialLinks.length > 0 && {
      sameAs: data.socialLinks.map((l) => l.url),
    }),
    ...(data.achievements.length > 0 && {
      award: data.achievements.map((a) => a.title),
    }),
    ...(data.workExperience.length > 0 && {
      alumniOf: data.workExperience.map((w) => ({
        "@type": "Organization",
        name: w.company,
      })),
    }),
    ...(data.publications.length > 0 && {
      citation: data.publications.map((p) => ({
        "@type": "CreativeWork",
        name: p.title,
        url: p.url,
        datePublished: p.date,
      })),
    }),
    ...(data.faq.length > 0 && {
      mainEntity: {
        "@type": "FAQPage",
        mainEntity: data.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    }),
    ...(data.testimonials.length > 0 && {
      review: data.testimonials.map((t) => ({
        "@type": "Review",
        author: { "@type": "Person", name: t.name, jobTitle: t.role },
        reviewBody: t.text,
      })),
    }),
  };
}
