/**
 * PayPalSDKButton - renders the official PayPal JS SDK button inline.
 * Avoids the full-page redirect to sandbox.paypal.com which fails in
 * certain regions. The SDK opens its own popup and calls onApprove
 * when the buyer completes checkout.
 *
 * The SDK script is loaded dynamically so it only runs on Mission 3.
 */
import { useEffect, useRef, useState } from 'react';

interface Props {
  orderId: string;
  onApprove: () => Promise<void>;
  onCancel: () => void;
  onError: (msg: string) => void;
}

// PayPal JS SDK types (minimal)
interface PayPalNamespace {
  Buttons: (config: {
    createOrder: () => string;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel: () => void;
    onError: (err: unknown) => void;
    style?: Record<string, unknown>;
  }) => { render: (el: string | HTMLElement) => Promise<void>; isEligible: () => boolean };
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

let sdkLoading = false;
let sdkLoaded = false;
const sdkCallbacks: Array<() => void> = [];

function loadPayPalSdk(clientId: string, onReady: () => void) {
  if (sdkLoaded) { onReady(); return; }
  sdkCallbacks.push(onReady);
  if (sdkLoading) return;
  sdkLoading = true;

  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
  script.async = true;
  script.onload = () => {
    sdkLoaded = true;
    sdkLoading = false;
    sdkCallbacks.forEach(cb => cb());
    sdkCallbacks.length = 0;
  };
  script.onerror = () => {
    sdkLoading = false;
    // callbacks stay queued so next render retries
  };
  document.head.appendChild(script);
}

export function PayPalSDKButton({ orderId, onApprove, onCancel, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState('');
  const rendered = useRef(false);

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) {
      setStatus('error');
      setErrMsg('PayPal client ID not configured. Set VITE_PAYPAL_CLIENT_ID in environment.');
      return;
    }

    loadPayPalSdk(clientId, () => {
      if (rendered.current || !containerRef.current || !window.paypal) return;
      rendered.current = true;
      setStatus('ready');

      const buttons = window.paypal.Buttons({
        // Return the already-created order ID (do not create a new one)
        createOrder: () => orderId,

        onApprove: async () => {
          setStatus('processing');
          await onApprove();
        },

        onCancel: () => {
          onCancel();
        },

        onError: (err) => {
          console.error('[PayPal SDK]', err);
          const msg = typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'PayPal encountered an error. Please try again.';
          setErrMsg(msg);
          setStatus('error');
          onError(msg);
        },

        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 48,
        },
      });

      if (buttons.isEligible()) {
        void buttons.render(containerRef.current!);
      } else {
        setStatus('error');
        setErrMsg('PayPal buttons not available in this browser. Try Chrome or Firefox.');
      }
    });
  }, [clientId, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3">
      {status === 'loading' && (
        <div className="flex items-center gap-3 py-3">
          <div className="w-5 h-5 rounded-full border-2 border-[#0070BA] border-t-transparent animate-spin" />
          <span className="text-sm text-[var(--ink-muted)]">Loading PayPal checkout...</span>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex items-center gap-3 py-3">
          <div className="w-5 h-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          <span className="text-sm text-[var(--ink-muted)]">Processing payment...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      {/* PayPal renders its button into this div */}
      <div ref={containerRef} id="paypal-button-container" />

      <p className="text-xs text-center text-[var(--ink-muted)]/60">
        Sandbox mode - no real money. Sign in with your PayPal sandbox Personal account.
      </p>
    </div>
  );
}
