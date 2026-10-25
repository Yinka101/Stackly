/**
 * secureHeaders.ts — Security response headers for every request.
 *
 * Includes: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
 *           Referrer-Policy, Permissions-Policy, and removes X-Powered-By.
 */

import type { Context, Next } from 'hono';

const isProd = process.env.NODE_ENV === 'production';

export async function secureHeaders(c: Context, next: Next) {
  await next();

  // Remove leaky header
  c.res.headers.delete('X-Powered-By');

  // Strict Transport Security (HTTPS only in prod)
  if (isProd) {
    c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Clickjacking protection
  c.header('X-Frame-Options', 'DENY');

  // MIME-type sniffing protection
  c.header('X-Content-Type-Options', 'nosniff');

  // Referrer
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions (no camera, mic, geolocation in an ed-fintech app)
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Content Security Policy
  // - PayPal sandbox JS + images are explicitly allowed
  // - PayPal SDK requires 'unsafe-inline' for its own styles (documented limitation)
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://www.paypal.com https://www.sandbox.paypal.com",
    "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
    "img-src 'self' data: https://www.paypal.com https://www.sandbox.paypal.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api-m.sandbox.paypal.com https://api-m.paypal.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  c.header('Content-Security-Policy', csp);
}
