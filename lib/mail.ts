import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mail.ru",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM = '"Expers" <info@expers.ru>';

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({ from: FROM, ...options });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
