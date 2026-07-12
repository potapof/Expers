import { notFound } from "next/navigation";
import Link from "next/link";
import { getIndustryById } from "@/lib/data";
import { getIndustryIdBySlug } from "@/lib/industry-slugs";
import { articleUrl } from "@/lib/routes";
import {
  getArticleViewBySlug,
  type ArticleView,
  type RelatedArticle,
} from "@/lib/article-view";
import {
  Clock,
  User,
  ChevronRight,
  Lightbulb,
  CheckCheck,
  BookOpen,
  HelpCircle,
  Star,
  ListChecks,
  Quote,
  ExternalLink,
  BarChart3,
  GraduationCap,
  TrendingUp,
  Target,
  ArrowRight,
  Zap,
  FileText,
  MessageSquare,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { ArticleShareButton } from "@/components/article-share-button";
import { ArticleComments } from "@/components/article-comments";
import { ArticleViewTracker } from "@/components/article-view-tracker";

export const dynamic = "force-dynamic";

function JsonLd({
  articleView,
  siteUrl,
}: {
  articleView: ArticleView;
  siteUrl: string;
}) {
  const industry = getIndustryById(articleView.industryId);
  const articleUrl = `${siteUrl}/${articleView.industrySlug}/${articleView.slug}`;

  const schemas: Record<string, unknown>[] = [];

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articleView.title,
    description: articleView.description,
    author: {
      "@type": "Person",
      name: articleView.author.name,
      description: articleView.author.bio,
      knowsAbout: articleView.author.expertise,
      credential: articleView.author.credentials?.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c,
      })),
    },
    datePublished: articleView.date + "T00:00:00Z",
    dateModified: articleView.date + "T00:00:00Z",
    image: `${siteUrl}/og-image.jpg`,
    publisher: {
      "@type": "Organization",
      name: "Expers",
      logo: `${siteUrl}/logo.png`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    about: {
      "@type": "Thing",
      name: industry?.name || articleView.industryId,
      description: articleView.definition,
    },
    wordCount: articleView.content.split(/\s+/).length,
  });

  if (articleView.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: articleView.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  if (articleView.howTo.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: articleView.title,
      description: articleView.description,
      step: articleView.howTo.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        itemListElement: {
          "@type": "HowToDirection",
          text: step.description,
        },
      })),
    });
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: articleView.featuredSnippet.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: articleView.featuredSnippet.answer,
      },
      author: {
        "@type": "Person",
        name: articleView.author.name,
      },
    },
  });

  if (
    articleView.reviews &&
    articleView.reviews.length > 0 &&
    articleView.aggregateRating
  ) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: articleView.title,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: articleView.aggregateRating.ratingValue,
        reviewCount: articleView.aggregateRating.reviewCount,
        bestRating: articleView.aggregateRating.bestRating,
      },
      review: articleView.reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        reviewBody: r.text,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
        },
      })),
    });
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Person",
    name: articleView.author.name,
    description: articleView.author.bio,
    knowsAbout: articleView.author.expertise,
    ...(articleView.author.socialLinks?.length
      ? { sameAs: articleView.author.socialLinks.map((l) => l.url) }
      : {}),
  });

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: industry?.name || "Категория",
        item: `${siteUrl}/?industry=${articleView.industryId}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: articleView.title,
        item: articleUrl,
      },
    ],
  });

  if (articleView.keyFacts.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${articleView.title} — Key Facts`,
      description: "Ключевые факты статьи",
      itemListElement: articleView.keyFacts.map((fact, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: fact.text,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

function TldrBlock({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-blue-100 bg-[#0039CA]/10/50 p-6 mb-8">
      <div className="flex items-center gap-2 text-[#0039CA] mb-3">
        <Lightbulb className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          TL;DR
        </span>
      </div>
      <p className="text-[#2C3E50] text-base leading-relaxed">{text}</p>
    </section>
  );
}

function KeyFactsBlock({ facts }: { facts: { icon: string; text: string }[] }) {
  const iconMap: Record<string, React.ReactNode> = {
    chart: <BarChart3 className="h-4 w-4 text-[#27AE60]" />,
    eye: <Target className="h-4 w-4 text-[#0039CA]" />,
    tool: <WrenchIcon className="h-4 w-4 text-[#1ABC9C]" />,
    "trending-down": <TrendingUp className="h-4 w-4 text-[#e74c3c]" />,
    calendar: <Clock className="h-4 w-4 text-[#2C3E50]" />,
    "dollar-sign": <Zap className="h-4 w-4 text-[#27AE60]" />,
    target: <Target className="h-4 w-4 text-[#0039CA]" />,
    ruble: <Zap className="h-4 w-4 text-[#27AE60]" />,
    building: <Target className="h-4 w-4 text-[#0039CA]" />,
    store: <Target className="h-4 w-4 text-[#1ABC9C]" />,
    smartphone: <Target className="h-4 w-4 text-[#0039CA]" />,
    banknote: <Zap className="h-4 w-4 text-[#27AE60]" />,
    "file-text": <FileText className="h-4 w-4 text-[#0039CA]" />,
    video: <Target className="h-4 w-4 text-[#1ABC9C]" />,
    prescription: <FileText className="h-4 w-4 text-[#27AE60]" />,
    prohibited: <Zap className="h-4 w-4 text-[#e74c3c]" />,
    hospital: <Target className="h-4 w-4 text-[#0039CA]" />,
    scale: <BarChart3 className="h-4 w-4 text-[#2C3E50]" />,
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
      <div className="flex items-center gap-2 text-[#1ABC9C] mb-4">
        <CheckCheck className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Key Facts
        </span>
      </div>
      <ul className="space-y-3">
        {facts.map((fact, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
              {iconMap[fact.icon] || (
                <BarChart3 className="h-4 w-4 text-[#0039CA]" />
              )}
            </span>
            <span className="text-sm text-[#2C3E50]">{fact.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function DefinitionBlock({ text }: { text: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 text-[#2C3E50] mb-3">
        <BookOpen className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Определение
        </span>
      </div>
      <blockquote className="border-l-4 border-[#0039CA] bg-white pl-4 py-3 text-[#2C3E50] text-base leading-relaxed italic">
        {text}
      </blockquote>
    </section>
  );
}

function FeaturedSnippetBlock({
  snippet,
}: {
  snippet: { question: string; answer: string };
}) {
  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 mb-8">
      <div className="flex items-center gap-2 text-amber-600 mb-3">
        <MessageSquare className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Featured Snippet — Прямой ответ
        </span>
      </div>
      <div className="mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Вопрос
        </span>
        <p className="text-[#2C3E50] font-medium mt-1">{snippet.question}</p>
      </div>
      <div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Ответ
        </span>
        <p className="text-[#2C3E50] mt-1 leading-relaxed">{snippet.answer}</p>
      </div>
    </section>
  );
}

function ProblemSolutionResultBlock({
  data,
}: {
  data: { problem: string; solution: string; result: string };
}) {
  return (
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
            <span className="font-semibold text-xs uppercase tracking-wide">
              Проблема
            </span>
          </div>
          <p className="text-sm text-[#2C3E50] leading-relaxed">
            {data.problem}
          </p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-[#0039CA]/10/50 p-5">
          <div className="flex items-center gap-2 text-[#0039CA] mb-2">
            <Lightbulb className="h-4 w-4" />
            <span className="font-semibold text-xs uppercase tracking-wide">
              Решение
            </span>
          </div>
          <p className="text-sm text-[#2C3E50] leading-relaxed">
            {data.solution}
          </p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50/50 p-5">
          <div className="flex items-center gap-2 text-[#27AE60] mb-2">
            <Target className="h-4 w-4" />
            <span className="font-semibold text-xs uppercase tracking-wide">
              Результат
            </span>
          </div>
          <p className="text-sm text-[#2C3E50] leading-relaxed">
            {data.result}
          </p>
        </div>
      </div>
    </section>
  );
}

function HowToBlock({
  steps,
}: {
  steps: { title: string; description: string }[];
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
      <div className="flex items-center gap-2 text-[#0039CA] mb-5">
        <ListChecks className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          HowTo — Пошаговая инструкция
        </span>
      </div>
      <ol className="space-y-5">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4">
            <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#0039CA] text-white text-xs font-bold">
              {index + 1}
            </span>
            <div>
              <h4 className="font-medium text-[#2C3E50] mb-1">{step.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FaqBlock({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 text-[#2C3E50] mb-4">
        <HelpCircle className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          FAQ — Часто задаваемые вопросы
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
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
  );
}

function ReviewsBlock({
  reviews,
  aggregateRating,
}: {
  reviews: { author: string; role: string; text: string; rating: number }[];
  aggregateRating: {
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
  };
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
      <div className="flex items-center gap-2 text-amber-500 mb-4">
        <Star className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Отзывы и социальные доказательства
        </span>
      </div>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(aggregateRating.ratingValue)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-bold text-[#2C3E50]">
          {aggregateRating.ratingValue}
        </span>
        <span className="text-sm text-gray-400">
          ({aggregateRating.reviewCount} отзыва)
        </span>
      </div>
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="flex gap-3">
            <Quote className="h-8 w-8 shrink-0 text-gray-200" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-[#2C3E50]">
                  {review.author}
                </span>
                <span className="text-xs text-gray-400">{review.role}</span>
                <div className="flex items-center gap-0.5 ml-auto">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuthorBlock({
  author,
}: {
  author: {
    name: string;
    bio?: string;
    expertise?: string[];
    credentials?: string[];
    socialLinks?: { platform: string; url: string }[];
  };
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 mb-8">
      <div className="flex items-center gap-2 text-[#2C3E50] mb-4">
        <GraduationCap className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Об авторе — E-E-A-T
        </span>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-white text-xl font-bold">
          {author.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#2C3E50]">{author.name}</h3>
          {author.bio && (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {author.bio}
            </p>
          )}
          {author.expertise && author.expertise.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Области экспертизы
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {author.expertise.map((exp) => (
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
          {author.credentials && author.credentials.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Квалификация
              </span>
              <ul className="mt-1 space-y-0.5">
                {author.credentials.map((cred) => (
                  <li
                    key={cred}
                    className="text-xs text-gray-500 flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3 text-[#27AE60]" />
                    {cred}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SourcesBlock({
  sources,
}: {
  sources: { title: string; url: string }[];
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 text-[#2C3E50] mb-3">
        <ExternalLink className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Источники информации
        </span>
      </div>
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#0039CA] hover:text-[#1ABC9C] transition-colors"
            >
              <span className="text-xs text-gray-300">{index + 1}.</span>
              <span>{source.title}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MethodologyBlock({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
      <div className="flex items-center gap-2 text-[#1ABC9C] mb-3">
        <BarChart3 className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          How We Know — Методология
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </section>
  );
}

function CrossLinksBlock({ related }: { related: RelatedArticle[] }) {
  return (
    <section className="border-t border-gray-200 pt-8 mt-8">
      <div className="flex items-center gap-2 text-[#2C3E50] mb-5">
        <ArrowRight className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Связанные статьи — кросс-функциональные ссылки
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((item) => {
          const relIndustry = getIndustryById(item.industryId);
          return (
            <Link
              key={item.id}
              href={articleUrl(item)}
              className="group rounded-xl border border-gray-100 bg-white p-4 hover:border-[#0039CA] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-[#0039CA]/10 px-2 py-0.5 text-xs font-medium text-[#0039CA]">
                  {relIndustry?.name || item.industryId}
                </span>
              </div>
              <h4 className="text-sm font-medium text-[#2C3E50] group-hover:text-[#0039CA] transition-colors leading-snug">
                {item.title}
              </h4>
              {(item.authorName || item.date) && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  {item.authorName && (
                    <>
                      <User className="h-3 w-3" />
                      <span>{item.authorName}</span>
                    </>
                  )}
                  {item.authorName && item.date && <span>·</span>}
                  {item.date && <span>{item.date}</span>}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ArticleContentBlock({ content }: { content: string }) {
  const paragraphs = content.split("\n\n");
  return (
    <div className="prose prose-sm max-w-none mb-8">
      {paragraphs.map((para, index) => {
        if (para.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-xl font-semibold text-[#2C3E50] mt-8 mb-4"
            >
              {para.replace("## ", "")}
            </h2>
          );
        }
        if (para.startsWith("- ")) {
          return (
            <ul
              key={index}
              className="list-disc pl-5 space-y-1 mb-4 text-gray-700"
            >
              {para.split("\n").map((line, li) => {
                if (line.startsWith("- ")) {
                  const parts = line.replace("- ", "").split(" — ");
                  return (
                    <li key={li} className="text-sm">
                      <span className="font-medium">{parts[0]}</span>
                      {parts[1] ? ` — ${parts[1]}` : ""}
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          );
        }
        if (para.startsWith("1. ")) {
          return (
            <ol
              key={index}
              className="list-decimal pl-5 space-y-1 mb-4 text-gray-700"
            >
              {para.split("\n").map((line, li) => {
                if (line.match(/^\d+\./)) {
                  const text = line.replace(/^\d+\.\s+/, "");
                  const parts = text.split(" — ");
                  return (
                    <li key={li} className="text-sm">
                      <span className="font-medium">{parts[0]}</span>
                      {parts[1] ? ` — ${parts[1]}` : ""}
                    </li>
                  );
                }
                return null;
              })}
            </ol>
          );
        }
        return (
          <p
            key={index}
            className="text-base text-gray-700 leading-relaxed mb-4"
          >
            {para}
          </p>
        );
      })}
    </div>
  );
}

export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ industry: string; slug: string }>;
}) {
  const { industry, slug } = await params;
  const industryId = getIndustryIdBySlug(industry);
  if (!industryId) notFound();

  const articleView = await getArticleViewBySlug(industryId, slug);
  if (!articleView) notFound();

  const industryData = getIndustryById(articleView.industryId);
  const siteUrl = process.env.APP_BASE_URL || "https://expers.ru";

  return (
    <>
      <JsonLd articleView={articleView} siteUrl={siteUrl} />
      <div className="mx-auto px-4 max-w-3xl py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#0039CA] transition-colors">
              Главная
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0039CA]">
              {industryData?.name || articleView.industryId}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50] leading-tight mb-4">
            {articleView.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0039CA] text-white text-xs font-bold">
                {articleView.author.name.charAt(0)}
              </div>
              <span className="font-medium text-[#2C3E50]">
                {articleView.author.name}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {articleView.date}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {articleView.readTime}
            </span>
            <span className="text-gray-300">|</span>
            <FavoriteButton articleId={articleView.id} size="md" />
            <ArticleShareButton
              articleId={articleView.id}
              articleTitle={articleView.title}
            />
          </div>
        </div>

        <TldrBlock text={articleView.tldr} />

        {articleView.keyFacts.length > 0 && (
          <KeyFactsBlock facts={articleView.keyFacts} />
        )}

        <DefinitionBlock text={articleView.definition} />

        <FeaturedSnippetBlock snippet={articleView.featuredSnippet} />

        <ProblemSolutionResultBlock data={articleView.problemSolutionResult} />

        <ArticleContentBlock content={articleView.content} />

        {articleView.howTo.length > 0 && (
          <HowToBlock steps={articleView.howTo} />
        )}

        {articleView.faq.length > 0 && <FaqBlock items={articleView.faq} />}

        {articleView.reviews &&
          articleView.reviews.length > 0 &&
          articleView.aggregateRating && (
            <ReviewsBlock
              reviews={articleView.reviews}
              aggregateRating={articleView.aggregateRating}
            />
          )}

        <AuthorBlock author={articleView.author} />

        <MethodologyBlock text={articleView.methodology} />

        {articleView.sources.length > 0 && (
          <SourcesBlock sources={articleView.sources} />
        )}

        {articleView.related.length > 0 && (
          <CrossLinksBlock related={articleView.related} />
        )}

        <ArticleComments
          articleId={articleView.id}
          articleAuthorId={articleView.author.id}
        />
      </div>

      <ArticleViewTracker articleId={articleView.id} />
    </>
  );
}
