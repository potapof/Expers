"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, HelpCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseAllIterations, buildArticleData } from "@/lib/import-parser";

export function ArticleImportClient() {
  const { expert, loading: authLoading } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!authLoading && !expert) {
      router.replace("/");
    }
  }, [authLoading, expert, router]);

  const handleImport = useCallback(async () => {
    if (!text.trim()) {
      toast.error("Вставьте ответ ИИ");
      return;
    }

    setImporting(true);
    const id = toast.loading("Создаём черновик статьи...");

    try {
      const parsedIterations = parseAllIterations(text);

      if (parsedIterations.size === 0) {
        toast.error(
          "Не найдено ни одной итерации. Ответ должен содержать блоки '## Итерация N:'.",
          { id }
        );
        setImporting(false);
        return;
      }

      if (parsedIterations.size < 4) {
        toast.error(
          `Найдено только ${parsedIterations.size} итераций. Нужно минимум 4 (заголовок, секции, GEO-блоки).`,
          { id }
        );
        setImporting(false);
        return;
      }

      const articleData = buildArticleData(parsedIterations);

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
        toast.success("Статья создана. Перенаправляем в редактор...", { id });
        setTimeout(() => {
          router.push(`/articles/new?importId=${result.article.id}`);
        }, 500);
      } else if (res.status === 503) {
        toast.error("База данных временно недоступна. Попробуйте позже.", {
          id,
        });
      } else {
        if (result.details?.fieldErrors) {
          const fieldErrors = result.details.fieldErrors as Record<
            string,
            string[]
          >;
          const fieldNames = Object.keys(fieldErrors);
          const summary = `Ошибка в ${fieldNames.length} полях: ${fieldNames.slice(0, 5).join(", ")}${fieldNames.length > 5 ? "..." : ""}`;
          toast.error(summary, {
            id,
            description: fieldNames
              .slice(0, 10)
              .map((f) => `${f}: ${fieldErrors[f]?.join("; ") ?? ""}`)
              .join("\n"),
            duration: 10000,
          });
        } else {
          toast.error(result.error || "Ошибка создания статьи", { id });
        }
      }
    } catch {
      toast.error("Ошибка соединения", { id });
    } finally {
      setImporting(false);
    }
  }, [text, router]);

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

  return (
    <div className="mx-auto px-4 max-w-3xl py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-2">
          Импорт статьи
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          Скачайте AI-промпт-шаблон, отправьте его в ChatGPT / Claude /
          Perplexity, затем вставьте весь диалог с ИИ в поле ниже.
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
              Отправьте шаблон в ChatGPT, Claude или Perplexity. ИИ будет
              выдавать итерации по очереди — после каждой напишет «Проверьте
              итерацию N и напишите Продолжить».
            </li>
            <li>
              Когда ИИ завершит все 8 итераций, скопируйте{" "}
              <strong>весь диалог</strong> и вставьте в поле ниже.
            </li>
            <li>
              Нажмите «Импортировать» — система найдёт все итерации и создаст
              черновик статьи.
            </li>
          </ol>
          <p className="text-xs text-blue-600 mt-3 leading-relaxed">
            <strong>Поля отрасли, категории, экспертизы и кросс-ссылок</strong>{" "}
            уже заполнены демо-данными — ИИ их не генерирует. Вы сможете выбрать
            реальные значения в редакторе после импорта.
            <br />
            <strong>Итерация 1</strong> — заголовок, введение и slug.
            <br />
            <strong>Итерации 2–7</strong> — основной контент (6 секций, 80–120
            KB).
            <br />
            <strong>Итерация 8</strong> — SEO-блоки (FAQ, чеклист, сниппеты).
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Вставьте весь диалог с ИИ
        </label>
        <p className="text-xs text-gray-400 mb-3">
          Система найдёт все блоки «## Итерация N:» и соберёт статью
          автоматически.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Вставьте сюда весь ответ ИИ...

Пример формата:
## Итерация 1: Заголовок и введение

### title
Мой заголовок

### introduction
Введение статьи...

### slug
my-slug

## Итерация 2: Секция 1 — Погружение в проблему

### sectionTitle
Заголовок секции

### sectionDesign
image-right

### imageUrl
https://pixinlink.ru/800x400/example

### sectionText
Полный текст секции...`}
          rows={20}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono outline-none transition-colors focus:border-[#0039CA] focus:ring-1 focus:ring-[#0039CA] resize-y"
        />
      </div>

      <Button
        onClick={handleImport}
        disabled={importing || !text.trim()}
        className="w-full gap-2 h-11"
      >
        {importing ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Импортируем...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Импортировать
          </>
        )}
      </Button>
    </div>
  );
}
