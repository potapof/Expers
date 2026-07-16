import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, Mail, Phone, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Условия возврата — EXPERS.ru",
  description:
    "Условия и порядок возврата денежных средств за неиспользованные права публикации в каталоге EXPERS.ru.",
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
          <h1 className="text-3xl font-bold tracking-tight text-[#2C3E50] mb-3">
            Условия возврата
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Порядок возврата денежных средств за неиспользованные права
            публикации. Неотъемлемая часть{" "}
            <Link href="/offer" className="text-[#0039CA] hover:underline">
              публичной оферты
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-[#2C3E50] mb-4">
            Когда возврат возможен
          </h2>
          <div className="space-y-3">
            {[
              "Право публикации не использовано: статья ещё не размещена в каталоге. Вы можете отказаться от договора в любой момент до размещения статьи (ст. 32 Закона РФ «О защите прав потребителей», ст. 782 ГК РФ).",
              "Произошло двойное или ошибочное списание денежных средств.",
              "Исполнитель отказал в размещении статьи, и вы не хотите использовать право публикации для другой статьи.",
            ].map((text, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4"
              >
                <CheckCircle2 className="h-5 w-5 text-[#1ABC9C] shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#2C3E50] mb-4">
            Когда возврат невозможен
          </h2>
          <div className="flex gap-3 rounded-xl border border-gray-100 bg-white px-5 py-4">
            <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed text-gray-600">
              Право публикации использовано: статья прошла редакционную проверку
              и размещена в каталоге. С этого момента услуга считается оказанной
              в полном объёме, и денежные средства за соответствующее право
              публикации возврату не подлежат (п. 6.2 оферты).
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#2C3E50] mb-4">
            Как оформить возврат
          </h2>
          <div className="space-y-0">
            {[
              {
                n: 1,
                text: "Направьте заявление на email info@fonai.ru (или позвоните +7 (495) 324-30-88). Укажите: email вашего аккаунта на EXPERS.ru, дату и сумму платежа, причину возврата.",
              },
              {
                n: 2,
                text: "Мы рассмотрим заявление в течение 10 (десяти) дней с момента получения и сообщим решение на ваш email.",
              },
              {
                n: 3,
                text: "Возврат производится на ту же банковскую карту, с которой была произведена оплата, через сервис Т-Банка. Срок зачисления средств зависит от банка-эмитента карты (обычно от 1 до 30 дней).",
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
          <h2 className="text-base font-bold text-[#2C3E50] mb-4">
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
