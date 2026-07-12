"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  User,
  Plus,
  X,
  Eye,
  Save,
  GraduationCap,
  Award,
  CheckCheck,
  ExternalLink,
  Mail,
  BookOpen,
  FileText,
  Globe,
} from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
}

interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  expertise?: string[];
  credentials?: string[];
  socialLinks?: SocialLink[];
}

const STORAGE_KEY_PREFIX = "expers-profile-";

function ExpertPreview({
  profile,
  onClose,
}: {
  profile: ExpertProfile;
  onClose: () => void;
}) {
  const { name, bio, expertise, credentials, socialLinks, email } = profile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-[#2C3E50]">
            Предпросмотр профиля
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-white text-3xl font-bold">
              {name?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50] leading-tight mb-2">
                {name || "Имя не указано"}
              </h1>
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                {bio || "Bio не заполнено"}
              </p>
              {credentials && credentials.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {credentials.map((cred) => (
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
                {socialLinks &&
                  socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#0039CA] hover:text-[#1ABC9C] transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.platform}
                    </a>
                  ))}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 text-sm text-[#0039CA] hover:text-[#1ABC9C] transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    {email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {expertise && expertise.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
              <div className="flex items-center gap-2 text-[#1ABC9C] mb-4">
                <GraduationCap className="h-5 w-5" />
                <span className="font-semibold text-sm tracking-wide uppercase">
                  Области экспертизы
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {expertise.map((exp) => (
                  <span
                    key={exp}
                    className="inline-flex items-center rounded-md bg-[#0039CA]/10 px-2.5 py-1 text-sm font-medium text-[#0039CA]"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <div className="flex items-center gap-2 text-[#2C3E50] mb-5">
              <FileText className="h-5 w-5" />
              <h2 className="font-semibold text-lg tracking-tight">
                Статьи эксперта
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <BookOpen className="h-12 w-12 mb-3 text-gray-200" />
              <p className="text-sm">Список статей появится после публикации</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AuthorProfileEditor() {
  const { expert } = useAuth();
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const storageKey = expert ? `${STORAGE_KEY_PREFIX}${expert.id}` : null;

  const loadProfile = useCallback(async () => {
    if (!expert) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const stored = storageKey ? localStorage.getItem(storageKey) : null;
      if (stored) {
        setProfile(JSON.parse(stored));
        setLoading(false);
        return;
      }

      const res = await fetch("/api/expert/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        const p: ExpertProfile = {
          id: data.expert.id,
          name: data.expert.name,
          email: data.expert.email,
          avatar: data.expert.avatar || "",
          bio: data.expert.bio || "",
          expertise: data.expert.expertise || [],
          credentials: data.expert.credentials || [],
          socialLinks: data.expert.socialLinks || [],
        };
        setProfile(p);
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(p));
        }
      } else {
        setProfile({
          id: expert.id,
          name: expert.name,
          email: expert.email,
          avatar: "",
          bio: "",
          expertise: [],
          credentials: [],
          socialLinks: [],
        });
      }
    } catch {
      setProfile({
        id: expert?.id || "",
        name: expert?.name || "",
        email: expert?.email || "",
        avatar: "",
        bio: "",
        expertise: [],
        credentials: [],
        socialLinks: [],
      });
    } finally {
      setLoading(false);
    }
  }, [expert, storageKey]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = <K extends keyof ExpertProfile>(
    key: K,
    value: ExpertProfile[K]
  ) => {
    if (!profile) return;
    const updated = { ...profile, [key]: value };
    setProfile(updated);
  };

  const addExpertise = () => {
    if (!profile) return;
    updateField("expertise", [...(profile.expertise || []), ""]);
  };

  const updateExpertise = (index: number, value: string) => {
    if (!profile?.expertise) return;
    const updated = [...profile.expertise];
    updated[index] = value;
    updateField("expertise", updated);
  };

  const removeExpertise = (index: number) => {
    if (!profile?.expertise) return;
    updateField(
      "expertise",
      profile.expertise.filter((_, i) => i !== index)
    );
  };

  const addCredential = () => {
    if (!profile) return;
    updateField("credentials", [...(profile.credentials || []), ""]);
  };

  const updateCredential = (index: number, value: string) => {
    if (!profile?.credentials) return;
    const updated = [...profile.credentials];
    updated[index] = value;
    updateField("credentials", updated);
  };

  const removeCredential = (index: number) => {
    if (!profile?.credentials) return;
    updateField(
      "credentials",
      profile.credentials.filter((_, i) => i !== index)
    );
  };

  const addSocialLink = () => {
    if (!profile) return;
    updateField("socialLinks", [
      ...(profile.socialLinks || []),
      { platform: "", url: "" },
    ]);
  };

  const updateSocialLink = (
    index: number,
    key: "platform" | "url",
    value: string
  ) => {
    if (!profile?.socialLinks) return;
    const updated = [...profile.socialLinks];
    updated[index] = { ...updated[index], [key]: value };
    updateField("socialLinks", updated);
  };

  const removeSocialLink = (index: number) => {
    if (!profile?.socialLinks) return;
    updateField(
      "socialLinks",
      profile.socialLinks.filter((_, i) => i !== index)
    );
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const id = toast.loading("Сохраняем профиль...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expert/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: profile.name,
          avatar: profile.avatar || undefined,
          bio: profile.bio || undefined,
          expertise: profile.expertise?.filter((e) => e.trim()) || undefined,
          credentials:
            profile.credentials?.filter((c) => c.trim()) || undefined,
          socialLinks:
            profile.socialLinks?.filter(
              (s) => s.platform.trim() && s.url.trim()
            ) || undefined,
        }),
      });

      if (res.ok) {
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(profile));
        }
        toast.success("Профиль сохранён", { id });
      } else if (res.status === 503) {
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(profile));
        }
        toast.success("Профиль сохранён локально", { id });
      } else {
        const data = await res.json();
        toast.error(data.error || "Ошибка сохранения", { id });
      }
    } catch {
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(profile));
      }
      toast.success("Профиль сохранён локально", { id });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <User className="h-8 w-8 mr-2" />
        <span className="text-sm">Не удалось загрузить профиль</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2C3E50]">
            Редактирование профиля
          </h2>
          <p className="text-sm text-gray-400">
            Настройте, как ваш профиль видят читатели
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Предпросмотр
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-[#0039CA]" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0039CA] text-white text-xl font-bold">
              {profile.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                URL аватара
              </label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={profile.avatar || ""}
                onChange={(e) => updateField("avatar", e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Укажите ссылку на изображение или оставьте пустым для аватара по
                умолчанию
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Имя *
            </label>
            <Input
              placeholder="Иван Иванов"
              value={profile.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Bio
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Расскажите о себе: опыт, специализация, достижения"
              value={profile.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">До 2000 символов</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4 text-[#1ABC9C]" />
            Темы экспертизы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.expertise?.map((exp, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Например: Промышленная автоматизация"
                value={exp}
                onChange={(e) => updateExpertise(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeExpertise(i)}
                className="rounded-md p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addExpertise}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить тему
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-[#27AE60]" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.credentials?.map((cred, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Например: Кандидат технических наук"
                value={cred}
                onChange={(e) => updateCredential(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeCredential(i)}
                className="rounded-md p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addCredential}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить достижение
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-[#0039CA]" />
            Социальные сети
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.socialLinks?.map((link, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Платформа (LinkedIn, Telegram, YouTube...)"
                  value={link.platform}
                  onChange={(e) =>
                    updateSocialLink(i, "platform", e.target.value)
                  }
                />
                <Input
                  placeholder="URL профиля"
                  value={link.url}
                  onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeSocialLink(i)}
                className="rounded-md p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSocialLink}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить соцсеть
          </Button>
        </CardContent>
      </Card>

      {showPreview && (
        <ExpertPreview
          profile={profile}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
