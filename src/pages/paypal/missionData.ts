/**
 * missionData.ts — content for PayPal Lab missions 1, 2 and 4.
 * Mission 3 is fully dynamic (real sandbox flow).
 */

import type { AgeBand } from '@/lib/session';

export interface SimStep {
  id: string;
  visual: string;          // emoji or icon name
  title: Record<AgeBand, string>;
  body: Record<AgeBand, string>;
  coachTip: Record<AgeBand, string>;
  interaction?: 'tap' | 'type' | 'choose';
  choices?: string[];
  correctChoice?: number;
  inputLabel?: string;
}

// ── Mission 1: Send Money Safely ─────────────────────────────────────────────
export const sendMoneySteps: SimStep[] = [
  {
    id: 'sm-1',
    visual: '👋',
    title: {
      sprouts:   'Say you want to pay a friend',
      builders:  'Starting a payment',
      investors: 'Initiating a transfer',
    },
    body: {
      sprouts:   'Imagine you sold a drawing to your friend Mia for $2. You can use PayPal to send her the money — no coins, no paper!',
      builders:  'You owe your friend $10 for a birthday gift you split. PayPal lets you send money in seconds using just their email or phone number.',
      investors: 'Peer-to-peer payments let you settle up with anyone who has a PayPal account. You only need their email address or mobile number — no bank details shared.',
    },
    coachTip: {
      sprouts:   'PayPal is like a digital piggy bank you can use to pay friends!',
      builders:  'Always double-check the email before you send — one typo and the money goes to a stranger.',
      investors: 'PayPal Friends & Family is free between personal accounts in the same country. Business payments charge a fee.',
    },
    interaction: 'tap',
  },
  {
    id: 'sm-2',
    visual: '🔍',
    title: {
      sprouts:   'Find your friend',
      builders:  'Enter the recipient',
      investors: 'Recipient lookup',
    },
    body: {
      sprouts:   'Type Mia\'s email address. PayPal checks if she has an account.',
      builders:  'Enter your friend\'s email or phone number. PayPal looks them up and shows their name so you can confirm it\'s the right person.',
      investors: 'PayPal resolves the recipient by email or phone. You\'ll see their display name before committing — always verify it matches who you intend to pay.',
    },
    coachTip: {
      sprouts:   'Check with a grown-up before you type anyone\'s email!',
      builders:  'See a name you don\'t recognise? Stop and check — don\'t send money to the wrong account.',
      investors: 'PayPal\'s name-confirmation step is a lightweight but important fraud check. Treat it seriously.',
    },
    interaction: 'type',
    inputLabel:  'Enter email: mia@example.com',
  },
  {
    id: 'sm-3',
    visual: '💵',
    title: {
      sprouts:   'Type the amount',
      builders:  'Enter the amount',
      investors: 'Set the transfer amount',
    },
    body: {
      sprouts:   'Type $2.00. PayPal shows you exactly what will happen before you press send.',
      builders:  'Type the amount — $10.00. You\'ll see a summary screen next. Always check the total before confirming.',
      investors: 'Enter the exact amount. For cross-currency transfers PayPal will show an exchange rate. Check it against mid-market rate before accepting.',
    },
    coachTip: {
      sprouts:   'Practice Dollars are pretend money. In real life, always ask your parent first!',
      builders:  'PayPal shows the amount in big text on the confirm screen. Read it carefully — you can\'t undo a real payment.',
      investors: 'PayPal\'s currency conversion markup averages 3–4 % above mid-market. For large amounts, a specialist service may be cheaper.',
    },
    interaction: 'type',
    inputLabel:  'Amount: $2.00',
  },
  {
    id: 'sm-4',
    visual: '✅',
    title: {
      sprouts:   'Review and send!',
      builders:  'Confirm and send',
      investors: 'Review and execute',
    },
    body: {
      sprouts:   'Check the name, the amount and the message. If everything looks right, tap Send. Mia gets a notification right away!',
      builders:  'The confirm screen shows recipient, amount, and any note. If it\'s all correct, tap Send. The money moves in seconds.',
      investors: 'The confirmation step shows the full transaction detail. Once you tap Send the instruction is irrevocable. Verify recipient, amount, and currency before confirming.',
    },
    coachTip: {
      sprouts:   'You did it! That\'s how easy it is to send money safely.',
      builders:  'Done! PayPal emails a receipt to both you and Mia automatically.',
      investors: 'Post-send, both parties receive a transaction receipt. Check your Activity tab to track the transfer status.',
    },
    interaction: 'tap',
  },
];

