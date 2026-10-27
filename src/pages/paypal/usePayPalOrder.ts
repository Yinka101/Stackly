/**
 * usePayPalOrder - manages the full Mission 3 lifecycle:
 * create → await parent approval → open popup → poll → capture → receipt
 *
 * Error states handled: cancel, decline, network failure, closed popup.
 */
import { useState, useCallback, useRef } from 'react';
import { request } from '@/utils/api';

export type OrderStage =
  | 'idle'
  | 'creating'
  | 'pending_approval'    // learner waiting for parent
  | 'approved'            // parent approved, popup not yet opened
  | 'popup_open'          // PayPal popup is open
  | 'capturing'
  | 'completed'
  | 'cancelled'
  | 'declined'
  | 'error';

export interface OrderResult {
  practiceDollarsAwarded?: number;
  xpAwarded?: number;
  kitName?: string;
  amountUsd?: string;
  orderId?: string;
}

export function usePayPalOrder() {
  const [stage, setStage] = useState<OrderStage>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [approveLink, setApproveLink] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const createOrder = useCallback(async (kitId: string, learnerId: string) => {
    setStage('creating');
    setError(null);
    setResult(null);
    try {
      const data = await request<{ orderId: string; approveLink: string }>('/paypal/orders', {
        method: 'POST',
        body: JSON.stringify({ kitId, learnerId }),
      });
      setOrderId(data.orderId);
      setApproveLink(data.approveLink);
      setStage('pending_approval');
    } catch (e) {
      setError((e as Error).message ?? 'Could not create order. Check your connection and try again.');
      setStage('error');
    }
  }, []);

  const onParentApproved = useCallback((link: string) => {
    setApproveLink(link);
    setStage('approved');
  }, []);

  const openPopup = useCallback(() => {
    if (!approveLink || !orderId) return;
    setStage('popup_open');

    const popup = window.open(
      approveLink,
      'paypal_checkout',
      'width=500,height=700,left=200,top=100,resizable=yes,scrollbars=yes'
    );
    popupRef.current = popup;

    if (!popup) {
      setError('Your browser blocked the PayPal popup. Please allow popups for this site and try again.');
      setStage('error');
      return;
    }

    // Poll for popup closure + completion
    pollRef.current = setInterval(async () => {
      const closed = !popupRef.current || popupRef.current.closed;
      if (closed) {
        clearPoll();
        // Popup closed - check order status
        try {
          const data = await request<{ status: string }>(`/paypal/orders/${orderId}`);
          if (data.status === 'completed') {
            // Already captured by webhook
            setStage('completed');
          } else if (data.status === 'created' || data.status === 'approved') {
            // User closed without paying
            setStage('cancelled');
          } else {
            setStage('cancelled');
          }
        } catch {
          setStage('cancelled');
        }
        return;
      }

      // Check if the URL has returned (PayPal redirects to return_url on approval)
      try {
        const href = popupRef.current?.location?.href ?? '';
        if (href.includes('token=') || href.includes('PayerID=')) {
          // Buyer approved in PayPal - close popup and capture
          popupRef.current?.close();
          clearPoll();
          await capture();
        }
      } catch {
        // Cross-origin frame - can't read location, keep polling
      }
    }, 1000);
  }, [approveLink, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const capture = useCallback(async () => {
    if (!orderId) return;
    setStage('capturing');
    try {
      const data = await request<{
        status: string;
        practiceDollarsAwarded?: number;
        xpAwarded?: number;
        alreadyCaptured?: boolean;
        captureStatus?: string;
        error?: string;
      }>(`/paypal/orders/${orderId}/capture`, { method: 'POST' });

      if (data.status === 'completed') {
        setResult({
          practiceDollarsAwarded: data.practiceDollarsAwarded,
          xpAwarded: data.xpAwarded,
          orderId: orderId ?? undefined,
        });
        setStage('completed');
      } else if (data.captureStatus === 'DECLINED') {
        setStage('declined');
        setError('The payment was declined by PayPal. Please try a different sandbox account.');
      } else {
        setStage('error');
        setError(data.error ?? 'Payment could not be completed.');
      }
    } catch (e) {
      setStage('error');
      setError((e as Error).message ?? 'Network error. Your payment may not have gone through - check activity before trying again.');
    }
  }, [orderId]);

  const setStageDeclined = useCallback(() => {
    setStage('declined');
    setError('A parent declined this purchase.');
  }, []);

  const reset = useCallback(() => {
    clearPoll();
    popupRef.current?.close();
    setStage('idle');
    setOrderId(null);
    setApproveLink(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    stage, orderId, approveLink, result, error,
    createOrder, onParentApproved, setStageDeclined, openPopup, capture, reset,
  };
}
