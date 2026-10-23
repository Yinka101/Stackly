/**
 * kits.ts — Practice Kit catalog (server-only).
 *
 * Amounts are defined HERE on the server. The client sends only a kitId;
 * the server looks up the price. This prevents client-side price tampering.
 *
 * practiceDollarsAwarded: how many Practice Dollars the learner receives.
 * xpAwarded: bonus XP on completion.
 * priceUsd: real USD charged to the parent via PayPal sandbox.
 */

export interface Kit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  priceUsd: string;        // string to avoid float rounding issues with PayPal
  practiceDollarsAwarded: number;
  xpAwarded: number;
}

export const KITS: Kit[] = [
  {
    id: 'lemonade-stand',
    name: 'Lemonade Stand Kit',
    description: 'Start your first business with $500 Practice Dollars and a mini business lesson.',
    emoji: '🍋',
    priceUsd: '3.00',
    practiceDollarsAwarded: 500,
    xpAwarded: 100,
  },
  {
    id: 'piggy-bank-boost',
    name: 'Piggy Bank Boost',
    description: 'Add $1,000 Practice Dollars to your portfolio.',
    emoji: '🐷',
    priceUsd: '5.00',
    practiceDollarsAwarded: 1000,
    xpAwarded: 150,
  },
  {
    id: 'investor-starter',
    name: 'Investor Starter Pack',
    description: 'Unlock $2,500 Practice Dollars and the Investing Basics learning path.',
    emoji: '📈',
    priceUsd: '10.00',
    practiceDollarsAwarded: 2500,
    xpAwarded: 300,
  },
  {
    id: 'champion-bundle',
    name: 'Champion Bundle',
    description: 'The full Stackly experience: $5,000 Practice Dollars, all paths unlocked, Champion badge.',
    emoji: '🏆',
    priceUsd: '20.00',
    practiceDollarsAwarded: 5000,
    xpAwarded: 500,
  },
];

export const KITS_BY_ID = Object.fromEntries(KITS.map(k => [k.id, k]));

export function getKit(id: string): Kit | undefined {
  return KITS_BY_ID[id];
}
