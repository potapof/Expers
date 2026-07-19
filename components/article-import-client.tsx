"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  HelpCircle,
  Copy,
} from "lucide-react";
import { TEMPLATE_ITERATIONS } from "@/lib/import-template";
import { iterationSchemas } from "@/lib/import-validation";
import { parseIterationMarkdown, buildArticleData } from "@/lib/import-parser";

const STORAGE_KEY = "expers-import-draft";
const TOTAL_ITERATIONS = 12;

interface ImportState {
  savedIterations: number[];
  iterationsData: Record<number, string>;
  parsedData: Record<number, Record<string, string>>;
}

function loadState(): ImportState {
  if (typeof window === "undefined") {
    return { savedIterations: [], iterationsData: {}, parsedData: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return { savedIterations: [], iterationsData: {}, parsedData: {} };
    return JSON.parse(raw);
  } catch {
    return { savedIterations: [], iterationsData: {}, parsedData: {} };
  }
}

function saveState(state: ImportState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ArticleImportClient() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentIteration, setCurrentIteration] = useState(1);
  const [state, setState] = useState<ImportState>(loadState);
  const [textValues, setTextValues] = useState<Record<number, string>>(
    () => loadState().iterationsData || {}
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveState({
        ...state,
        iterationsData: textValues,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [textValues, state]);

  useEffect(() => {
    if (!authLoading && !expert) {
      router.replace("/");
    }
  }, [authLoading, expert, router]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const lastUnlockedIteration =
    state.savedIterations.length > 0
      ? Math.max(...state.savedIterations) + 1
      : 1;

  const maxAccessibleIteration = Math.max(lastUnlockedIteration, 1);

  const handleTextChange = useCallback(
    (value: string) => {
      setTextValues((prev) => ({ ...prev, [currentIteration]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[currentIteration];
        return next;
      });
    },
    [currentIteration]
  );

  const handleSave = useCallback(() => {
    const text = textValues[currentIteration] || "";
    if (!text.trim()) {
      setErrors((prev) => ({
        ...prev,
        [currentIteration]: "Поле не может быть пустым",
      }));
      return;
    }

    setSaving(true);

    const templateIter = TEMPLATE_ITERATIONS[currentIteration - 1];
    const schema = iterationSchemas[currentIteration];
    const parseResult = parseIterationMarkdown(
      text,
      templateIter.outputFields,
      templateIter.optionalFields
    );

    if (!parseResult.ok) {
      setErrors((prev) => ({
        ...prev,
        [currentIteration]: parseResult.error || "Ошибка парсинга",
      }));
      setSaving(false);
      return;
    }

    const zodResult = schema.safeParse(parseResult.data);
    if (!zodResult.success) {
      const messages = zodResult.error.issues.map((i) => i.message).join("; ");
      setErrors((prev) => ({
        ...prev,
        [currentIteration]: messages || "Ошибка валидации",
      }));
      setSaving(false);
      return;
    }

    setState((prev) => {
      const savedIterations = [
        ...new Set([...prev.savedIterations, currentIteration]),
      ].sort();
      const parsedData = {
        ...prev.parsedData,
        [currentIteration]: parseResult.data!,
      };
      const newState = { ...prev, savedIterations, parsedData };
      saveState(newState);
      return newState;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[currentIteration];
      return next;
    });

    toast.success(`Итерация ${currentIteration} сохранена`);
    setSaving(false);
  }, [currentIteration, textValues]);

  const handleComplete = useCallback(async () => {
    setImporting(true);
    const id = toast.loading("Создаём черновик статьи...");

    try {
      const articleData = buildArticleData(
        new Map(
          Object.entries(state.parsedData).map(([k, v]) => [
            Number(k),
            v as Record<string, string>,
          ])
        )
      );

      const token = localStorage.getItem("token");
      const res = await fetch("/api/articles/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ articleData }),
      });

      const result = await res.json();

      if (res.ok && result.article?.id) {
        localStorage.removeItem(STORAGE_KEY);
        toast.success("Статья создана. Перенаправляем в редактор...", { id });
        redirectTimerRef.current = setTimeout(() => {
          router.push(`/articles/new?importId=${result.article.id}`);
        }, 500);
      } else if (res.status === 503) {
        toast.error("База данных временно недоступна. Попробуйте позже.", {
          id,
        });
      } else {
        toast.error(result.error || "Ошибка создания статьи", { id });
      }
    } catch {
      toast.error("Ошибка соединения", { id });
    } finally {
      setImporting(false);
    }
  }, [state.parsedData]);

  const canComplete = state.savedIterations.length === TOTAL_ITERATIONS;

  const handleCopyPrompt = useCallback(() => {
    const templateIter = TEMPLATE_ITERATIONS[currentIteration - 1];
    if (!navigator.clipboard) {
      toast.error("Буфер обмена недоступен");
      return;
    }
    navigator.clipboard
      .writeText(templateIter.prompt)
      .then(() => {
        toast.success("Промпт скопирован");
      })
      .catch(() => {
        toast.error("Не удалось скопировать");
      });
  }, [currentIteration]);

  const handleDownloadTemplate = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Необходимо авторизоваться");
      return;
    }
    fetch("/api/templates/article", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.text())
      .then((md) => {
        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "expers-article-template.md";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Шаблон скачан");
      })
      .catch(() => toast.error("Ошибка скачивания"));
  }, []);

  if (authLoading || !expert) {
    return (
      <div className="mx-auto px-4 max-w-3xl py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100 mb-8" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  const templateIter = TEMPLATE_ITERATIONS[currentIteration - 1];
  const isSaved = state.savedIterations.includes(currentIteration);
  const hasError = !!errors[currentIteration];
  const canAccess =
    currentIteration <= maxAccessibleIteration && currentIteration >= 1;

  return (
    <div className="mx-auto px-4 max-w-3xl py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-2">
          Импорт статьи
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Скачайте AI-промпт-шаблон, отправьте его в ChatGPT / Claude /
          Perplexity, и пошагово вставляйте ответы для каждой из 12 итераций.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <Button
          onClick={handleDownloadTemplate}
          variant="outline"
          className="text-sm h-9 px-4 gap-2"
        >
          <Download className="h-4 w-4" />
          Скачать шаблон
        </Button>
        <Button
          onClick={() => setShowHelp(!showHelp)}
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          Как это работает
        </Button>
      </div>

      {showHelp && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Как импортировать статью
          </h3>
          <ol className="text-sm text-blue-700 space-y-1.5 list-decimal list-inside">
            <li>Скачайте шаблон — кнопка «Скачать шаблон» выше</li>
            <li>
              Скопируйте промпт итерации 1 — кнопка «Скопировать промпт» в
              каждой итерации
            </li>
            <li>Отправьте промпт в ChatGPT, Claude или Perplexity</li>
            <li>Вставьте ответ ИИ в поле и нажмите «Сохранить»</li>
            <li>
              Повторите для всех 12 итераций — каждая следующая разблокируется
              после сохранения предыдущей
            </li>
            <li>
              После сохранения всех 12 итераций нажмите «Завершить импорт»
            </li>
          </ol>
          <p className="text-xs text-blue-600 mt-3 leading-relaxed">
            <strong>Итерации 1–4</strong> — метаданные статьи (отрасль,
            категория, экспертиза, ссылки). ИИ заполняет их заглушками, потому
            что только вы знаете свою нишу и аудиторию. Вы выберете реальные
            значения в визарде после импорта.
            <br />
            <strong>Итерация 5</strong> — заголовок, введение и slug статьи.
            <br />
            <strong>Итерации 6–11</strong> — основной контент: 6 секций текста с
            картинками и таблицами (80–120 KB).
            <br />
            <strong>Итерация 12</strong> — SEO-блоки: FAQ, чеклист, ключевые
            факты, сниппеты, источники.
          </p>
        </div>
      )}

      <ImportProgressBar
        currentIteration={currentIteration}
        savedIterations={state.savedIterations}
        maxAccessible={maxAccessibleIteration}
        onSelect={(iter) => {
          if (iter <= maxAccessibleIteration) {
            setCurrentIteration(iter);
          }
        }}
      />

      <div className="text-sm text-gray-400 mt-2 mb-6">
        Сохранено: {state.savedIterations.length} / {TOTAL_ITERATIONS}
      </div>

      {!canAccess ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center mb-6">
          <p className="text-sm text-amber-700">
            Сначала сохраните итерацию {maxAccessibleIteration}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-medium text-[#0039CA] uppercase tracking-wide">
                Итерация {templateIter.iteration}
              </span>
              <h2 className="text-xl font-bold text-[#2C3E50] mt-1">
                {templateIter.title}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {templateIter.wizardStepLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <Check className="h-4 w-4" />
                  Сохранено
                </span>
              )}
              {hasError && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                  Ошибка
                </span>
              )}
            </div>
          </div>

          {templateIter.isPlaceholder && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4 space-y-2">
              <p className="text-sm font-medium text-blue-800">
                Зачем это нужно
              </p>
              <p className="text-xs text-blue-700">
                {currentIteration === 1 &&
                  "Отрасль и подсектор определяют, в какой раздел каталога Expers попадёт ваша статья. От этого зависит, кто из читателей её увидит. ИИ не может знать вашу нишу — поэтому поле заполняется заглушкой, а вы выберете точную отрасль в редакторе после импорта."}
                {currentIteration === 2 &&
                  "Категория уточняет тематику статьи внутри подсектора — например, «Обзоры», «Кейсы» или «Гайды». Правильная категория помогает читателям быстрее находить ваш контент."}
                {currentIteration === 3 &&
                  "Области экспертизы показывают читателям, в чём вы специалист. Они отображаются в вашем профиле и на странице статьи. Выберите 3-5 реальных компетенций после импорта."}
                {currentIteration === 4 &&
                  "Кросс-ссылки связывают вашу статью с другими материалами каталога. Это улучшает навигацию для читателя и SEO-индексацию. Вы сможете добавить ссылки на смежные статьи после импорта."}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={handleCopyPrompt}
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
            >
              <Copy className="h-3 w-3" />
              Скопировать промпт
            </Button>
            <Button
              onClick={() => setShowExample(!showExample)}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Показать пример
            </Button>
          </div>

          {showExample && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 mb-4">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                {templateIter.exampleOutput}
              </pre>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Вставьте ответ ИИ
            </label>
            <textarea
              value={textValues[currentIteration] || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Вставьте ответ ИИ сюда..."
              rows={14}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono outline-none transition-colors focus:border-[#0039CA] focus:ring-1 focus:ring-[#0039CA] resize-y"
            />
            {errors[currentIteration] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[currentIteration]}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving
                ? "Сохранение..."
                : isSaved
                  ? "Пересохранить"
                  : "Сохранить"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={() => setCurrentIteration((s) => Math.max(s - 1, 1))}
          disabled={currentIteration === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </Button>

        <Button
          onClick={handleComplete}
          disabled={!canComplete || importing}
          className="gap-2"
        >
          {importing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Сохраняем...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Завершить импорт
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setCurrentIteration((s) => Math.min(s + 1, maxAccessibleIteration))
          }
          disabled={currentIteration >= maxAccessibleIteration || !isSaved}
          className="gap-2"
        >
          Далее
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ImportProgressBar({
  currentIteration,
  savedIterations,
  maxAccessible,
  onSelect,
}: {
  currentIteration: number;
  savedIterations: number[];
  maxAccessible: number;
  onSelect: (iter: number) => void;
}) {
  const steps = Array.from({ length: TOTAL_ITERATIONS }, (_, i) => i + 1);

  return (
    <div className="hidden sm:block">
      <div className="flex items-center justify-between mb-2">
        {steps.map((s) => {
          const isSaved = savedIterations.includes(s);
          const isCurrent = currentIteration === s;
          const isLocked = s > maxAccessible;
          return (
            <div key={s} className="flex items-center flex-1">
              <button
                onClick={() => onSelect(s)}
                disabled={isLocked}
                className={cn(
                  "flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-medium shrink-0 transition-colors",
                  isLocked
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : isSaved
                      ? "bg-[#27AE60] text-white cursor-pointer"
                      : isCurrent
                        ? "bg-[#0039CA] text-white ring-2 ring-[#0039CA]/30 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-pointer"
                )}
              >
                {isSaved ? <Check className="h-3 w-3" /> : s}
              </button>
              {s < 12 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-0.5",
                    s < currentIteration && isSaved
                      ? "bg-[#27AE60]"
                      : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
