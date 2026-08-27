import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null; // not configured — caller falls back to console
  }

  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false, // STARTTLS on 587
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter;
}

export async function sendResetEmail({ to, name, resetUrl }) {
  const mailer = getTransporter();

  if (!mailer) {
    console.log('\n=== PASSWORD RESET LINK (email not configured) ===');
    console.log(resetUrl);
    console.log('Valid for 30 minutes\n');
    return { sent: false };
  }

  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#201f1c">
    <div style="width:44px;height:44px;border-radius:12px;background:#4f46e5;color:#fff;
                display:flex;align-items:center;justify-content:center;
                font-size:20px;font-weight:600;font-style:italic">C</div>

    <h1 style="font-size:22px;margin:24px 0 8px">Reset your password</h1>

    <p style="color:#6f6b62;font-size:15px;line-height:1.55;margin:0 0 24px">
      Hi ${name || 'there'}, we received a request to reset the password on your
      CollabBoard account. Click the button below to choose a new one.
    </p>

    <a href="${resetUrl}"
       style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
              padding:12px 24px;border-radius:9px;font-weight:600;font-size:15px">
      Reset password
    </a>

    <p style="color:#a6a296;font-size:13px;line-height:1.55;margin:28px 0 0">
      This link expires in 30 minutes. If you didn't ask for a reset you can
      ignore this email — your password will not change.
    </p>

    <p style="color:#a6a296;font-size:12px;margin:20px 0 0;word-break:break-all">
      Button not working? Paste this into your browser:<br>${resetUrl}
    </p>
  </div>`;

  const text = `Hi ${name || 'there'},

Reset your CollabBoard password using the link below. It expires in 30 minutes.

${resetUrl}

If you didn't request this, ignore this email.`;

  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject: 'Reset your CollabBoard password',
    text,
    html,
  });

  return { sent: true };
}