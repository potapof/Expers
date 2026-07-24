import type { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  Mail,
  Phone,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Условия возврата — EXPERS.ru",
  description:
    "Условия и порядок возврата денежных средств за приобретённые права публикации в каталоге EXPERS.ru.",
};

export default function RefundPage() {
  return (
    <div className="animate-in fade-in duration-500">
      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <div className="flex justify-center mb-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0039CA]/10">
              <RotateCcw className="h-6 w-6 text-[#0039CA]" />
            </span>
          </div>
          <h1 suppressHydrationWarning className="text-3xl font-bold tracking-tight text-[#2C3E50] mb-3">
            Условия возврата
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Неотъемлемая часть{" "}
            <Link href="/offer" className="text-[#0039CA] hover:underline">
              публичной оферты
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 space-y-10">
        <div className="rounded-2xl border-l-4 border-amber-400 bg-amber-50/60 px-6 py-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed text-gray-700">
              <p className="font-semibold text-[#2C3E50] mb-1">
                Что именно вы покупаете
              </p>
              <p>
                На EXPERS.ru продаётся <strong>право публикации</strong> —
                имущественное право разместить одну экспертную статью в
                каталоге. Сделка совершается в момент оплаты: вы приобретаете
                право, которое принадлежит вам бессрочно. Размещение статьи —
                это реализация уже приобретённого права, а не услуга,
                оказываемая после оплаты. Если вы не опубликовали статью — право
                остаётся у вас навсегда. Оно приобретено.
              </p>
            </div>
          </div>
        </div>

        <section>
          <h2 suppressHydrationWarning className="text-lg font-bold text-[#2C3E50] mb-4">
            Когда возврат возможен
          </h2>
          <div className="space-y-3">
            {[
              "Вы приобрели право публикации, но не направили статью на редакционную проверку — и с даты оплаты прошло не более 10 календарных дней.",
              "Произошло двойное или ошибочное списание денежных средств.",
            ].map((text, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1ABC9C]/10 mt-0.5">
                  <span className="text-[10px] font-bold text-[#1ABC9C]">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 suppressHydrationWarning className="text-lg font-bold text-[#2C3E50] mb-4">
            Когда возврат невозможен
          </h2>
          <div className="space-y-3">
            {[
              "С даты оплаты прошло более 10 календарных дней. Право публикации приобретено, сделка совершена.",
              "Вы направили статью на редакционную проверку. С этого момента право публикации считается принятым вами в полном объёме — вне зависимости от результата проверки.",
              "Статья размещена в каталоге. Право публикации использовано.",
            ].map((text, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4"
              >
                <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 suppressHydrationWarning className="text-lg font-bold text-[#2C3E50] mb-4">
            Как оформить возврат
          </h2>
          <div className="space-y-0">
            {[
              {
                n: 1,
                text: "Направьте заявление на email info@fonai.ru (или позвоните +7 (495) 324-30-88). Укажите: email вашего аккаунта на EXPERS.ru, дату и сумму платежа.",
              },
              {
                n: 2,
                text: "Мы рассмотрим заявление в течение 10 (десяти) дней с момента получения и сообщим решение на ваш email.",
              },
              {
                n: 3,
                text: "При удовлетворении заявления возврат производится на ту же банковскую карту, с которой была произведена оплата, через сервис Т-Банка. Срок зачисления средств зависит от банка-эмитента карты (обычно от 1 до 30 дней).",
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
                <p className="pb-8 pt-1.5 text-sm leading-relaxed text-gray-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
          <h2 suppressHydrationWarning className="text-base font-bold text-[#2C3E50] mb-4">
            Контакты для обращений
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="mailto:info@fonai.ru"
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-[#0039CA]/30 transition-colors"
            >
              <Mail className="h-5 w-5 text-[#0039CA] shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-[#2C3E50]">
                  info@fonai.ru
                </p>
              </div>
            </a>
            <a
              href="tel:+74953243088"
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 hover:border-[#0039CA]/30 transition-colors"
            >
              <Phone className="h-5 w-5 text-[#0039CA] shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Телефон</p>
                <p className="text-sm font-medium text-[#2C3E50]">
                  +7 (495) 324-30-88
                </p>
              </div>
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Получатель: ООО «ФОНИИ», ИНН 7720943604, ОГРН 1257700013141. Режим
            работы: пн–пт 10:00–18:00 (МСК).
          </p>
        </section>
      </div>
    </div>
  );
}
