"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  ExternalLink,
  GraduationCap,
  Award,
  Briefcase,
  FileText,
  Globe,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type ExpertData = {
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
  credentials?: string[];
  socialLinks?: { platform: string; url: string }[];
  workExperience?: {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  publications?: {
    title: string;
    url?: string;
    date?: string;
    description?: string;
  }[];
  achievements?: { title: string; date?: string; description?: string }[];
  mediaMentions?: {
    outlet: string;
    title: string;
    url?: string;
    date?: string;
  }[];
  faq?: { question: string; answer: string }[];
  testimonials?: { name: string; role?: string; text: string }[];
  callToAction?: string;
};

function AuthorSchema({ expert }: { expert: ExpertData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: expert.name,
    description: expert.bio,
    ...(expert.expertise?.length ? { knowsAbout: expert.expertise } : {}),
    ...(expert.credentials?.length
      ? {
          hasCredential: expert.credentials.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            name: c,
          })),
        }
      : {}),
    ...(expert.socialLinks?.length
      ? { sameAs: expert.socialLinks.map((l) => l.url) }
      : {}),
    ...(expert.achievements?.length
      ? { award: expert.achievements.map((a) => a.title) }
      : {}),
    ...(expert.publications?.length
      ? {
          citation: expert.publications.map((p) => ({
            "@type": "CreativeWork",
            name: p.title,
            url: p.url,
            datePublished: p.date,
          })),
        }
      : {}),
    ...(expert.faq?.length
      ? {
          mainEntity: {
            "@type": "FAQPage",
            mainEntity: expert.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        }
      : {}),
    ...(expert.testimonials?.length
      ? {
          review: expert.testimonials.map((t) => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name, jobTitle: t.role },
            reviewBody: t.text,
          })),
        }
      : {}),
    ...(expert.email ? { email: expert.email } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8" aria-label={title}>
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2C3E50] mb-3">
        <Icon className="h-5 w-5 text-[#0039CA]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#2C3E50] hover:bg-gray-50"
      >
        {question}
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function AuthorPagePublic({ expert }: { expert: ExpertData }) {
  return (
    <div className="mx-auto px-4 max-w-3xl py-12">
      <AuthorSchema expert={expert} />

      <div className="flex flex-col sm:flex-row gap-6 mb-10">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-white text-4xl font-bold">
          {expert.name?.charAt(0) || "?"}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50]">
            {expert.name}
          </h1>
          {expert.bio && (
            <p className="mt-2 text-base text-gray-600 leading-relaxed">
              {expert.bio}
            </p>
          )}
          {expert.email && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${expert.email}`}
                className="hover:text-[#0039CA] transition-colors"
              >
                {expert.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {expert.credentials && expert.credentials.length > 0 && (
        <Section title="Образование и сертификаты" icon={GraduationCap}>
          <div className="grid gap-2 sm:grid-cols-2">
            {expert.credentials.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
              >
                <p className="text-sm font-medium text-[#2C3E50]">{c}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {expert.expertise && expert.expertise.length > 0 && (
        <Section title="Области экспертизы" icon={Award}>
          <div className="flex flex-wrap gap-2">
            {expert.expertise.map((e, i) => (
              <span
                key={i}
                className="rounded-full bg-[#0039CA]/10 px-3 py-1 text-sm font-medium text-[#0039CA]"
              >
                {e}
              </span>
            ))}
          </div>
        </Section>
      )}

      {expert.workExperience && expert.workExperience.length > 0 && (
        <Section title="Опыт работы" icon={Briefcase}>
          <div className="space-y-3">
            {expert.workExperience.map((w, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#2C3E50]">
                      {w.position}
                    </p>
                    <p className="text-sm text-gray-500">{w.company}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {w.startDate}
                    {w.endDate ? ` – ${w.endDate}` : " – н.в."}
                  </span>
                </div>
                {w.description && (
                  <p className="mt-2 text-sm text-gray-600">{w.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {expert.publications && expert.publications.length > 0 && (
        <Section title="Публикации и исследования" icon={FileText}>
          <div className="space-y-2">
            {expert.publications.map((p, i) => (
              <div
                key={i}
                className="flex items-start justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#2C3E50]">
                    {p.title}
                  </p>
                  {p.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.description}
                    </p>
                  )}
                </div>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-gray-400 hover:text-[#0039CA] transition-colors ml-3"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {expert.achievements && expert.achievements.length > 0 && (
        <Section title="Достижения и награды" icon={Award}>
          <div className="grid gap-2 sm:grid-cols-2">
            {expert.achievements.map((a, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-100 bg-amber-50/30 px-4 py-3"
              >
                <p className="text-sm font-medium text-[#2C3E50]">{a.title}</p>
                {a.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {a.description}
                  </p>
                )}
                {a.date && (
                  <span className="text-xs text-amber-600 mt-1 inline-block">
                    {a.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {expert.mediaMentions && expert.mediaMentions.length > 0 && (
        <Section title="Упоминания в СМИ" icon={Globe}>
          <div className="space-y-2">
            {expert.mediaMentions.map((m, i) => (
              <div
                key={i}
                className="flex items-start justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <span className="text-xs font-medium text-[#0039CA]">
                    {m.outlet}
                  </span>
                  <p className="text-sm text-[#2C3E50]">{m.title}</p>
                </div>
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-gray-400 hover:text-[#0039CA] transition-colors ml-3"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {expert.socialLinks && expert.socialLinks.length > 0 && (
        <Section title="Социальные сети и контакты" icon={Globe}>
          <div className="flex flex-wrap gap-3">
            {expert.socialLinks.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-[#0039CA] hover:text-[#0039CA] transition-colors"
              >
                {l.platform} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {expert.faq && expert.faq.length > 0 && (
        <Section title="Часто задаваемые вопросы" icon={MessageSquare}>
          <div className="space-y-2">
            {expert.faq.map((f, i) => (
              <FAQItem key={i} question={f.question} answer={f.answer} />
            ))}
          </div>
        </Section>
      )}

      {expert.testimonials && expert.testimonials.length > 0 && (
        <Section title="Отзывы и кейсы" icon={Star}>
          <div className="grid gap-3 sm:grid-cols-2">
            {expert.testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
              >
                <p className="text-sm text-gray-600 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#2C3E50]">
                    {t.name}
                  </span>
                  {t.role && (
                    <span className="text-xs text-gray-400">· {t.role}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {expert.callToAction && (
        <div className="mt-10 rounded-xl bg-[#0039CA] px-6 py-8 text-center">
          <p className="text-xl font-semibold text-white mb-4">
            {expert.callToAction}
          </p>
          <Link
            href={`mailto:${expert.email}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0039CA] hover:bg-blue-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Связаться
          </Link>
        </div>
      )}
    </div>
  );
}
