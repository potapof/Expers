"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { transliterate } from "@/lib/translit";
import { getIndustrySlug } from "@/lib/industry-slugs";
import {
  industries,
  articles as staticArticles,
  type Article,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  Plus,
  Trash2,
  Building2,
  Landmark,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Car,
  Monitor,
  Home,
  Zap,
  Plane,
  Radio,
  Wheat,
  Leaf,
  Lightbulb,
  CheckCheck,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Target,
  ListChecks,
  HelpCircle,
  ExternalLink,
  BarChart3,
  GraduationCap as GraduationCapIcon,
  Clock,
  User,
  X,
  PenSquare,
  ImageIcon,
} from "lucide-react";
import { TbankPaymentDialog } from "./tbank-payment-dialog";
import {
  getIndustryById,
  getCategory,
  articleIcons,
  estimateReadTime,
} from "@/lib/article-utils";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
  step10Schema,
} from "@/lib/validation";
import {
  SectionCardBuilder,
  ArticleSection,
  buildContentFromSections,
} from "./section-card-builder";

type WizardStep = {
  id: number;
  label: string;
};

const WIZARD_STEPS: WizardStep[] = [
  { id: 1, label: "Отрасль" },
  { id: 2, label: "Подсектор" },
  { id: 3, label: "Категория" },
  { id: 4, label: "Экспертиза" },
  { id: 5, label: "Ссылки" },
  { id: 6, label: "Заголовок" },
  { id: 7, label: "Текст" },
  { id: 8, label: "FAQ" },
  { id: 9, label: "Чеклист" },
  { id: 10, label: "Данные" },
  { id: 11, label: "Предпросмотр" },
  { id: 12, label: "Публикация" },
];

interface WizardData {
  industryId: string;
  industryName: string;
  subsectionId: string;
  subsectionName: string;
  categoryId: string;
  categoryName: string;
  customCategory: string;
  expertiseAreas: string[];
  crossLinks: { articleId: string; title: string; industryId: string }[];
  title: string;
  slug: string;
  introduction: string;
  content: string;
  faq: { question: string; answer: string }[];
  todo: { text: string; done: boolean }[];
  tldr: string;
  keyFacts: { icon: string; text: string }[];
  definition: string;
  featuredSnippet: { question: string; answer: string };
  problemSolutionResult: { problem: string; solution: string; result: string };
  howTo: { title: string; description: string }[];
  methodology: string;
  sources: { title: string; url: string }[];
  sections: ArticleSection[];
}

const defaultData: WizardData = {
  industryId: "",
  industryName: "",
  subsectionId: "",
  subsectionName: "",
  categoryId: "",
  categoryName: "",
  customCategory: "",
  expertiseAreas: [],
  crossLinks: [],
  title: "",
  slug: "",
  introduction: "",
  content: "",
  faq: [
    { question: "", answer: "" },
    { question: "", answer: "" },
    { question: "", answer: "" },
  ],
  todo: [{ text: "", done: false }],
  tldr: "",
  keyFacts: [
    { icon: "chart", text: "" },
    { icon: "eye", text: "" },
    { icon: "tool", text: "" },
  ],
  definition: "",
  featuredSnippet: { question: "", answer: "" },
  problemSolutionResult: { problem: "", solution: "", result: "" },
  howTo: [{ title: "", description: "" }],
  methodology: "",
  sources: [{ title: "", url: "" }],
  sections: [
    {
      id: "section-1",
      title: "Введение",
      description: "Краткое введение в тему статьи",
      design: "image-right",
      text: "Это пример текста для раздела статьи. Здесь вы можете описать основные концепции и идеи, которые будут раскрыты в данном разделе. Используйте инструменты форматирования для выделения <strong>важных моментов</strong> и <em>акцентов</em>.",
      imageRatio: 45,
      tableData: { headers: [], rows: [] },
    },
    {
      id: "section-2",
      title: "Основная часть",
      description: "",
      design: "text-only",
      text: "Это текстовый раздел без изображения. Здесь можно разместить подробное описание, анализ данных или теоретические выкладки. Форматируйте текст с помощью панели инструментов, которая появляется при выделении текста.",
      imageRatio: 50,
      tableData: { headers: [], rows: [] },
    },
    {
      id: "section-3",
      title: "Визуальный блок",
      description: "",
      design: "image-only",
      text: "",
      imageRatio: 100,
      tableData: { headers: [], rows: [] },
    },
    {
      id: "section-4",
      title: "Анализ и выводы",
      description: "Основные результаты исследования",
      design: "image-left",
      text: "В этом разделе текст расположен справа от изображения. Это удобно для представления анализа данных, где визуальный элемент служит опорой для текстового описания.",
      imageRatio: 45,
      tableData: { headers: [], rows: [] },
    },
    {
      id: "section-5",
      title: "Сравнительная таблица",
      description: "",
      design: "table",
      text: "",
      imageRatio: 50,
      tableData: {
        headers: ["Параметр", "Вариант А", "Вариант Б"],
        rows: [
          ["Характеристика 1", "Значение А1", "Значение Б1"],
          ["Характеристика 2", "Значение А2", "Значение Б2"],
          ["Характеристика 3", "Значение А3", "Значение Б3"],
        ],
      },
    },
  ],
};

const STORAGE_KEY = "expers-wizard-draft";

const EMPTY_VALUES = {
  INDUSTRY_ID: "none",
  INDUSTRY_NAME: "Без отрасли",
  SUBSECTION_ID: "none",
  SUBSECTION_NAME: "Без подсектора",
  CATEGORY_ID: "none",
  CATEGORY_NAME: "Без категории",
  EXPERTISE_DEFAULT: "Общая экспертиза",
} as const;

