export const AGE_BANDS = ['sprouts', 'builders', 'investors'] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const BAND_LABELS: Record<AgeBand, string> = {
  sprouts: 'Sprouts',
  builders: 'Builders',
  investors: 'Investors',
};

export const BAND_AGES: Record<AgeBand, string> = {
  sprouts: '7–10',
  builders: '11–14',
  investors: '15–24',
};

export const BAND_READING_LEVEL: Record<AgeBand, string> = {
  sprouts: 'Grade 3',
  builders: 'Grade 6',
  investors: 'Grade 9',
};

export const PAYPAL_PACKAGES = [
  { index: 0, usdCents: 100, practiceDollars: 100, label: '100 Practice Dollars' },
  { index: 1, usdCents: 500, practiceDollars: 500, label: '500 Practice Dollars' },
  { index: 2, usdCents: 1000, practiceDollars: 1000, label: '1,000 Practice Dollars' },
] as const;
