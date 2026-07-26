"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !message) return;
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          email,
          subject: subject || undefined,
          message,
        }),
      });
      if (res.ok) {
        toast.success("Сообщение отправлено");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Ошибка отправки");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0039CA]/10">
          <Send className="h-5 w-5 text-[#0039CA]" />
        </div>
        <h2
          suppressHydrationWarning
          className="text-xl font-bold tracking-tight text-[#2C3E50]"
        >
          Напишите нам
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="feedback-name"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Имя
          </label>
          <input
            id="feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
            placeholder="Ваше имя"
          />
        </div>
        <div>
          <label
            htmlFor="feedback-email"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
            placeholder="your@email.ru"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="feedback-subject"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Тема
        </label>
        <input
          id="feedback-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA]"
          placeholder="О чём хотите спросить"
        />
      </div>

      <div>
        <label
          htmlFor="feedback-message"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Сообщение <span className="text-red-400">*</span>
        </label>
        <textarea
          id="feedback-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0039CA] focus:outline-none focus:ring-1 focus:ring-[#0039CA] resize-y"
          placeholder="Ваше сообщение..."
        />
      </div>

      <Button
        type="submit"
        disabled={sending || !email || !message}
        className="w-full bg-[#0039CA] hover:bg-[#0039CA]/90 text-white"
      >
        {sending ? "Отправляю..." : "Отправить"}
      </Button>
    </form>
  );
}