const industryIcons: Record<string, React.ReactNode> = {
  manufacturing: <Building2 className="h-5 w-5" />,
  finance: <Landmark className="h-5 w-5" />,
  healthcare: <HeartPulse className="h-5 w-5" />,
  retail: <ShoppingBag className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  automotive: <Car className="h-5 w-5" />,
  "it-tech": <Monitor className="h-5 w-5" />,
  "real-estate": <Home className="h-5 w-5" />,
  energy: <Zap className="h-5 w-5" />,
  tourism: <Plane className="h-5 w-5" />,
  "media-entertainment": <Radio className="h-5 w-5" />,
  "agri-food": <Wheat className="h-5 w-5" />,
  "ecology-climate": <Leaf className="h-5 w-5" />,
};

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ArticleWizardClient() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [createdArticleId, setCreatedArticleId] = useState<string | null>(null);
  const [payment, setPayment] = useState<{
    paymentUrl: string;
    orderId: string;
  } | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => {
          const merged = { ...prev, ...parsed };
          if (
            merged.sections &&
            Array.isArray(merged.sections) &&
            merged.sections.length > 0
          ) {
            merged.content = buildContentFromSections(merged.sections);
          }
          return merged;
        });
      } catch {
        /* ignore */
      }
    }

    const params = new URLSearchParams(window.location.search);
    const importId = params.get("importId");
    if (!importId || !expert) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();
    let cancelled = false;

    fetch(`/api/articles/${importId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) {
          toast.error("Не удалось загрузить черновик статьи");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (cancelled || !data?.article) return;
        const article = data.article;

        const industryId =
          article.industryId === EMPTY_VALUES.INDUSTRY_ID
            ? ""
            : article.industryId;
        const industryName =
          article.industryName === EMPTY_VALUES.INDUSTRY_NAME
            ? ""
            : article.industryName;
        const subsectionId =
          article.subsectionId === EMPTY_VALUES.SUBSECTION_ID
            ? ""
            : article.subsectionId;
        const subsectionName =
          article.subsectionName === EMPTY_VALUES.SUBSECTION_NAME
            ? ""
            : article.subsectionName;
        const categoryId =
          article.categoryId === EMPTY_VALUES.CATEGORY_ID
            ? ""
            : article.categoryId;
        const categoryName =
          article.categoryName === EMPTY_VALUES.CATEGORY_NAME
            ? ""
            : article.categoryName;
        const expertiseAreas =
          article.expertiseAreas?.length === 1 &&
          article.expertiseAreas[0] === EMPTY_VALUES.EXPERTISE_DEFAULT
            ? []
            : article.expertiseAreas || [];

        setData({
          industryId,
          industryName,
          subsectionId,
          subsectionName,
          categoryId,
          categoryName,
          customCategory: article.customCategory || "",
          expertiseAreas,
          crossLinks: article.crossLinks || [],
          title: article.title,
          slug: article.slug || "",
          introduction: article.description,
          content: article.content,
          faq: article.faq || defaultData.faq,
          todo: article.todo || defaultData.todo,
          tldr: article.tldr,
          keyFacts: article.keyFacts || defaultData.keyFacts,
          definition: article.definition,
          featuredSnippet: {
            question: article.featuredSnippet?.question || "",
            answer: article.featuredSnippet?.answer || "",
          },
          problemSolutionResult: {
            problem: article.problemSolutionResult?.problem || "",
            solution: article.problemSolutionResult?.solution || "",
            result: article.problemSolutionResult?.result || "",
          },
          howTo: article.howTo || [],
          methodology: article.methodology,
          sources: article.sources || [],
          sections: defaultData.sections,
        });

        setCreatedArticleId(article.id);
        setStep(11);
        localStorage.removeItem("expers-import-draft");

        window.history.replaceState(
          {},
          "",
          window.location.pathname + `?id=${article.id}`
        );
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Не удалось загрузить черновик статьи");
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [expert]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
  }, []);

  function validateStep(stepNum: number): boolean {
    setErrors({});
    try {
      switch (stepNum) {
        case 1:
          step1Schema.parse({
            industryId: data.industryId,
            industryName: data.industryName,
          });
          break;
        case 2:
          step2Schema.parse({
            subsectionId: data.subsectionId,
            subsectionName: data.subsectionName,
          });
          break;
        case 3:
          step3Schema.parse({
            categoryId: data.categoryId,
            categoryName: data.categoryName,
            customCategory: data.customCategory,
          });
          break;
        case 4:
          step4Schema.parse({
            expertiseAreas: data.expertiseAreas.filter(Boolean),
          });
          break;
        case 5:
          step5Schema.parse({ crossLinks: data.crossLinks });
          break;
        case 6: {
          const wordCount = data.introduction
            .split(/\s+/)
            .filter(Boolean).length;
          if (wordCount < 40) {
            setErrors({
              introduction: `Введение должно быть не менее 40 слов (сейчас ${wordCount})`,
            });
            return false;
          }
          if (wordCount > 60) {
            setErrors({
              introduction: `Введение должно быть не более 60 слов (сейчас ${wordCount})`,
            });
            return false;
          }
          step6Schema.parse({
            title: data.title,
            introduction: data.introduction,
          });
          break;
        }
        case 7: {
          const content = buildContentFromSections(data.sections);
          if (content.length > 150000) {
            setErrors({
              sections: `Текст превышает 150 000 символов (сейчас ${content.length})`,
            });
            return false;
          }
          step7Schema.parse({ content });
          break;
        }
        case 8:
          step8Schema.parse({
            faq: data.faq.filter((f) => f.question && f.answer),
          });
          break;
        case 9:
          step9Schema.parse({ todo: data.todo.filter((t) => t.text) });
          break;
        case 10:
          step10Schema.parse({
            tldr: data.tldr,
            keyFacts: data.keyFacts.filter((f) => f.text),
            definition: data.definition,
            featuredSnippet: data.featuredSnippet,
            problemSolutionResult: data.problemSolutionResult,
            howTo: data.howTo.filter((h) => h.title && h.description),
            methodology: data.methodology,
            sources: data.sources.filter((s) => s.title && s.url),
          });
          break;
      }
      return true;
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err) {
        const zodErr = err as {
          issues: { path: (string | number)[]; message: string }[];
        };
        const newErrors: Record<string, string> = {};
        for (const issue of zodErr.issues) {
          newErrors[issue.path.join(".")] = issue.message;
        }
        setErrors(newErrors);
      }
      return false;
    }
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 12));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  }

  async function handlePublish() {
    setPublishing(true);
    const id = toast.loading("Публикуем статью...");

    try {
      const token = localStorage.getItem("token");

      let articleId = createdArticleId;
      const body = {
        title: data.title,
        description: data.introduction,
        content: data.content,
        industryId: data.industryId,
        industryName: data.industryName,
        subsectionId: data.subsectionId,
        subsectionName: data.subsectionName,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        customCategory: data.customCategory,
        expertiseAreas: data.expertiseAreas.filter(Boolean),
        crossLinks: data.crossLinks,
        tldr: data.tldr,
        keyFacts: data.keyFacts.filter((kf) => kf.text),
        definition: data.definition,
        featuredSnippet: data.featuredSnippet,
        problemSolutionResult: data.problemSolutionResult,
        howTo: data.howTo.filter((h) => h.title),
        faq: data.faq.filter((f) => f.question),
        todo: data.todo.filter((t) => t.text),
        methodology: data.methodology,
        sources: data.sources.filter((s) => s.title),
        ...(data.slug ? { slug: data.slug } : {}),
      };

      if (!articleId) {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });

        const result = await res.json();

        if (res.ok) {
          articleId = result.article?.id;
          const articleStatus = result.article?.status;

          if (articleStatus === "pending_review") {
            localStorage.removeItem(STORAGE_KEY);
            toast.success(
              "Статья отправлена на модерацию. После проверки модератором она будет опубликована в каталоге.",
              { id, duration: 6000 }
            );
            window.location.href = "/cabinet";
            return;
          }

          setCreatedArticleId(articleId);
        } else if (res.status === 503) {
          toast.error(
            "База данных временно недоступна. Черновик сохранён — попробуйте позже.",
            { id }
          );
          return;
        } else {
          toast.error(result.error || "Ошибка создания статьи", { id });
          return;
        }
      }

      const payRes = await fetch("/api/payments/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ articleId }),
      });
      const payData = await payRes.json();
      if (payRes.ok && payData.paymentUrl) {
        toast.dismiss(id);
        setPayment({
          paymentUrl: payData.paymentUrl,
          orderId: payData.orderId,
        });
        setPayDialogOpen(true);
      } else {
        toast.error(payData.error || "Не удалось начать оплату", { id });
      }
    } catch {
      toast.error("Ошибка соединения", { id });
    } finally {
      setPublishing(false);
    }
  }

  function handlePaymentConfirmed() {
    localStorage.removeItem(STORAGE_KEY);
    setPayDialogOpen(false);
    toast.success(
      "Оплата получена! Статья отправлена на модерацию. После проверки она будет опубликована."
    );
    setTimeout(() => {
      window.location.href = "/cabinet";
    }, 800);
  }

  function handlePaymentRejected(message: string) {
    setPayDialogOpen(false);
    toast.error(
      message || "Платёж не прошёл. Попробуйте снова или другую карту."
    );
  }

  if (authLoading) {
    return (
      <div className="mx-auto px-4 max-w-3xl py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100 mb-8" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="mx-auto px-4 max-w-3xl py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-8 w-8 text-[#0039CA]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-3">
          Войдите в систему
        </h1>
        <p className="text-gray-500 mb-6">
          Чтобы опубликовать статью, необходимо войти или зарегистрироваться
        </p>
        <Button onClick={() => router.push("/")}>На главную</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 max-w-4xl py-8">
      <ProgressBar currentStep={step} steps={WIZARD_STEPS} />

      <div className="mt-8">
        {step === 1 && (
          <Step1Sector data={data} updateData={updateData} errors={errors} />
        )}
        {step === 2 && (
          <Step2Subsector data={data} updateData={updateData} errors={errors} />
        )}
        {step === 3 && (
          <Step3Category data={data} updateData={updateData} errors={errors} />
        )}
        {step === 4 && (
          <Step4Expertise data={data} updateData={updateData} errors={errors} />
        )}
        {step === 5 && (
          <Step5CrossLinks
            data={data}
            updateData={updateData}
            errors={errors}
          />
        )}
        {step === 6 && (
          <Step6TitleIntro
            data={data}
            updateData={updateData}
            errors={errors}
          />
        )}
        {step === 7 && (
          <SectionCardBuilder
            sections={data.sections}
            onChange={(sections) => {
              const content = buildContentFromSections(sections);
              updateData({ sections, content });
            }}
            errors={errors}
          />
        )}
        {step === 8 && (
          <Step8Faq data={data} updateData={updateData} errors={errors} />
        )}
        {step === 9 && (
          <Step9Todo data={data} updateData={updateData} errors={errors} />
        )}
        {step === 10 && (
          <Step10StructuredData
            data={data}
            updateData={updateData}
            errors={errors}
          />
        )}
        {step === 11 && <Step11Preview data={data} expertName={expert.name} />}
        {step === 12 && (
          <Step12Publish
            data={data}
            onPublish={handlePublish}
            publishing={publishing}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </Button>

        <span className="text-sm text-gray-400">Шаг {step} из 12</span>

        {step < 11 ? (
          <Button onClick={handleNext} className="gap-2">
            Далее
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : step === 11 ? (
          <Button onClick={() => setStep(12)} className="gap-2">
            К публикации
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="gap-2"
          >
            {publishing ? "Публикуем..." : "Опубликовать"}
            {!publishing && <Send className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <TbankPaymentDialog
        open={payDialogOpen}
        paymentUrl={payment?.paymentUrl || ""}
        orderId={payment?.orderId || ""}
        onOpenChange={setPayDialogOpen}
        onConfirmed={handlePaymentConfirmed}
        onRejected={handlePaymentRejected}
      />
    </div>
  );
}

function ProgressBar({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: WizardStep[];
}) {
  return (
    <div className="hidden sm:block">
      <div className="flex items-center justify-between mb-2">
        {steps.map((s) => (
          <div key={s.id} className="flex items-center flex-1">
            <div
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium shrink-0 transition-colors",
                s.id < currentStep
                  ? "bg-[#27AE60] text-white"
                  : s.id === currentStep
                    ? "bg-[#0039CA] text-white ring-2 ring-[#0039CA]/30"
                    : "bg-gray-100 text-gray-400"
              )}
            >
              {s.id < currentStep ? <Check className="h-4 w-4" /> : s.id}
            </div>
            {s.id < 12 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1",
                  s.id < currentStep ? "bg-[#27AE60]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between px-0.5 mb-6">
        {steps.map((s) => (
          <span
            key={s.id}
            className={cn(
              "text-[10px] font-medium transition-colors",
              s.id === currentStep
                ? "text-[#0039CA]"
                : s.id < currentStep
                  ? "text-[#27AE60]"
                  : "text-gray-300"
            )}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepLabel({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <span className="text-xs font-medium text-[#0039CA] uppercase tracking-wide">
        Шаг {step} из 12
      </span>
      <h2 className="text-2xl font-bold text-[#2C3E50] mt-1 mb-2">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  multiline,
  rows,
  maxLength,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {maxLength && (
            <span className="text-xs text-gray-400 ml-2">
              ({value.length}/{maxLength})
            </span>
          )}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 4}
          maxLength={maxLength}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors resize-y",
            "focus:border-[#0039CA] focus:ring-1 focus:ring-[#0039CA]",
            error ? "border-red-300" : "border-gray-200"
          )}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={error ? "border-red-300" : ""}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Step1Sector({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <StepLabel
        step={1}
        title="Выбор основного сектора"
        description="Выберите отрасль, к которой относится ваша статья"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {industries.map((ind) => {
          const selected = data.industryId === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() =>
                updateData({
                  industryId: ind.id,
                  industryName: ind.name,
                  subsectionId: "",
                  subsectionName: "",
                  categoryId: "",
                  categoryName: "",
                })
              }
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                selected
                  ? "border-[#0039CA] bg-[#0039CA]/10"
                  : "border-gray-100 hover:border-gray-200 bg-white"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  selected
                    ? "bg-[#0039CA] text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {industryIcons[ind.id]}
              </span>
              <span
                className={cn(
                  "font-medium",
                  selected ? "text-[#0039CA]" : "text-[#2C3E50]"
                )}
              >
                {ind.name}
              </span>
              {selected && (
                <Check className="h-5 w-5 text-[#0039CA] ml-auto shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      {errors.industryId && (
        <p className="text-xs text-red-500 mt-2">{errors.industryId}</p>
      )}
    </div>
  );
}

function Step2Subsector({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const ind = getIndustryById(data.industryId);
  if (!ind) {
    return (
      <div className="text-center py-12 text-gray-400">
        Сначала выберите отрасль на шаге 1
      </div>
    );
  }

  return (
    <div>
      <StepLabel
        step={2}
        title="Выбор подсектора"
        description={`Отрасль: ${ind.name} — выберите подсектор`}
      />
      <div className="space-y-2">
        {ind.subsections.map((sub) => {
          const selected = data.subsectionId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() =>
                updateData({
                  subsectionId: sub.id,
                  subsectionName: sub.name,
                  categoryId: "",
                  categoryName: "",
                })
              }
              className={cn(
                "flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all text-left",
                selected
                  ? "border-[#0039CA] bg-[#0039CA]/10"
                  : "border-gray-100 hover:border-gray-200 bg-white"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  selected ? "text-[#0039CA]" : "text-[#2C3E50]"
                )}
              >
                {sub.name}
              </span>
              <span className="text-xs text-gray-400">
                {sub.categories.length} категорий
              </span>
              {selected && (
                <Check className="h-5 w-5 text-[#0039CA] ml-3 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      {errors.subsectionId && (
        <p className="text-xs text-red-500 mt-2">{errors.subsectionId}</p>
      )}
    </div>
  );
}

function Step3Category({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const ind = getIndustryById(data.industryId);
  const sub = ind?.subsections.find((s) => s.id === data.subsectionId);
  const categories = sub?.categories || [];

  return (
    <div>
      <StepLabel
        step={3}
        title="Выбор или создание категории"
        description={`${ind?.name || ""} → ${sub?.name || ""}`}
      />
      <div className="space-y-2 mb-6">
        {categories.map((cat) => {
          const selected = data.categoryId === cat.id && !data.customCategory;
          return (
            <button
              key={cat.id}
              onClick={() =>
                updateData({
                  categoryId: cat.id,
                  categoryName: cat.name,
                  customCategory: "",
                })
              }
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-xl border-2 transition-all text-left",
                selected
                  ? "border-[#0039CA] bg-[#0039CA]/10"
                  : "border-gray-100 hover:border-gray-200 bg-white"
              )}
            >
              <span
                className={cn(
                  "font-medium text-sm",
                  selected ? "text-[#0039CA]" : "text-[#2C3E50]"
                )}
              >
                {cat.name}
              </span>
              {selected && (
                <Check className="h-4 w-4 text-[#0039CA] shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500 mb-2">
          Или создайте свою категорию:
        </p>
        <InputField
          value={data.customCategory}
          onChange={(v) =>
            updateData({
              customCategory: v,
              categoryId: v ? "custom" : "",
              categoryName: v,
            })
          }
          placeholder="Название категории"
          error={errors.categoryId}
        />
      </div>
    </div>
  );
}

function Step4Expertise({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const areas = data.expertiseAreas;

  function addArea() {
    updateData({ expertiseAreas: [...areas, ""] });
  }

  function removeArea(index: number) {
    updateData({ expertiseAreas: areas.filter((_, i) => i !== index) });
  }

  function updateArea(index: number, value: string) {
    const next = [...areas];
    next[index] = value;
    updateData({ expertiseAreas: next });
  }

  return (
    <div>
      <StepLabel
        step={4}
        title="Области экспертизы"
        description="Укажите 3-5 ключевых тем, в которых вы эксперт (например: «ИИ в медицине», «Финтех-регулирование»)"
      />
      <div className="space-y-3">
        {areas.map((area, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
            <InputField
              value={area}
              onChange={(v) => updateArea(index, v)}
              placeholder={`Область экспертизы ${index + 1}`}
              error={errors[`expertiseAreas.${index}`]}
            />
            {areas.length > 3 && (
              <button
                onClick={() => removeArea(index)}
                className="shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {areas.length < 5 && (
        <Button
          variant="outline"
          size="sm"
          onClick={addArea}
          className="mt-3 gap-1"
        >
          <Plus className="h-3 w-3" />
          Добавить область
        </Button>
      )}
      {errors.expertiseAreas && (
        <p className="text-xs text-red-500 mt-2">{errors.expertiseAreas}</p>
      )}
      <p className="text-xs text-gray-400 mt-3">
        {areas.filter(Boolean).length} из 3-5 заполнено
      </p>
    </div>
  );
}

function Step5CrossLinks({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const links = data.crossLinks;

  function addLink(article: Article) {
    if (links.length >= 8) return;
    updateData({
      crossLinks: [
        ...links,
        {
          articleId: article.id,
          title: article.title,
          industryId: article.industryId,
        },
      ],
    });
  }

  function removeLink(index: number) {
    updateData({ crossLinks: links.filter((_, i) => i !== index) });
  }

  const availableArticles = staticArticles.filter(
    (a) => !links.some((l) => l.articleId === a.id)
  );

  return (
    <div>
      <StepLabel
        step={5}
        title="Кросс-функциональные ссылки"
        description="Добавьте 2-8 ссылок на связанные статьи из каталога"
      />
      {links.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Выбранные ссылки ({links.length}/8):
          </p>
          {links.map((link, index) => {
            const ind = getIndustryById(link.industryId);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#0039CA]/10 rounded-lg border border-blue-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2C3E50] truncate">
                    {link.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {ind?.name || link.industryId}
                  </p>
                </div>
                <button
                  onClick={() => removeLink(index)}
                  className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      {links.length < 8 && availableArticles.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Доступные статьи:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableArticles.map((article) => {
              const ind = getIndustryById(article.industryId);
              return (
                <button
                  key={article.id}
                  onClick={() => addLink(article)}
                  disabled={links.length >= 8}
                  className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-white text-left transition-all disabled:opacity-40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C3E50] truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {ind?.name} · {article.author.name}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-[#0039CA] shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>
      )}
      {errors.crossLinks && (
        <p className="text-xs text-red-500 mt-2">{errors.crossLinks}</p>
      )}
      <p className="text-xs text-gray-400 mt-3">
        Добавлено {links.length} из 2-8 ссылок
      </p>
    </div>
  );
}

function Step6TitleIntro({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const wordCount = data.introduction.split(/\s+/).filter(Boolean).length;
  const industrySlug = data.industryId
    ? getIndustrySlug(data.industryId)
    : "otrasl";

  const handleGenerateSlug = () => {
    const slug = transliterate(data.title);
    updateData({ slug });
  };

  return (
    <div>
      <StepLabel
        step={6}
        title="Заголовок и введение"
        description="Придумайте заголовок статьи и напишите введение на 40-60 слов"
      />
      <div className="space-y-6">
        <InputField
          label="Заголовок статьи"
          value={data.title}
          onChange={(v) => updateData({ title: v })}
          placeholder="Например: Как ИИ меняет автоматизацию производства в 2026 году"
          error={errors.title}
          maxLength={200}
        />
        <div>
          <InputField
            label="Введение"
            value={data.introduction}
            onChange={(v) => updateData({ introduction: v })}
            placeholder="Напишите краткое введение, которое заинтересует читателя..."
            multiline
            rows={4}
            maxLength={600}
          />
          <p className="text-xs mt-1">
            {wordCount < 40 ? (
              <span className="text-amber-500">
                Нужно ещё {40 - wordCount} слов (минимум 40)
              </span>
            ) : wordCount <= 60 ? (
              <span className="text-green-500">
                {wordCount} слов — отлично!
              </span>
            ) : (
              <span className="text-red-500">
                {wordCount} слов — превышение (максимум 60)
              </span>
            )}
          </p>
          {errors.introduction && (
            <p className="text-xs text-red-500 mt-1">{errors.introduction}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">
            URL статьи
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Префикс: /{industrySlug}/
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.slug}
              onChange={(e) => updateData({ slug: e.target.value })}
              placeholder="telemedicina-v-rossii"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:ring-1 focus:ring-[#0039CA] outline-none"
              maxLength={200}
            />
            <button
              type="button"
              onClick={handleGenerateSlug}
              disabled={!data.title}
              className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-[#2C3E50] hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Сгенерировать
            </button>
          </div>
          {errors.slug && (
            <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Step8Faq({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const faq = data.faq;

  function addQa() {
    if (faq.length >= 5) return;
    updateData({ faq: [...faq, { question: "", answer: "" }] });
  }

  function removeQa(index: number) {
    updateData({ faq: faq.filter((_, i) => i !== index) });
  }

  function updateQa(
    index: number,
    field: "question" | "answer",
    value: string
  ) {
    const next = [...faq];
    next[index] = { ...next[index], [field]: value };
    updateData({ faq: next });
  }

  return (
    <div>
      <StepLabel
        step={8}
        title="FAQ — часто задаваемые вопросы"
        description="Добавьте 3-5 вопросов и ответов для GEO-блока FAQ"
      />
      <div className="space-y-6">
        {faq.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                Вопрос {index + 1}
              </span>
              {faq.length > 3 && (
                <button
                  onClick={() => removeQa(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <InputField
                value={item.question}
                onChange={(v) => updateQa(index, "question", v)}
                placeholder="Вопрос"
                error={errors[`faq.${index}.question`]}
              />
              <InputField
                value={item.answer}
                onChange={(v) => updateQa(index, "answer", v)}
                placeholder="Ответ"
                multiline
                rows={3}
                error={errors[`faq.${index}.answer`]}
              />
            </div>
          </div>
        ))}
      </div>
      {faq.length < 5 && (
        <Button
          variant="outline"
          size="sm"
          onClick={addQa}
          className="mt-3 gap-1"
        >
          <Plus className="h-3 w-3" />
          Добавить вопрос
        </Button>
      )}
      {errors.faq && <p className="text-xs text-red-500 mt-2">{errors.faq}</p>}
    </div>
  );
}

function Step9Todo({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const todo = data.todo;

  function addItem() {
    updateData({ todo: [...todo, { text: "", done: false }] });
  }

  function removeItem(index: number) {
    updateData({ todo: todo.filter((_, i) => i !== index) });
  }

  function updateItem(index: number, text: string) {
    const next = [...todo];
    next[index] = { ...next[index], text };
    updateData({ todo: next });
  }

  function toggleItem(index: number) {
    const next = [...todo];
    next[index] = { ...next[index], done: !next[index].done };
    updateData({ todo: next });
  }

  return (
    <div>
      <StepLabel
        step={9}
        title="ToDo / Чеклист"
        description="Создайте чеклист действий для читателя"
      />
      <div className="space-y-2">
        {todo.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => toggleItem(index)}
              className={cn(
                "shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                item.done
                  ? "bg-[#27AE60] border-[#27AE60] text-white"
                  : "border-gray-300"
              )}
            >
              {item.done && <Check className="h-3 w-3" />}
            </button>
            <InputField
              value={item.text}
              onChange={(v) => updateItem(index, v)}
              placeholder="Действие"
              error={errors[`todo.${index}.text`]}
            />
            {todo.length > 1 && (
              <button
                onClick={() => removeItem(index)}
                className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="mt-3 gap-1"
      >
        <Plus className="h-3 w-3" />
        Добавить пункт
      </Button>
      {errors.todo && (
        <p className="text-xs text-red-500 mt-2">{errors.todo}</p>
      )}
    </div>
  );
}

function Step10StructuredData({
  data,
  updateData,
  errors,
}: {
  data: WizardData;
  updateData: (d: Partial<WizardData>) => void;
  errors: Record<string, string>;
}) {
  const keyFacts = data.keyFacts;

  function addFact() {
    if (keyFacts.length >= 7) return;
    const icon = articleIcons[keyFacts.length % articleIcons.length];
    updateData({ keyFacts: [...keyFacts, { icon, text: "" }] });
  }

  function removeFact(index: number) {
    updateData({ keyFacts: keyFacts.filter((_, i) => i !== index) });
  }

  function updateFact(index: number, text: string) {
    const next = [...keyFacts];
    next[index] = { ...next[index], text };
    updateData({ keyFacts: next });
  }

  const howTo = data.howTo;

  function addHowTo() {
    updateData({ howTo: [...howTo, { title: "", description: "" }] });
  }

  function removeHowTo(index: number) {
    updateData({ howTo: howTo.filter((_, i) => i !== index) });
  }

  function updateHowTo(
    index: number,
    field: "title" | "description",
    value: string
  ) {
    const next = [...howTo];
    next[index] = { ...next[index], [field]: value };
    updateData({ howTo: next });
  }

  const sources = data.sources;

  function addSource() {
    updateData({ sources: [...sources, { title: "", url: "" }] });
  }

  function removeSource(index: number) {
    updateData({ sources: sources.filter((_, i) => i !== index) });
  }

  function updateSource(index: number, field: "title" | "url", value: string) {
    const next = [...sources];
    next[index] = { ...next[index], [field]: value };
    updateData({ sources: next });
  }

  return (
    <div>
      <StepLabel
        step={10}
        title="Структурированные данные и ключевые выводы"
        description="Заполните GEO-блоки для лучшей индексации статьи"
      />
      <div className="space-y-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#0039CA]" />
            TL;DR — краткое содержание
          </h3>
          <InputField
            value={data.tldr}
            onChange={(v) => updateData({ tldr: v })}
            placeholder="Краткое содержание статьи в 2-3 предложениях"
            multiline
            rows={3}
            error={errors.tldr}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <CheckCheck className="h-4 w-4 text-[#1ABC9C]" />
            Key Facts — ключевые факты (3-7)
          </h3>
          <div className="space-y-2">
            {keyFacts.map((fact, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-lg shrink-0">•</span>
                <InputField
                  value={fact.text}
                  onChange={(v) => updateFact(index, v)}
                  placeholder={`Факт ${index + 1}`}
                  error={errors[`keyFacts.${index}.text`]}
                />
                {keyFacts.length > 3 && (
                  <button
                    onClick={() => removeFact(index)}
                    className="shrink-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {keyFacts.length < 7 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addFact}
              className="mt-2 gap-1"
            >
              <Plus className="h-3 w-3" /> Добавить факт
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#2C3E50]" />
            Определение темы
          </h3>
          <InputField
            value={data.definition}
            onChange={(v) => updateData({ definition: v })}
            placeholder="Дайте чёткое определение теме статьи"
            multiline
            rows={3}
            error={errors.definition}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            Featured Snippet — прямой ответ
          </h3>
          <div className="space-y-3">
            <InputField
              value={data.featuredSnippet.question}
              onChange={(v) =>
                updateData({
                  featuredSnippet: { ...data.featuredSnippet, question: v },
                })
              }
              placeholder="Вопрос для прямого ответа"
              label="Вопрос"
              error={errors["featuredSnippet.question"]}
            />
            <InputField
              value={data.featuredSnippet.answer}
              onChange={(v) =>
                updateData({
                  featuredSnippet: { ...data.featuredSnippet, answer: v },
                })
              }
              placeholder="Краткий ответ на вопрос"
              label="Ответ"
              multiline
              rows={3}
              error={errors["featuredSnippet.answer"]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#2C3E50]" />
            Проблема → Решение → Результат
          </h3>
          <div className="space-y-3">
            <InputField
              value={data.problemSolutionResult.problem}
              onChange={(v) =>
                updateData({
                  problemSolutionResult: {
                    ...data.problemSolutionResult,
                    problem: v,
                  },
                })
              }
              placeholder="Опишите проблему"
              multiline
              rows={2}
              error={errors["problemSolutionResult.problem"]}
            />
            <InputField
              value={data.problemSolutionResult.solution}
              onChange={(v) =>
                updateData({
                  problemSolutionResult: {
                    ...data.problemSolutionResult,
                    solution: v,
                  },
                })
              }
              placeholder="Опишите решение"
              multiline
              rows={2}
              error={errors["problemSolutionResult.solution"]}
            />
            <InputField
              value={data.problemSolutionResult.result}
              onChange={(v) =>
                updateData({
                  problemSolutionResult: {
                    ...data.problemSolutionResult,
                    result: v,
                  },
                })
              }
              placeholder="Опишите результат"
              multiline
              rows={2}
              error={errors["problemSolutionResult.result"]}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[#0039CA]" />
            HowTo — пошаговая инструкция
          </h3>
          <div className="space-y-4">
            {howTo.map((step, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    Шаг {index + 1}
                  </span>
                  {howTo.length > 1 && (
                    <button
                      onClick={() => removeHowTo(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <InputField
                    value={step.title}
                    onChange={(v) => updateHowTo(index, "title", v)}
                    placeholder="Название шага"
                    error={errors[`howTo.${index}.title`]}
                  />
                  <InputField
                    value={step.description}
                    onChange={(v) => updateHowTo(index, "description", v)}
                    placeholder="Описание шага"
                    multiline
                    rows={2}
                    error={errors[`howTo.${index}.description`]}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addHowTo}
            className="mt-2 gap-1"
          >
            <Plus className="h-3 w-3" /> Добавить шаг
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#1ABC9C]" />
            How We Know — методология
          </h3>
          <InputField
            value={data.methodology}
            onChange={(v) => updateData({ methodology: v })}
            placeholder="Опишите методологию подготовки статьи"
            multiline
            rows={4}
            error={errors.methodology}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-[#2C3E50] mb-3 flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-[#2C3E50]" />
            Источники информации
          </h3>
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-100 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    Источник {index + 1}
                  </span>
                  {sources.length > 1 && (
                    <button
                      onClick={() => removeSource(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <InputField
                    value={source.title}
                    onChange={(v) => updateSource(index, "title", v)}
                    placeholder="Название источника"
                    error={errors[`sources.${index}.title`]}
                  />
                  <InputField
                    value={source.url}
                    onChange={(v) => updateSource(index, "url", v)}
                    placeholder="URL источника"
                    error={errors[`sources.${index}.url`]}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addSource}
            className="mt-2 gap-1"
          >
            <Plus className="h-3 w-3" /> Добавить источник
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step11Preview({
  data,
  expertName,
}: {
  data: WizardData;
  expertName: string;
}) {
  const ind = getIndustryById(data.industryId);
  const cat = getCategory(data.industryId, data.categoryId);
  const dateStr = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const readTime = estimateReadTime(data.content);
  const wordCount = data.content.split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center gap-2 text-[#0039CA] mb-4">
        <Eye className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Предпросмотр статьи
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Так будет выглядеть ваша статья после публикации. Все GEO-блоки
        отображаются в соответствии с заполненными данными.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <span className="text-[#0039CA]">
              {ind?.name || data.industryName}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-500">
              {cat?.name || data.categoryName}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50] leading-tight mb-4">
            {data.title || "Заголовок статьи"}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0039CA] text-white text-xs font-bold">
                {expertName.charAt(0)}
              </div>
              <span className="font-medium text-[#2C3E50]">{expertName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {readTime}
            </span>
            <span className="text-xs text-gray-400">{wordCount} слов</span>
          </div>

          {data.tldr && (
            <section className="rounded-xl border border-blue-100 bg-[#0039CA]/10/50 p-6 mb-8">
              <div className="flex items-center gap-2 text-[#0039CA] mb-3">
                <Lightbulb className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  TL;DR
                </span>
              </div>
              <p className="text-[#2C3E50] text-base leading-relaxed">
                {data.tldr}
              </p>
            </section>
          )}

          {data.keyFacts.filter((f) => f.text).length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
              <div className="flex items-center gap-2 text-[#1ABC9C] mb-4">
                <CheckCheck className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Key Facts
                </span>
              </div>
              <ul className="space-y-3">
                {data.keyFacts
                  .filter((f) => f.text)
                  .map((fact, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                        <BarChart3 className="h-4 w-4 text-[#0039CA]" />
                      </span>
                      <span className="text-sm text-[#2C3E50]">
                        {fact.text}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {data.definition && (
            <section className="mb-8">
              <div className="flex items-center gap-2 text-[#2C3E50] mb-3">
                <BookOpen className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Определение
                </span>
              </div>
              <blockquote className="border-l-4 border-[#0039CA] bg-white pl-4 py-3 text-[#2C3E50] text-base leading-relaxed italic">
                {data.definition}
              </blockquote>
            </section>
          )}

          {data.featuredSnippet.question && data.featuredSnippet.answer && (
            <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 mb-8">
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Featured Snippet
                </span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Вопрос
                </span>
                <p className="text-[#2C3E50] font-medium mt-1">
                  {data.featuredSnippet.question}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Ответ
                </span>
                <p className="text-[#2C3E50] mt-1 leading-relaxed">
                  {data.featuredSnippet.answer}
                </p>
              </div>
            </section>
          )}

          {data.problemSolutionResult.problem && (
            <section className="mb-8">
              <div className="flex items-center gap-2 text-[#2C3E50] mb-4">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Проблема → Решение → Результат
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-5">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold text-xs uppercase">
                      Проблема
                    </span>
                  </div>
                  <p className="text-sm text-[#2C3E50] leading-relaxed">
                    {data.problemSolutionResult.problem}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-[#0039CA]/10/50 p-5">
                  <div className="flex items-center gap-2 text-[#0039CA] mb-2">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-semibold text-xs uppercase">
                      Решение
                    </span>
                  </div>
                  <p className="text-sm text-[#2C3E50] leading-relaxed">
                    {data.problemSolutionResult.solution}
                  </p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
                  <div className="flex items-center gap-2 text-[#27AE60] mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-semibold text-xs uppercase">
                      Результат
                    </span>
                  </div>
                  <p className="text-sm text-[#2C3E50] leading-relaxed">
                    {data.problemSolutionResult.result}
                  </p>
                </div>
              </div>
            </section>
          )}

          {data.sections && data.sections.length > 0 && (
            <div className="mb-8 space-y-6">
              {data.sections.map((section, index) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="p-5">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 block">
                      Раздел {index + 1}
                    </span>
                    {section.title && (
                      <h2 className="text-xl font-semibold text-[#2C3E50] mb-2">
                        {section.title}
                      </h2>
                    )}
                    {section.description && (
                      <p className="text-sm text-gray-500 mb-4">
                        {section.description}
                      </p>
                    )}

                    {section.design === "text-only" && section.text && (
                      <div
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: section.text }}
                      />
                    )}

                    {section.design === "image-only" && (
                      <div className="w-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        {section.imageData ? (
                          <img
                            src={section.imageData}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm p-8 text-center">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                            <span>Изображение не загружено</span>
                          </div>
                        )}
                      </div>
                    )}

                    {(section.design === "image-right" ||
                      section.design === "image-left") && (
                      <div
                        className={`flex gap-4 items-start ${
                          section.design === "image-left"
                            ? "flex-row"
                            : "flex-row"
                        }`}
                      >
                        {section.design === "image-left" && (
                          <div className="w-2/5 shrink-0">
                            <div className="w-full min-h-[180px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                              {section.imageData ? (
                                <img
                                  src={section.imageData}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-400 text-sm p-6 text-center">
                                  <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-40" />
                                  <span>Нет изображения</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {section.text && (
                          <div
                            className="text-sm text-gray-700 leading-relaxed flex-1"
                            dangerouslySetInnerHTML={{ __html: section.text }}
                          />
                        )}
                        {section.design === "image-right" && (
                          <div className="w-2/5 shrink-0">
                            <div className="w-full min-h-[180px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                              {section.imageData ? (
                                <img
                                  src={section.imageData}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-400 text-sm p-6 text-center">
                                  <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-40" />
                                  <span>Нет изображения</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {section.design === "table" &&
                      section.tableData.headers.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                {section.tableData.headers.map((h, ci) => (
                                  <th
                                    key={ci}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-500"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.tableData.rows.map((row, ri) => (
                                <tr
                                  key={ri}
                                  className="border-t border-gray-100"
                                >
                                  {row.map((cell, ci) => (
                                    <td
                                      key={ci}
                                      className="px-3 py-2 text-xs text-gray-700"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.howTo.filter((h) => h.title).length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
              <div className="flex items-center gap-2 text-[#0039CA] mb-5">
                <ListChecks className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  HowTo — Инструкция
                </span>
              </div>
              <ol className="space-y-5">
                {data.howTo
                  .filter((h) => h.title)
                  .map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#0039CA] text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-[#2C3E50] mb-1">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
              </ol>
            </section>
          )}

          {data.faq.filter((f) => f.question).length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 text-[#2C3E50] mb-4">
                <HelpCircle className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  FAQ
                </span>
              </div>
              <div className="space-y-3">
                {data.faq
                  .filter((f) => f.question)
                  .map((item, index) => (
                    <details
                      key={index}
                      className="group rounded-xl border border-gray-200 bg-white overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-[#2C3E50] hover:bg-gray-50 transition-colors">
                        <span>{item.question}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600 leading-relaxed">
                        {item.answer}
                      </div>
                    </details>
                  ))}
              </div>
            </section>
          )}

          {data.todo.filter((t) => t.text).length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
              <div className="flex items-center gap-2 text-[#2C3E50] mb-4">
                <CheckCheck className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Чеклист
                </span>
              </div>
              <ul className="space-y-2">
                {data.todo
                  .filter((t) => t.text)
                  .map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center",
                          item.done
                            ? "bg-[#27AE60] border-[#27AE60]"
                            : "border-gray-300"
                        )}
                      >
                        {item.done && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={cn(
                          "text-sm",
                          item.done
                            ? "text-gray-400 line-through"
                            : "text-[#2C3E50]"
                        )}
                      >
                        {item.text}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {data.methodology && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
              <div className="flex items-center gap-2 text-[#1ABC9C] mb-3">
                <BarChart3 className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Методология
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.methodology}
              </p>
            </section>
          )}

          {data.sources.filter((s) => s.title).length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 text-[#2C3E50] mb-3">
                <ExternalLink className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Источники
                </span>
              </div>
              <ul className="space-y-2">
                {data.sources
                  .filter((s) => s.title)
                  .map((source, index) => (
                    <li key={index}>
                      <span className="flex items-center gap-2 text-sm text-[#0039CA]">
                        <span className="text-xs text-gray-300">
                          {index + 1}.
                        </span>
                        <span>{source.title}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 mb-8">
            <div className="flex items-center gap-2 text-[#2C3E50] mb-4">
              <GraduationCapIcon className="h-5 w-5" />
              <span className="font-semibold text-sm tracking-wide uppercase">
                Об авторе
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-white text-xl font-bold">
                {expertName.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-[#2C3E50]">{expertName}</h3>
                {data.expertiseAreas.filter(Boolean).length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Области экспертизы
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {data.expertiseAreas.filter(Boolean).map((exp) => (
                        <span
                          key={exp}
                          className="inline-flex items-center rounded-md bg-[#0039CA]/10 px-2 py-0.5 text-xs font-medium text-[#0039CA]"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Step12Publish({
  data,
  onPublish,
  publishing,
}: {
  data: WizardData;
  onPublish: () => void;
  publishing: boolean;
}) {
  const wordCount = data.content.split(/\s+/).filter(Boolean).length;
  const cat = getCategory(data.industryId, data.categoryId);

  return (
    <div>
      <div className="flex items-center gap-2 text-[#27AE60] mb-4">
        <Send className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Публикация
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 mb-6">
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
          Почти готово!
        </h2>
        <p className="text-gray-500 mb-6">
          Проверьте итоговые параметры статьи перед публикацией
        </p>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <SummaryRow label="Отрасль" value={data.industryName} />
          <SummaryRow
            label="Категория"
            value={cat?.name || data.categoryName}
          />
          <SummaryRow label="Заголовок" value={data.title} />
          <SummaryRow
            label="Объём"
            value={`${wordCount} слов / ${data.content.length} символов`}
          />
          <SummaryRow
            label="FAQ"
            value={`${data.faq.filter((f) => f.question).length} вопросов`}
          />
          <SummaryRow
            label="Чеклист"
            value={`${data.todo.filter((t) => t.text).length} пунктов`}
          />
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-3">
          <p className="text-sm text-blue-800">
            После нажатия «Опубликовать» статья будет отправлена на модерацию и
            получит статус «На модерации». После проверки модератором она будет
            опубликована в каталоге. Статус можно отслеживать в личном кабинете.
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            Нажимая «Опубликовать», вы подтверждаете, что статья соответствует
            правилам каталога Expers и не нарушает авторских прав третьих лиц.
          </p>
        </div>

        <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Стоимость права публикации — 5 000 ₽ (НДС не облагается, АУСН), если
            оно ещё не приобретено. Оплата производится банковской картой через
            сервис Т-Банка. После оплаты статья отправляется на модерацию.
            Приобретая право публикации, вы принимаете условия{" "}
            <a
              href="/offer"
              target="_blank"
              className="text-[#0039CA] hover:underline"
            >
              публичной оферты
            </a>{" "}
            и{" "}
            <a
              href="/refund"
              target="_blank"
              className="text-[#0039CA] hover:underline"
            >
              условия возврата
            </a>
            . Исполнитель: ООО «ФОНИИ», ИНН 7720943604.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onPublish}
          disabled={publishing}
          size="lg"
          className="gap-2 h-12 px-8 text-base"
        >
          {publishing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Публикуем...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Опубликовать статью
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#2C3E50]">{value}</p>
    </div>
  );
}
