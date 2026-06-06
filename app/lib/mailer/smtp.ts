import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.SMTP_FROM_EMAIL?.trim() || user;

  if (!user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

export async function sendAdminEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error(
      "SMTP is not configured. Set SMTP_USER and SMTP_PASSWORD in .env."
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig());
}