// ── Mission 2: Request Money ─────────────────────────────────────────────────
export const requestMoneySteps: SimStep[] = [
  {
    id: 'rm-1',
    visual: '🙋',
    title: {
      sprouts:   'Ask for your money back',
      builders:  'Request a payment',
      investors: 'Issuing a payment request',
    },
    body: {
      sprouts:   'Did someone borrow $3 from you? PayPal lets you ask for it back without feeling awkward — just send a request!',
      builders:  'Your friend forgot to pay you back for lunch. Instead of asking in person, send a PayPal request — they get a message with a Pay Now button.',
      investors: 'Payment requests (money requests) send an email to the payer with a direct Pay Now link. Useful for informal invoicing without a full invoice system.',
    },
    coachTip: {
      sprouts:   'Requesting money is just asking nicely — but with a button!',
      builders:  'A request is not a charge. The other person still has to choose to pay.',
      investors: 'Unlike an invoice, a money request has no payment terms, no due date, and no legal standing — it\'s a convenience tool, not a contract.',
    },
    interaction: 'tap',
  },
  {
    id: 'rm-2',
    visual: '✍️',
    title: {
      sprouts:   'Add a note',
      builders:  'Write a reason',
      investors: 'Add a memo',
    },
    body: {
      sprouts:   'Type "For the stickers I gave you" so your friend remembers what it\'s for.',
      builders:  'Add a short note like "Lunch on Tuesday" so the payer knows exactly what they\'re paying for.',
      investors: 'A clear memo reduces disputes. Keep it factual: date, item, and amount. Avoid ambiguous descriptions.',
    },
    coachTip: {
      sprouts:   'A friendly note helps your friend remember what they owe!',
      builders:  'Clear notes prevent "I didn\'t know what that was for" arguments.',
      investors: 'For business requests, a memo becomes part of the transaction record — treat it like a mini-invoice line item.',
    },
    interaction: 'type',
    inputLabel:  'Add a note…',
  },
  {
    id: 'rm-3',
    visual: '📨',
    title: {
      sprouts:   'Send the request',
      builders:  'Send it!',
      investors: 'Dispatch the request',
    },
    body: {
      sprouts:   'Tap Send Request. Your friend gets an email with a Pay button inside. They can pay straight from the email.',
      builders:  'Tap Send Request. Your friend gets an email with a big Pay Now button. Once they pay, the money lands in your PayPal balance.',
      investors: 'The payer receives an email with a tokenised Pay Now link. When they complete payment, PayPal notifies you and the funds settle to your balance — usually instantly for domestic transfers.',
    },
    coachTip: {
      sprouts:   'Great job! Now you know how to ask for money safely.',
      builders:  'If they don\'t pay after a few days, you can send a reminder from the Activity tab.',
      investors: 'You can track pending requests under Activity → Requests. Unresolved requests expire after 30 days.',
    },
    interaction: 'tap',
  },
];

// ── Mission 4: Spot the Scam ─────────────────────────────────────────────────
export interface ScamExample {
  id: string;
  scenario: Record<AgeBand, string>;
  isScam: boolean;
  redFlags: string[];
  safeAction: Record<AgeBand, string>;
}

