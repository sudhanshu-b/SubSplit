import nodemailer from "nodemailer";

type MailOptions = {
  to:      string;
  subject: string;
  html:    string;
  from?:   string;
};

export async function sendMail({ to, subject, html, from }: MailOptions) {
  // Create a fresh transport per call — avoids ECONNRESET on stale pooled connections
  const transport = nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtpout.secureserver.net",
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    return await transport.sendMail({
      from: from ?? process.env.SMTP_FROM ?? "LetsSplit <hello@letssplit.in>",
      to,
      subject,
      html,
    });
  } finally {
    transport.close();
  }
}

// ── Email templates ────────────────────────────────────────────────────────

const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
    .header { padding: 32px 40px 24px; border-bottom: 1px solid #f1f1f1; }
    .logo { font-size: 18px; font-weight: 800; color: #09090b; letter-spacing: -0.5px; }
    .body { padding: 32px 40px; }
    .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #a1a1aa; margin-bottom: 12px; }
    h1 { font-size: 24px; font-weight: 800; color: #09090b; margin: 0 0 12px; line-height: 1.2; }
    p { font-size: 14px; color: #71717a; line-height: 1.6; margin: 0 0 20px; }
    .btn { display: inline-block; background: #09090b; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; margin: 4px 0 24px; }
    .note { font-size: 12px; color: #a1a1aa; line-height: 1.5; }
    .footer { padding: 20px 40px 28px; border-top: 1px solid #f1f1f1; }
    .footer p { font-size: 11px; color: #a1a1aa; margin: 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <span class="logo">LetsSplit</span>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>You received this email because you have an account on letssplit.in. If this wasn't you, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;

export function verificationEmailHtml(name: string, url: string) {
  const firstName = name.split(" ")[0] ?? name;
  return base(`
    <div class="eyebrow">Email verification</div>
    <h1>Confirm your email, ${firstName}.</h1>
    <p>Thanks for signing up. Click the button below to verify your email address and activate your account.</p>
    <a href="${url}" class="btn">Verify email →</a>
    <p class="note">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
  `);
}

export function resetPasswordEmailHtml(name: string, url: string) {
  const firstName = name.split(" ")[0] ?? name;
  return base(`
    <div class="eyebrow">Password reset</div>
    <h1>Reset your password, ${firstName}.</h1>
    <p>We received a request to reset the password for your LetsSplit account. Click the button below to choose a new one.</p>
    <a href="${url}" class="btn">Reset password →</a>
    <p class="note">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
  `);
}

export function welcomeEmailHtml(name: string) {
  const firstName = name.split(" ")[0] ?? name;
  return base(`
    <div class="eyebrow">Welcome</div>
    <h1>Hey ${firstName}, welcome to LetsSplit.</h1>
    <p>You're in. LetsSplit lets you share subscription costs with people you trust — split Netflix, Spotify, iCloud and more without the awkward reminders.</p>
    <a href="https://letssplit.in/home" class="btn">Get started →</a>
    <p class="note">Browse available plans to join one, or list your own and start splitting costs today.</p>
  `);
}
