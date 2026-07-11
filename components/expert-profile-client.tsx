"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getArticlesByExpertId,
  getIndustryById,
  type ExpertProfile,
  type Article,
} from "@/lib/data";
import { SubscribeButton } from "@/components/subscribe-button";
import {
  ChevronRight,
  Clock,
  Mail,
  ExternalLink,
  GraduationCap,
  BookOpen,
  FileText,
  CheckCheck,
} from "lucide-react";

const STORAGE_KEY_PREFIX = "expers-profile-";

function PageSchema({ expert }: { expert: ExpertProfile }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: expert.name,
          description: expert.bio,
          knowsAbout: expert.expertise,
          credential: expert.credentials?.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            name: c,
          })),
          ...(expert.socialLinks?.length
            ? { sameAs: expert.socialLinks.map((l) => l.url) }
            : {}),
          ...(expert.email ? { email: expert.email } : {}),
        }),
      }}
    />
  );
}

function ArticleCard({ article }: { article: Article }) {
  const industry = getIndustryById(article.industryId);
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group block rounded-xl border border-gray-100 bg-white p-5 hover:border-[#3498DB] hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#3498DB]">
          {industry?.name || article.industryId}
        </span>
        <span className="text-xs text-gray-400">{article.readTime}</span>
      </div>
      <h3 className="font-semibold text-[#2C3E50] group-hover:text-[#3498DB] transition-colors leading-snug mb-2">
        {article.title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
        {article.description}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Clock className="h-3 w-3" />
        <span>{article.date}</span>
      </div>
    </Link>
  );
}

function ExpertiseBlock({ expert }: { expert: ExpertProfile }) {
  const industryNames = new Set<string>();
  const categoryNames = new Set<string>();
  const articles = getArticlesByExpertId(expert.id);
  for (const a of articles) {
    const ind = getIndustryById(a.industryId);
    if (ind) industryNames.add(ind.name);
  }
  const categoriesFromData: Record<string, string> = {
    automation: "Автоматизация",
    "digital-banking": "Цифровой банкинг",
    telemed: "Телемедицина",
    omnichannel: "Омниканальность",
    "adaptive-learning": "Адаптивное обучение",
    "ev-tech": "Технологии электромобилей",
    "ai-ml": "ИИ и машинное обучение",
    office: "Офисная недвижимость",
    esg: "ESG",
    cybersecurity: "Кибербезопасность",
  };
  for (const a of articles) {
    const catName = categoriesFromData[a.categoryId];
    if (catName) categoryNames.add(catName);
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
      <div className="flex items-center gap-2 text-[#1ABC9C] mb-4">
        <GraduationCap className="h-5 w-5" />
        <span className="font-semibold text-sm tracking-wide uppercase">
          Области экспертизы
        </span>
      </div>
      {expert.expertise.length > 0 && (
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Компетенции
          </span>
          <div className="flex flex-wrap gap-1.5">
            {expert.expertise.map((exp) => (
              <span
                key={exp}
                className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-[#3498DB]"
              >
                {exp}
              </span>
            ))}
          </div>
        </div>
      )}
      {industryNames.size > 0 && (
        <div className="mb-4">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Сектора
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(industryNames).map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-sm font-medium text-[#1ABC9C]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
      {categoryNames.size > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 block">
            Категории
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(categoryNames).map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-sm font-medium text-gray-600"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function ExpertProfileClient({
  expertId,
  staticExpert,
  staticArticles,
}: {
  expertId: string;
  staticExpert: ExpertProfile;
  staticArticles: Article[];
}) {
  const [expert] = useState<ExpertProfile>(() => {
    if (typeof window === "undefined") return staticExpert;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${expertId}`);
      if (stored) {
        const saved = JSON.parse(stored) as {
          name: string;
          bio?: string;
          expertise?: string[];
          credentials?: string[];
          socialLinks?: { platform: string; url: string }[];
          avatar?: string;
          email?: string;
        };
        return {
          ...staticExpert,
          name: saved.name || staticExpert.name,
          bio: saved.bio || staticExpert.bio,
          expertise: saved.expertise || staticExpert.expertise,
          credentials: saved.credentials || staticExpert.credentials,
          socialLinks: saved.socialLinks || staticExpert.socialLinks,
        };
      }
    } catch {
      // ignore
    }
    return staticExpert;
  });

  const expertArticles = staticArticles.map((a) => ({
    ...a,
    industryName: getIndustryById(a.industryId)?.name || a.industryId,
  }));

  return (
    <>
      <PageSchema expert={expert} />
      <div className="mx-auto px-4 max-w-4xl py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#3498DB] transition-colors">
            Главная
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#2C3E50] font-medium">{expert.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#3498DB] text-white text-3xl font-bold">
            {expert.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50] leading-tight mb-2">
              {expert.name}
            </h1>
            <p className="text-base text-gray-600 leading-relaxed mb-4">
              {expert.bio}
            </p>
            {expert.credentials.length > 0 && (
              <ul className="space-y-1 mb-4">
                {expert.credentials.map((cred) => (
                  <li
                    key={cred}
                    className="text-sm text-gray-500 flex items-center gap-2"
                  >
                    <CheckCheck className="h-4 w-4 text-[#27AE60] shrink-0" />
                    {cred}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <SubscribeButton expertId={expert.id} expertName={expert.name} />
              {expert.email && (
                <a
                  href={`mailto:${expert.email}`}
                  className="inline-flex items-center gap-1.5 text-sm text-[#3498DB] hover:text-[#1ABC9C] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {expert.email}
                </a>
              )}
              {expert.socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#3498DB] hover:text-[#1ABC9C] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        <ExpertiseBlock expert={expert} />

        <section className="mb-8">
          <div className="flex items-center gap-2 text-[#2C3E50] mb-5">
            <FileText className="h-5 w-5" />
            <h2 className="font-semibold text-lg tracking-tight">
              Статьи эксперта
            </h2>
            <span className="text-sm text-gray-400 font-normal">
              ({expertArticles.length})
            </span>
          </div>
          {expertArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <BookOpen className="h-12 w-12 mb-3 text-gray-200" />
              <p className="text-sm">
                У эксперта пока нет опубликованных статей
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {expertArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
