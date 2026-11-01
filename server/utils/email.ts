// Shared Resend email helper
// Uses RESEND_API_KEY + APP_URL from env.
// Safe to call even when the key is absent — logs a warning instead of throwing.

const FROM = 'Stackly <noreply@stackly.com.ng>';
const APP_URL = process.env.APP_URL ?? 'https://stackly.com.ng';

interface SendOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to %s', opts.to);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[email] Resend error status=%s body=%j', res.status, result);
    } else {
      console.log('[email] Sent "%s" to %s id=%s', opts.subject, opts.to, (result as { id?: string }).id);
    }
  } catch (err) {
    console.error('[email] fetch failed:', err);
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

export function welcomeEmail(opts: { familyName: string; email: string }): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff">
      <div style="text-align:center;margin-bottom:32px">
        <span style="font-size:48px">🌱</span>
        <h1 style="font-size:28px;color:#1a1a1a;margin:12px 0 4px">Welcome to Stackly!</h1>
        <p style="color:#555;font-size:16px;margin:0">Money school for kids</p>
      </div>

      <p style="color:#333;font-size:16px;line-height:1.6">
        Hi${opts.familyName ? ` <strong>${opts.familyName}</strong>` : ''},
      </p>
      <p style="color:#333;font-size:16px;line-height:1.6">
        Your Stackly account is ready. You can now add learners to your family,
        track their progress, and approve their PayPal Lab missions - all from
        the Family dashboard.
      </p>

      <div style="background:#f0fdf4;border-radius:12px;padding:20px 24px;margin:24px 0">
        <p style="margin:0 0 12px;font-weight:bold;color:#166534;font-size:15px">Get started in 3 steps:</p>
        <ol style="margin:0;padding-left:20px;color:#166534;font-size:15px;line-height:2">
          <li>Add a learner from the Family tab</li>
          <li>Share their PIN so they can log in</li>
          <li>Watch them learn - approve missions from the Approvals tab</li>
        </ol>
      </div>

      <div style="text-align:center;margin:32px 0">
        <a href="${APP_URL}/app/family"
           style="display:inline-block;padding:14px 32px;background:#2d7a4f;color:#fff;
                  border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px">
          Go to your dashboard
        </a>
      </div>

      <p style="color:#999;font-size:13px;text-align:center;margin-top:32px">
        Questions? Reply to this email or visit
        <a href="${APP_URL}" style="color:#2d7a4f">${APP_URL.replace('https://', '')}</a>
      </p>
      <p style="color:#ccc;font-size:11px;text-align:center">
        Stackly - money school for kids. All transactions use practice money only.
      </p>
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:24px;color:#1a1a1a">Reset your Stackly password</h1>
      <p style="color:#555">Someone (hopefully you) asked to reset the password for your Stackly account.</p>
      <a href="${resetUrl}"
         style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2d7a4f;color:#fff;
                border-radius:8px;text-decoration:none;font-weight:bold">
        Reset password
      </a>
      <p style="color:#999;font-size:13px">This link expires in 1 hour. If you did not request a reset, you can safely ignore this email.</p>
      <p style="color:#ccc;font-size:11px">Stackly - money school for kids</p>
    </div>
  `;
}