export const scamExamples: ScamExample[] = [
  {
    id: 'scam-1',
    scenario: {
      sprouts:   'You get an email saying "Your PayPal account is frozen! Click here NOW to fix it." The email address says paypa1-support@gmail.com.',
      builders:  'An email arrives: "URGENT: Suspicious login detected. Verify your account in 24 hours or it will be permanently closed." The sender is paypa1-support@gmail.com.',
      investors: 'You receive an email: "Account Limitation Notice — verify your identity within 24 hours to avoid suspension." Sender: paypa1-support@gmail.com. The link in the email goes to paypa1.com/verify.',
    },
    isScam: true,
    redFlags: ['paypa1 (number 1, not letter l)', 'Gmail address, not @paypal.com', 'Creates urgency to panic you', 'Link goes to wrong domain'],
    safeAction: {
      sprouts:   'Don\'t click anything! Show the email to a grown-up. Real PayPal emails always come from @paypal.com.',
      builders:  'Delete it. Open PayPal.com in a new tab yourself — never via a link in a suspicious email. Check your account there directly.',
      investors: 'Phishing attempt. Verify: (1) sender domain — must be @paypal.com, (2) hover the link — must resolve to paypal.com, (3) log in directly at paypal.com, never from a link. Report to spoof@paypal.com.',
    },
  },
  {
    id: 'scam-2',
    scenario: {
      sprouts:   'Someone messages you: "I sent you $50 by mistake! Please send it back." But you check your PayPal and there\'s no new money there.',
      builders:  'A stranger messages: "I accidentally sent you $50. Please refund it." You check your PayPal balance — it hasn\'t changed.',
      investors: 'An unknown sender claims: "I overpaid you $200 by mistake. Please refund via Friends & Family." Your balance shows no incoming payment.',
    },
    isScam: true,
    redFlags: ['No payment actually received', 'Creates a false sense of obligation', 'Friends & Family request means no buyer protection', 'Classic overpayment scam'],
    safeAction: {
      sprouts:   'If you didn\'t get any money, you don\'t need to send any back! Tell a grown-up.',
      builders:  'Ignore it. If money genuinely arrives in your PayPal, contact PayPal support directly — never send money to a stranger asking you to "refund" them.',
      investors: 'Overpayment scam. The payment may appear then reverse (fraudulent funding source). Never send money to reverse an unsolicited payment. Report to PayPal and block the sender.',
    },
  },
  {
    id: 'scam-3',
    scenario: {
      sprouts:   'A text message says "Congratulations! You won a $500 PayPal prize. Pay $5 to claim it." ',
      builders:  'You get a text: "You\'ve won $500 in PayPal\'s anniversary giveaway! Pay a $5 processing fee to claim your prize."',
      investors: 'SMS: "PayPal Rewards: You\'ve been selected for a $500 cashback. Pay $4.99 processing fee via PayPal to release funds."',
    },
    isScam: true,
    redFlags: ['PayPal never asks you to pay to receive a prize', 'Legitimate lotteries never charge a fee to claim', 'SMS is not PayPal\'s official channel for prizes', 'Too good to be true'],
    safeAction: {
      sprouts:   'Real prizes never ask you to pay first! Ignore and delete.',
      builders:  'Delete the text. Paying a "fee" to claim a prize is always a scam — the prize doesn\'t exist.',
      investors: 'Advance-fee fraud. No legitimate prize requires payment to claim. The fee is the only "prize" the scammer wants. Delete and report to your carrier.',
    },
  },
  {
    id: 'scam-4',
    scenario: {
      sprouts:   'Your friend sends you a PayPal link. When you open it, the page looks like PayPal but the address bar says "paypal-secure-login.com".',
      builders:  'A link in a group chat says "Free PayPal $10 bonus — log in here." The URL in the address bar reads "paypal-secure-login.com".',
      investors: 'A link shared on social media prompts PayPal login. The URL is "paypal-secure-login.com/oauth2/authorize". The page is a pixel-perfect PayPal clone.',
    },
    isScam: true,
    redFlags: ['Wrong domain — paypal.com is the only real one', 'Hyphens and extra words in the domain are a red flag', 'Any page asking for PayPal login that isn\'t paypal.com is a phishing site', 'Real PayPal links always start with https://www.paypal.com'],
    safeAction: {
      sprouts:   'Stop! Check the address at the top of the browser. It must say paypal.com — nothing else.',
      builders:  'Close the tab immediately. Never type your password on any site that isn\'t exactly paypal.com. Tell your friend their account may be hacked.',
      investors: 'Credential phishing. Check the origin URL before entering credentials anywhere. Bookmark paypal.com and only log in from your bookmark. Enable 2FA on your real PayPal account.',
    },
  },
  {
    id: 'scam-5',
    scenario: {
      sprouts:   'You want to buy a toy online. The seller says "PayPal only, but use Friends & Family — it\'s cheaper." ',
      builders:  'Selling on an app, a buyer says "Please accept as Friends & Family — it saves us both fees." You\'ve never met them before.',
      investors: 'An online marketplace buyer requests: "Invoice as Friends & Family to avoid fees." The transaction is for goods worth $150.',
    },
    isScam: false,
    redFlags: ['This is a real risk — not technically a scam by the platform, but a tactic that removes YOUR protection'],
    safeAction: {
      sprouts:   'Ask a grown-up first! Friends & Family payments are for people you know and trust — not strangers.',
      builders:  'Always use Goods & Services when buying from someone you don\'t know. It costs a small fee but gives you buyer protection if something goes wrong.',
      investors: 'Friends & Family removes PayPal Purchase Protection entirely. Any stranger insisting on F&F is either trying to avoid chargebacks (fraud risk) or saving themselves fees at your expense. Decline or walk away.',
    },
  },
  {
    id: 'scam-6',
    scenario: {
      sprouts:   'A pop-up on a website says "Your PayPal was hacked! Call 1-800-555-0199 to fix it right now!"',
      builders:  'A browser pop-up: "Warning: PayPal detected unauthorised access. Call our support team at 1-800-555-0199 immediately."',
      investors: 'A browser alert states: "Critical Security Alert from PayPal — your account shows signs of compromise. Call 1-800-555-0199 for immediate assistance."',
    },
    isScam: true,
    redFlags: ['PayPal never shows a phone number in a browser pop-up', 'Calling the number connects you to scammers, not PayPal', 'Designed to make you panic and act fast', 'PayPal\'s real support is at paypal.com/help — not a phone number in a pop-up'],
    safeAction: {
      sprouts:   'Close the pop-up and tell a grown-up. Never call a number from a pop-up message!',
      builders:  'Close the browser tab. PayPal communicates via the app or email — never via pop-up phone numbers. If worried, go directly to paypal.com/help.',
      investors: 'Tech-support scam. Browser pop-ups cannot detect account breaches. Close the tab, clear cookies, and log into PayPal directly at paypal.com to verify your account status.',
    },
  },
];
