import type { LearningPath } from './types.js';

export const paypalBasics: LearningPath = {
  id: 'paypal-basics',
  title: 'PayPal Basics',
  emoji: '💳',
  description: 'Learn how PayPal works, how to send and receive money safely, and how to spot scams.',
  lessons: [
    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1 — What is PayPal?
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'pp-01',
      pathId: 'paypal-basics',
      order: 1,
      title: 'What is PayPal?',
      emoji: '🏦',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine you want to give your friend five dollars. You could hand them cash. But what if they live far away?\n\nPayPal is like a magic wallet that lives on the internet. A grown-up can put money into it and send it to anyone, anywhere, in just a few seconds.\n\nPayPal keeps the money safe. It uses secret codes so only the right person can open the wallet. Nobody else can peek inside.\n\nMillions of people use PayPal every day to pay for things, split bills, and help family members far away. It is one of the most trusted ways to move money on the internet.`,
          tryIt: {
            prompt: 'Which of these is the BEST reason to use PayPal?',
            type: 'choice',
            options: [
              'To send money to a friend who lives in another city',
              'To buy candy from a vending machine',
              'To store coins under your bed',
            ],
            correct: 0,
            feedbackRight: 'Yes! PayPal is great for sending money when you cannot hand it over in person.',
            feedbackWrong: 'Not quite — PayPal works over the internet, so it shines when people are far apart.',
          },
          quiz: [
            {
              question: 'What is PayPal most like?',
              options: ['A piggy bank on the internet', 'A shop that sells toys', 'A phone that makes calls'],
              answer: 0,
              explanation: 'PayPal is a digital wallet — it holds money and lets you send it online, just like a piggy bank you can access anywhere.',
            },
            {
              question: 'Who keeps your money safe in PayPal?',
              options: ['Your teacher', 'PayPal, using special secret codes', 'The post office'],
              answer: 1,
              explanation: 'PayPal uses strong security (encryption) so only you and your grown-up can access your wallet.',
            },
            {
              question: 'Can PayPal send money to someone far away?',
              options: ['No, only to people next door', 'Yes, to almost anywhere in the world', 'Only on Sundays'],
              answer: 1,
              explanation: 'Because PayPal works over the internet, distance does not matter — money arrives in seconds no matter where the other person is.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `PayPal is a digital payment platform that lets people send, receive, and store money online. Founded in 1998, it is now used by hundreds of millions of people in more than 200 countries.\n\nHere is how it works at a basic level. You link a bank account, debit card, or credit card to your PayPal account. When you want to pay, PayPal moves the money from your linked source to the recipient — without sharing your card number with the seller. That is one of the big reasons people trust it.\n\nPayPal also acts as a buffer. If you buy something and it never arrives, you can open a dispute and PayPal will investigate. This buyer protection makes it popular for online shopping.\n\nFor sellers, PayPal is equally useful. You can request money, send an invoice, or add a PayPal button to a website. The money lands in a PayPal balance that you can then transfer to your bank.`,
          tryIt: {
            prompt: 'Drag the slider to show roughly how many countries PayPal operates in.',
            type: 'slider',
            min: 50,
            max: 250,
            step: 10,
            correctMin: 190,
            correctMax: 210,
            feedbackRight: 'Spot on — PayPal works in over 200 countries, making it one of the most widely available payment tools.',
            feedbackWrong: 'The answer is around 200 countries — PayPal has a truly global reach.',
          },
          quiz: [
            {
              question: 'Why does PayPal not share your card number with sellers?',
              options: [
                'To protect your payment details from being exposed',
                'Because PayPal does not accept cards',
                'To make payments slower',
              ],
              answer: 0,
              explanation: 'Hiding your card number means that even if a seller\'s system is hacked, your details are safe.',
            },
            {
              question: 'What is buyer protection?',
              options: [
                'A system where PayPal investigates if your order never arrives',
                'A type of insurance you have to buy separately',
                'Protection only for sellers, not buyers',
              ],
              answer: 0,
              explanation: 'Buyer protection lets you dispute a transaction if you did not get what you paid for. PayPal reviews the case and may refund you.',
            },
            {
              question: 'What happens to money a seller receives via PayPal?',
              options: [
                'It disappears immediately',
                'It sits in their PayPal balance until they transfer it to a bank',
                'It goes straight to PayPal forever',
              ],
              answer: 1,
              explanation: 'PayPal holds the money in the seller\'s PayPal balance. They choose when to move it to their bank account.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `PayPal Holdings (founded 1998, spun off from eBay in 2015) operates a two-sided payment network connecting consumers and merchants across more than 200 markets. Understanding how it works is useful both as a user and as someone who may one day build fintech products or evaluate financial technology companies.\n\nAt its core, PayPal is a ledger. Every user has a PayPal balance — a record of how much money PayPal owes them. When you pay someone, PayPal debits your balance (or charges your linked funding source) and credits the recipient's balance. No physical money moves between accounts in real time; the settlement happens in batches through the banking system later.\n\nThis ledger model is why PayPal can process payments so quickly. It is also why PayPal carries regulatory obligations: in most jurisdictions it is classified as a money service business or e-money institution and must hold sufficient reserves to cover all outstanding balances.\n\nFrom a product perspective, PayPal earns revenue primarily through "take rate" fees — a percentage of each transaction, typically around 2.9% plus a fixed amount per transaction for sellers. Understanding this model matters when you evaluate any payment company: volume × take rate = revenue, and the key competitive battle is always over reducing that take rate while maintaining margin.`,
          tryIt: {
            prompt: 'A seller processes $10,000 in PayPal sales. The fee is 2.9% + $0.30 per transaction, and there were 50 transactions. How much does the seller pay in fees? Use your calculator.',
            type: 'choice',
            options: ['$290.00', '$305.00', '$320.50'],
            correct: 1,
            feedbackRight: 'Correct. $10,000 × 2.9% = $290, plus 50 × $0.30 = $15, total $305. Those fees add up fast at scale.',
            feedbackWrong: 'Try again: 2.9% of $10,000 = $290, plus 50 transactions × $0.30 each = $15. Total = $305.',
          },
          quiz: [
            {
              question: 'PayPal\'s core model is best described as:',
              options: [
                'A bank that holds deposits and makes loans',
                'A ledger that records credits and debits between users without real-time money movement',
                'A credit card network like Visa',
              ],
              answer: 1,
              explanation: 'PayPal is a ledger business. Real settlement with banks happens later in batches; what you see instantly is just a record update.',
            },
            {
              question: 'Why must PayPal hold sufficient reserves?',
              options: [
                'To pay its employees',
                'To cover all outstanding user balances as a regulated money service',
                'To fund advertising',
              ],
              answer: 1,
              explanation: 'Regulators require e-money institutions to hold liquid assets equal to outstanding user balances, so every user can always withdraw.',
            },
            {
              question: 'If PayPal\'s take rate falls but transaction volume doubles, revenue will:',
              options: [
                'Always fall, because the rate is lower',
                'Depend on whether the volume increase outweighs the rate cut',
                'Stay exactly the same',
              ],
              answer: 1,
              explanation: 'Revenue = volume × rate. A lower rate can be more than offset by much higher volume. This is why network effects and scale matter in fintech.',
            },
          ],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 2 — Sending and requesting money
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'pp-02',
      pathId: 'paypal-basics',
      order: 2,
      title: 'Sending and Requesting Money',
      emoji: '↔️',
      durationMins: 4,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Sending money with PayPal is easy. First, your grown-up taps "Send." Then they type how much and the other person's email or phone number. PayPal moves the money right away!\n\nRequesting money is just as simple. You tap "Request," type how much you need, and send a message. The other person gets a note that says "please pay me!" They tap Approve, and done — the money arrives.\n\nOne important rule: only a grown-up should send or receive real money. You can watch how it works, but the account always belongs to an adult.\n\nPractice Dollars in Stackly let you try sending pretend money so you understand the steps before you ever use real cash.`,
          tryIt: {
            prompt: 'Put these steps in the right order for SENDING money.',
            type: 'choice',
            options: [
              'Tap Send → Enter amount → Type recipient → Confirm',
              'Type recipient → Confirm → Enter amount → Tap Send',
              'Enter amount → Tap Send → Confirm → Type recipient',
            ],
            correct: 0,
            feedbackRight: 'Perfect order! Tap Send first, then fill in the details, and confirm at the end.',
            feedbackWrong: 'You always start by tapping Send, then enter how much, then who to send to, and confirm last.',
          },
          quiz: [
            {
              question: 'Who should own a real PayPal account?',
              options: ['Any child over age 7', 'A grown-up', 'Anyone with a phone'],
              answer: 1,
              explanation: 'PayPal accounts must be held by adults. Kids learn the steps but real transactions are always handled by a parent or guardian.',
            },
            {
              question: 'What does "Request" do in PayPal?',
              options: [
                'Sends money to someone',
                'Asks someone to pay you',
                'Closes your account',
              ],
              answer: 1,
              explanation: 'Requesting sends the other person a message asking them to approve a payment to you.',
            },
            {
              question: 'What are Practice Dollars?',
              options: [
                'Real money you earn in lessons',
                'Pretend money used to learn without risk',
                'Dollars you spend at a shop',
              ],
              answer: 1,
              explanation: 'Practice Dollars are fake — they help you learn the steps of sending and investing without any real money involved.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `PayPal gives you two key actions: Send and Request. Knowing when to use each — and the small details that matter — makes your payments faster and safer.\n\nSending money: you start a payment by entering the recipient's email address, phone number, or PayPal.Me link. Then you choose an amount and a funding source (your PayPal balance, a linked bank account, or a card). Finally, you add an optional note and confirm.\n\nThere is an important distinction: "Friends & Family" payments have no seller protection and usually no fee for the sender (though the recipient may face a fee depending on country). "Goods & Services" payments include buyer and seller protection but carry a fee. Choosing the wrong type is a common mistake.\n\nRequesting money: you enter the amount and the payer's contact. PayPal sends them a notification. Once they approve, the funds appear in your balance. You can also send a PayPal.Me link — your personal payment URL — so people can pay you without you having to initiate a request.\n\nAlways double-check the email address before confirming a payment. Sending to the wrong address is very hard to reverse.`,
          tryIt: {
            prompt: 'Your friend helped you move furniture and you want to pay them back. Should you use "Friends & Family" or "Goods & Services"?',
            type: 'choice',
            options: [
              'Friends & Family — it\'s a personal repayment, not a business transaction',
              'Goods & Services — always use this for any payment',
              'It does not matter which one you pick',
            ],
            correct: 0,
            feedbackRight: 'Right. Paying back a friend is a personal transaction, so Friends & Family is correct and usually cheaper.',
            feedbackWrong: 'Friends & Family is for personal payments between people you know and trust. Goods & Services is for buying from strangers or businesses.',
          },
          quiz: [
            {
              question: 'What does "Goods & Services" payment type provide that "Friends & Family" does not?',
              options: [
                'Buyer and seller protection',
                'Faster transfer speed',
                'Zero fees',
              ],
              answer: 0,
              explanation: 'Goods & Services includes purchase protection. Friends & Family has none — it\'s treated like giving cash.',
            },
            {
              question: 'Why should you double-check the email before sending?',
              options: [
                'To confirm the recipient\'s name is spelled correctly',
                'Because sending to the wrong address is hard to reverse',
                'PayPal will block you if you get it wrong',
              ],
              answer: 1,
              explanation: 'Once a payment completes, the only way to recover it is if the recipient voluntarily sends it back. Always verify before confirming.',
            },
            {
              question: 'What is a PayPal.Me link?',
              options: [
                'A link to PayPal\'s homepage',
                'Your personal payment URL that others can use to pay you',
                'A link that lets you view someone else\'s account',
              ],
              answer: 1,
              explanation: 'PayPal.Me is a short, shareable URL (like paypal.me/yourname) that lets anyone pay you without you sending a request first.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `The mechanics of a PayPal payment look simple on the surface but involve several layers. Understanding them matters if you ever build on top of the PayPal API or evaluate payment flows.\n\nWhen a sender initiates a payment, PayPal resolves the funding source hierarchy: PayPal balance first (cheapest for PayPal), then bank account (ACH, lower fee), then debit card, then credit card (highest interchange). This ordering minimises PayPal's own processing cost.\n\nFor peer-to-peer ("P2P") payments, the money moves as a ledger entry: sender's balance decreases, recipient's balance increases. If the sender has no balance, PayPal pulls from the linked funding source — typically settling with the bank in 1–3 business days via ACH, though the recipient sees funds immediately. This is float: PayPal temporarily holds the liquidity risk.\n\nThe "Friends & Family" vs "Goods & Services" distinction is legally significant. F&F payments are classified as personal transfers — no purchase protection, and PayPal cannot reverse them easily. G&S payments create a contractual obligation that PayPal's dispute resolution process can adjudicate. Misclassifying a business transaction as F&F to avoid fees is against PayPal's Terms of Service and can result in account suspension.\n\nFrom a product design angle, the request-money flow (PayPal.Me, invoicing, QR codes) is PayPal's answer to the "how do you collect money without a website" problem — the same problem Venmo and Cash App solve in the consumer market.`,
          tryIt: {
            prompt: 'A user has $0 PayPal balance and a linked bank account. They send $200 to a friend. The friend\'s balance shows $200 immediately. The bank ACH settles in 2 days. Who holds the liquidity risk during those 2 days?',
            type: 'choice',
            options: ['The sender', 'PayPal', 'The recipient\'s bank'],
            correct: 1,
            feedbackRight: 'Correct. PayPal credits the recipient before the ACH clears, absorbing the short-term risk itself. This is the classic float model.',
            feedbackWrong: 'PayPal credits the recipient upfront while waiting for the ACH from the sender\'s bank — that gap is PayPal\'s float risk to manage.',
          },
          quiz: [
            {
              question: 'Why does PayPal prefer funding payments from a user\'s PayPal balance first?',
              options: [
                'It earns more interest',
                'It avoids card interchange and ACH fees, reducing PayPal\'s own costs',
                'It is required by law',
              ],
              answer: 1,
              explanation: 'PayPal optimises its funding source hierarchy to minimise processing costs — balance first, then bank (cheap ACH), then cards (expensive interchange).',
            },
            {
              question: 'What is "float" in the context of PayPal P2P payments?',
              options: [
                'The fee PayPal charges per transaction',
                'The period when PayPal has credited the recipient but not yet collected from the sender\'s bank',
                'The time it takes to sign up for an account',
              ],
              answer: 1,
              explanation: 'Float is the gap between crediting the recipient and receiving the funds from ACH. PayPal manages this risk — and earns interest on it.',
            },
            {
              question: 'Misusing "Friends & Family" for business transactions is against PayPal\'s TOS because:',
              options: [
                'It costs PayPal more to process',
                'It circumvents the fee and removes purchase protection that buyers are entitled to',
                'It is illegal in all countries',
              ],
              answer: 1,
              explanation: 'F&F was designed for genuine personal payments. Using it commercially evades fees and removes the dispute rights that Goods & Services provides.',
            },
          ],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3 — Reading your activity
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'pp-03',
      pathId: 'paypal-basics',
      order: 3,
      title: 'Reading Your Activity',
      emoji: '📋',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Your PayPal activity is like a diary of all the money your grown-up has sent and received. Every time money moves, PayPal writes it down.\n\nYou will see two kinds of entries. Green ones mean money came IN. Those are good! Red or grey ones mean money went OUT.\n\nEach entry shows a date, who it was with, and how much. You can tap on any entry to see more details.\n\nIt is important to check your activity often. If you see something you do not remember, tell a grown-up right away. That is how you catch mistakes early.`,
          tryIt: {
            prompt: 'You see a green entry for $20.00 from "Grandma." What does this mean?',
            type: 'choice',
            options: [
              'You sent $20 to Grandma',
              'Grandma sent $20 to you',
              'You owe Grandma $20',
            ],
            correct: 1,
            feedbackRight: 'Yes! Green means money came IN — Grandma sent you $20.',
            feedbackWrong: 'Green entries are money coming IN to your account. Grandma paid you $20.',
          },
          quiz: [
            {
              question: 'What does a green entry in your PayPal activity mean?',
              options: ['Money went out', 'Money came in', 'A payment failed'],
              answer: 1,
              explanation: 'Green entries show money you received. They increase your balance.',
            },
            {
              question: 'Why should you check your activity often?',
              options: [
                'To earn bonus points',
                'To spot anything unusual early',
                'PayPal requires it every day',
              ],
              answer: 1,
              explanation: 'Regular checks help you catch mistakes or unexpected charges before they become a bigger problem.',
            },
            {
              question: 'What information does each activity entry show?',
              options: [
                'Only the amount',
                'The date, who it was with, and the amount',
                'Just the date',
              ],
              answer: 1,
              explanation: 'Each entry gives you three key facts: when it happened, who was involved, and how much money moved.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Your PayPal activity feed is your financial record. Every transaction — sent, received, refunded, or pending — appears there in reverse-chronological order (newest first).\n\nEach entry contains: the date and time, the counterparty (who you paid or who paid you), the amount and currency, the transaction type (payment, refund, transfer), and a unique transaction ID.\n\nThat transaction ID is important. If you ever need to dispute a payment or contact PayPal support, that ID is how they look up the exact record.\n\nYou can also download your activity as a CSV file — useful for tracking your spending, keeping records for a small business, or just understanding where your money goes each month.\n\nGood habit: review your activity at least once a week. Look for anything you do not recognise. An unfamiliar charge is the first warning sign of unauthorised access.`,
          tryIt: {
            prompt: 'You spot a transaction you do not recognise. What is the FIRST thing you should do?',
            type: 'choice',
            options: [
              'Ignore it — it is probably a mistake that will fix itself',
              'Note the transaction ID and contact PayPal support or your parent immediately',
              'Delete the entry from your activity',
            ],
            correct: 1,
            feedbackRight: 'Good instinct. The transaction ID lets support look up the exact record, so note it before you do anything else.',
            feedbackWrong: 'You cannot delete activity entries — and you should not ignore them. Note the ID and report it right away.',
          },
          quiz: [
            {
              question: 'Why is the transaction ID useful?',
              options: [
                'It shows your total balance',
                'It uniquely identifies the payment so PayPal or support can look it up',
                'It proves the payment is safe',
              ],
              answer: 1,
              explanation: 'Every transaction gets a unique ID. If anything goes wrong, this is the reference number that anyone helping you needs.',
            },
            {
              question: 'What format can you download your PayPal activity in?',
              options: ['PDF only', 'CSV', 'ZIP'],
              answer: 1,
              explanation: 'CSV (comma-separated values) can be opened in spreadsheet software, making it easy to analyse your spending.',
            },
            {
              question: 'How often should you review your PayPal activity?',
              options: [
                'Only when you think something is wrong',
                'At least once a week',
                'Once a year when filing taxes',
              ],
              answer: 1,
              explanation: 'Weekly checks let you catch unauthorised activity quickly, before too much time passes.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `PayPal's transaction history is more than a log — it is a dataset. For anyone thinking about personal finance management or building fintech products, understanding its structure is valuable.\n\nEach transaction record contains: timestamp (UTC), type (payment, transfer, fee, reversal, refund), gross amount, fee, net amount, currency, counterparty email, transaction ID, and item description. Note the separation of gross and net: fees are always explicitly broken out, which matters for anyone running a business.\n\nPayPal provides a CSV export. The schema is stable enough that many accounting tools (QuickBooks, Xero, Wave) have built direct PayPal import connectors. Understanding the export format lets you build your own analysis — spending categories, merchant frequency, currency exposure.\n\nFrom a financial-intelligence perspective, your transaction history reveals patterns that are invisible in a single balance number: recurring subscriptions you forgot about, merchant refund rates, and exchange-rate costs on cross-currency payments. A growing field called PFM (Personal Financial Management) is built entirely on parsing transaction histories like this one.\n\nSecurity relevance: transaction history is also your audit trail. In a dispute, PayPal's resolution team works from this same data. If you notice a transaction you did not authorise, filing within 180 days preserves your right to a chargeback under the PayPal Purchase Protection policy.`,
          tryIt: {
            prompt: 'A CSV export shows: Gross=$50.00, Fee=-$1.75, Net=$48.25. You received this for selling a service. Your income for tax purposes is:',
            type: 'choice',
            options: [
              '$50.00 (the gross amount)',
              '$48.25 (the net amount)',
              '$1.75 (the fee only)',
            ],
            correct: 0,
            feedbackRight: 'Correct. For tax purposes you typically report gross income. The fee is a deductible business expense, not a reduction of income.',
            feedbackWrong: 'Tax law generally requires you to report gross ($50). The $1.75 fee is a deductible expense — two separate line items on your return.',
          },
          quiz: [
            {
              question: 'In PayPal\'s CSV export, "Net" equals:',
              options: ['Gross minus fees', 'Gross plus fees', 'Fees alone'],
              answer: 0,
              explanation: 'Net = Gross − Fee. It is the amount that actually hits your PayPal balance after PayPal takes its cut.',
            },
            {
              question: 'What is the window to file a dispute under PayPal Purchase Protection?',
              options: ['30 days', '90 days', '180 days'],
              answer: 2,
              explanation: 'PayPal\'s policy gives you 180 days from the transaction date to open a dispute for non-receipt or significantly-not-as-described items.',
            },
            {
              question: 'PFM (Personal Financial Management) tools are built on:',
              options: [
                'Predicting stock prices',
                'Parsing and categorising transaction histories',
                'Providing loans to consumers',
              ],
              answer: 1,
              explanation: 'PFM apps like Mint or YNAB parse your transaction data to surface insights about spending patterns, subscriptions, and savings opportunities.',
            },
          ],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4 — Spotting scams and phishing
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'pp-04',
      pathId: 'paypal-basics',
      order: 4,
      title: 'Spotting Scams',
      emoji: '🚨',
      durationMins: 4,
      xpReward: 60,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Some people try to trick others into giving away their money. These tricks are called scams.\n\nOne common trick is called phishing. A bad person sends an email that looks like it is from PayPal. But it is fake! If you click the link and type your password, the bad person steals it.\n\nHow do you spot a fake email? Real PayPal emails come from @paypal.com. Fake ones might say something like @paypa1.com (with a number one instead of the letter L). Also, PayPal will NEVER ask for your password in an email.\n\nAnother trick: someone says "I paid you too much, please send back the extra." But the original payment was fake — it will disappear later and you will have lost your real money.\n\nIf anything feels strange, stop and ask a grown-up before clicking anything.`,
          tryIt: {
            prompt: 'You get an email saying "Your PayPal is locked! Click here to fix it." The sender is support@paypa1.com. What should you do?',
            type: 'choice',
            options: [
              'Click the link and enter your password to unlock it',
              'Delete the email and tell a grown-up — it is a fake',
              'Forward it to all your friends',
            ],
            correct: 1,
            feedbackRight: 'Smart! The sender address has a "1" instead of "l" — that is a classic sign of a fake email.',
            feedbackWrong: 'Never click links in suspicious emails. The "1" in "paypa1.com" is a giveaway that it is fake.',
          },
          quiz: [
            {
              question: 'What is phishing?',
              options: [
                'A sport done at a lake',
                'A trick that uses fake emails to steal your password',
                'A way to earn more money',
              ],
              answer: 1,
              explanation: 'Phishing emails pretend to be from trusted companies to trick you into revealing your login details.',
            },
            {
              question: 'A real PayPal email comes from:',
              options: ['@paypa1.com', '@paypal.com', '@paypall.net'],
              answer: 1,
              explanation: 'The only real domain is paypal.com. Any small change — an extra letter, a number — means it is fake.',
            },
            {
              question: 'What should you do if an email feels strange?',
              options: [
                'Click the link to find out more',
                'Stop and ask a grown-up',
                'Type your password to check',
              ],
              answer: 1,
              explanation: 'When in doubt, do not click. Ask a trusted adult to look at it with you.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Scams cost PayPal users millions of dollars every year. Knowing the most common ones protects you and your family.\n\nPhishing: a fake email mimics PayPal's design and sends you to a lookalike website. The URL might be paypal-secure-login.com or paypa1.com — anything that is not exactly paypal.com is fake. Real PayPal emails come only from @paypal.com and never ask for your password, PIN, or full card number.\n\nOverpayment scam: a "buyer" sends you more than you asked for and requests a refund of the difference. The original payment was made with a stolen credit card. When the real owner reports it, PayPal reverses the payment — and you have already sent real money back. You lose the item and the refund amount.\n\nFake "payment received" email: a seller receives an email claiming payment is pending until they ship. No money has actually moved. Always check your real PayPal balance before shipping.\n\nAdvance-fee scam: "Send us $50 to unlock a $500 prize." Legitimate lotteries and prize funds never require upfront payment.\n\nGeneral rule: if pressure, urgency, or "too good to be true" appears, slow down and verify independently — never through a link in the suspicious message.`,
          tryIt: {
            prompt: 'You are selling a second-hand phone. A buyer pays $300 and emails to say they sent $400 by mistake and asks for a $100 refund. What should you do?',
            type: 'choice',
            options: [
              'Send the $100 back — it sounds like an honest mistake',
              'Check your REAL PayPal balance first, then wait several days before refunding anything',
              'Ship the phone immediately to build trust',
            ],
            correct: 1,
            feedbackRight: 'Exactly right. The "overpayment" is a classic scam. Verify the balance and never refund before the original payment has fully cleared.',
            feedbackWrong: 'This is the overpayment scam. Always verify your actual PayPal balance and wait for the payment to fully clear before acting.',
          },
          quiz: [
            {
              question: 'In the overpayment scam, why do you end up losing money?',
              options: [
                'PayPal charges you an extra fee',
                'The original payment gets reversed because it was made with a stolen card',
                'The buyer takes back the item',
              ],
              answer: 1,
              explanation: 'The scammer uses a stolen card to "pay" you. When the real cardholder disputes it, PayPal reverses the payment — after you have already sent a real refund.',
            },
            {
              question: 'A legitimate PayPal email will NEVER ask for:',
              options: ['Your account email', 'Your password or full card number', 'The date of a transaction'],
              answer: 1,
              explanation: 'PayPal already knows your password (hashed). Any email asking for it is a phishing attempt.',
            },
            {
              question: 'What is the best first response when an offer feels urgent or too good to be true?',
              options: [
                'Act fast before the offer expires',
                'Slow down and verify independently — never via a link in the message',
                'Ask the sender for more details',
              ],
              answer: 1,
              explanation: 'Urgency is a manipulation tactic. Legitimate offers do not evaporate if you take ten minutes to verify them.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `Social engineering is the dominant attack vector in financial fraud. Technical controls — firewalls, encryption — are largely solved problems. Human psychology is not. Understanding the mechanics of payment scams makes you a harder target and is also useful context for evaluating the fraud-risk models of any fintech company.\n\nPhishing has evolved. Spear-phishing targets specific individuals using personal information (your name, recent purchases, employer) scraped from social media or data breaches. Business Email Compromise (BEC) — where an attacker impersonates a supplier or executive — cost businesses over $2.7 billion in 2022 per the FBI's IC3 report. The email passes basic checks because it spoofs a legitimate domain or compromises a real inbox.\n\nThe "PayPal payment on hold" scam exploits sellers' eagerness. The scammer sends a convincing fake PayPal email saying funds are held pending action (shipping confirmation, tracking number). The email's HTML mirrors real PayPal exactly. The only way to verify is to log into paypal.com directly — never via an email link.\n\nChargeback fraud (also called "friendly fraud") is a significant cost for online sellers. A buyer receives goods, then disputes the payment claiming non-receipt. PayPal reverses the funds while it investigates. Sellers mitigate this by shipping only to confirmed addresses, keeping tracking numbers, and maintaining communication records.\n\nFrom a platform-design perspective, PayPal's fraud detection uses ML models scoring each transaction on hundreds of signals (device fingerprint, velocity, IP reputation, purchase category). Understanding this is directly relevant to anyone building fintech: fraud is a systems problem, not just a policy problem.`,
          tryIt: {
            prompt: 'A supplier emails your company\'s accounts team asking to update their bank details before the next invoice payment. The email comes from the supplier\'s real domain. What is the safest response?',
            type: 'choice',
            options: [
              'Update the details — the email looks legitimate',
              'Call the supplier on a known phone number to verbally confirm the change',
              'Reply to the email asking for the supplier\'s company registration number',
            ],
            correct: 1,
            feedbackRight: 'Correct. This is a classic BEC scenario. Verbal confirmation on a known number is the only safe verification — email is too easy to intercept or spoof.',
            feedbackWrong: 'Replying to the (possibly compromised) email is not safe. Always call the supplier on a number you already have to verify any bank detail change.',
          },
          quiz: [
            {
              question: 'Business Email Compromise (BEC) is most dangerous because:',
              options: [
                'It requires expensive hacking tools',
                'It exploits human trust and process gaps rather than technical vulnerabilities',
                'It only works on large corporations',
              ],
              answer: 1,
              explanation: 'BEC succeeds because it targets people and processes, not software. A convincing email from an "executive" can bypass any firewall.',
            },
            {
              question: 'Chargeback fraud harms sellers because:',
              options: [
                'They are charged double fees',
                'PayPal reverses the payment even after goods are delivered, leaving the seller out of pocket',
                'It permanently bans their account',
              ],
              answer: 1,
              explanation: 'The reversal happens during dispute investigation. Sellers with tracking evidence recover faster, but the cash-flow impact is immediate.',
            },
            {
              question: 'PayPal\'s ML fraud models score transactions on signals like:',
              options: [
                'The colour of the buyer\'s profile picture',
                'Device fingerprint, transaction velocity, IP reputation, and purchase category',
                'The seller\'s star rating',
              ],
              answer: 1,
              explanation: 'Hundreds of behavioural and contextual signals feed the model. Each individual signal is weak; combined, they catch patterns a human reviewer never could.',
            },
          ],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5 — Fees and currencies
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'pp-05',
      pathId: 'paypal-basics',
      order: 5,
      title: 'Fees and Currencies',
      emoji: '💱',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Sometimes using PayPal costs a small amount of money. This is called a fee. Think of it like a tiny toll you pay to use a bridge.\n\nWhen your grown-up sends money to a friend nearby, it is usually free. But if they buy something from a shop online or send money to another country, PayPal takes a small fee.\n\nDifferent countries use different types of money. Pounds, euros, dollars — they are all currencies. When you send money from one currency to another, PayPal changes it for you, but they charge a little extra for that service.\n\nAlways check the fee before sending so there are no surprises!`,
          tryIt: {
            prompt: 'Your grown-up sends $10 to a friend in the same country. The fee is $0. They send $10 to a shop in another country. The fee is $0.50. How much does the second payment cost in total?',
            type: 'choice',
            options: ['$10.00', '$10.50', '$9.50'],
            correct: 1,
            feedbackRight: 'Well done! $10 plus the $0.50 fee equals $10.50 total.',
            feedbackWrong: 'Add the fee to the amount: $10.00 + $0.50 = $10.50.',
          },
          quiz: [
            {
              question: 'What is a fee in PayPal?',
              options: [
                'Free money PayPal gives you',
                'A small charge for using certain services',
                'The amount you receive',
              ],
              answer: 1,
              explanation: 'A fee is a cost PayPal charges for certain services, like selling goods or converting currencies.',
            },
            {
              question: 'What is a currency?',
              options: [
                'A type of bank',
                'The type of money used in a country (like dollars or euros)',
                'A PayPal password',
              ],
              answer: 1,
              explanation: 'Different countries have different currencies. The dollar, euro, pound, and yen are all examples.',
            },
            {
              question: 'When might PayPal charge you a fee?',
              options: [
                'When you check your balance',
                'When you buy something from a seller or send money abroad',
                'When you log in',
              ],
              answer: 1,
              explanation: 'Fees typically apply to commercial transactions (buying/selling) and cross-border or cross-currency payments.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `PayPal's fee structure is designed to be free for casual personal use but revenue-generating for business transactions. Knowing the structure helps you avoid unexpected charges.\n\nFor personal (Friends & Family) payments funded by your PayPal balance or bank account, the fee is usually $0 within the same country. Fund it with a credit card and you will pay around 2.9%.\n\nFor sellers, the standard rate is 3.49% + $0.49 per transaction (Goods & Services, as of 2024 — always check the PayPal website for current rates). Volume discounts exist for high-revenue sellers.\n\nCurrency conversion: if you send dollars to someone in Europe, PayPal converts the money at their exchange rate, which includes a markup above the mid-market rate (typically 3–4%). That markup is a hidden fee — the money arrives in euros but at a less-than-ideal rate.\n\nTo minimise fees: use your PayPal balance or bank account rather than a card; invoice in the recipient's local currency; and compare PayPal's rate with a money-transfer service like Wise for large international amounts.`,
          tryIt: {
            prompt: 'You are selling handmade bookmarks for $5 each. PayPal charges 3.49% + $0.49 per sale. On a $5 sale, how much do you actually receive? (Round to the nearest cent.)',
            type: 'choice',
            options: ['$4.34', '$4.51', '$4.68'],
            correct: 0,
            feedbackRight: 'Right. $5 × 3.49% = $0.1745, plus $0.49 = $0.6645 fee. $5 − $0.66 ≈ $4.34.',
            feedbackWrong: 'Fee = (5 × 0.0349) + 0.49 = 0.1745 + 0.49 = $0.6645. Net = $5 − $0.66 = $4.34.',
          },
          quiz: [
            {
              question: 'For a personal Friends & Family payment funded from your bank account, the typical fee is:',
              options: ['3.49%', '$0 within the same country', '$0.49 flat'],
              answer: 1,
              explanation: 'F&F payments funded by balance or bank are usually free domestically. The fee structure changes when using a card or sending abroad.',
            },
            {
              question: 'What hidden cost exists in currency conversion?',
              options: [
                'A flat $10 fee',
                'A markup on the exchange rate above the mid-market rate',
                'No hidden cost — PayPal uses the market rate exactly',
              ],
              answer: 1,
              explanation: 'PayPal adds a 3–4% margin to the exchange rate. The money converts, but at a worse rate than the raw market price.',
            },
            {
              question: 'For large international transfers, what is worth comparing to PayPal?',
              options: [
                'A standard bank wire transfer at $30+ flat',
                'A specialist service like Wise that uses the mid-market rate',
                'Sending cash in the post',
              ],
              answer: 1,
              explanation: 'Wise passes the mid-market rate to you and charges a small transparent fee — often cheaper than PayPal for large amounts.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `PayPal's revenue model is fundamentally a fee-extraction layer on top of existing payment rails. Analysing it builds intuition for evaluating any payments business.\n\nTransaction revenue (take rate): PayPal earns 2.9–3.49% plus a fixed amount per transaction, depending on product and volume tier. This is called the take rate. For context, Visa and Mastercard earn about 0.1–0.13% as the network fee — the issuing bank earns the bulk of interchange (1.5–2%). PayPal sits above this stack, paying interchange itself and charging merchants a blended rate.\n\nCurrency conversion spread: PayPal applies a 3–4% spread over the interbank (mid-market) exchange rate. This is a high-margin revenue line — the actual cost of conversion is tiny. For comparison, Wise charges around 0.4–1% and passes the mid-market rate. The spread on PayPal's $100+ billion in cross-border volume is material.\n\nFloat revenue: PayPal held $34.5 billion in customer balances as of 2023. At even modest interest rates, interest income on this float is significant — and it explains why PayPal launched a savings product offering 4–5% APY: it costs them the rate, but retaining balances on-platform is worth it to maintain the float pool.\n\nFee sensitivity in the market: Square/Block, Stripe, and Braintree all compete on take rate. Stripe famously launched at 2.9% + $0.30 and captured developer-focused merchants from PayPal. Understanding why merchants choose one processor over another — integrations, dispute rates, international reach, take rate — is core fintech product intuition.`,
          tryIt: {
            prompt: 'PayPal holds $34B in customer balances. The Fed Funds rate is 5.25%. PayPal pays users 0% on their idle balances. Roughly how much annual interest income does this float generate? (Assume all $34B earns the full rate.)',
            type: 'choice',
            options: ['$340 million', '$1.785 billion', '$5.25 billion'],
            correct: 1,
            feedbackRight: 'Correct. $34B × 5.25% = ~$1.785B. This is why rising interest rates improved PayPal\'s margins significantly.',
            feedbackWrong: '$34,000,000,000 × 0.0525 = $1,785,000,000. Float income at scale is enormous.',
          },
          quiz: [
            {
              question: 'PayPal\'s "take rate" is:',
              options: [
                'The interest rate on savings accounts',
                'The percentage of each transaction PayPal keeps as revenue',
                'The rate at which users leave the platform',
              ],
              answer: 1,
              explanation: 'Take rate = revenue / transaction volume. It is the single most-watched metric when analysing payments businesses.',
            },
            {
              question: 'Stripe disrupted PayPal among developers primarily by:',
              options: [
                'Offering a lower take rate and a vastly better developer API experience',
                'Being free for all transactions',
                'Requiring no account sign-up',
              ],
              answer: 0,
              explanation: 'Stripe\'s clean REST API, easy onboarding, and competitive pricing flipped developer-facing merchant acquisition away from PayPal.',
            },
            {
              question: 'Rising interest rates help PayPal\'s profitability because:',
              options: [
                'They increase transaction volume',
                'PayPal earns more interest income on its large pool of idle customer balances',
                'Merchants pay higher take rates when rates rise',
              ],
              answer: 1,
              explanation: 'PayPal\'s float — idle customer balances — earns interest. Higher rates mean more income on the same balance pool.',
            },
          ],
        },
      },
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6 — Keeping your login safe
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'pp-06',
      pathId: 'paypal-basics',
      order: 6,
      title: 'Keeping Your Login Safe',
      emoji: '🔐',
      durationMins: 3,
      xpReward: 60,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Your password is like a key to your house. If someone gets your key, they can go inside! A strong password keeps the bad guys out.\n\nA strong password is long, has numbers and letters mixed together, and is not a word from the dictionary. "Sunshine" is weak. "Sun7!kite4" is much better.\n\nNever share your password with anyone — not even a friend. And never use the same password on two different websites. If one gets stolen, the bad person would have the key to everything.\n\nTwo-step login is like having two locks on your door. Even if someone gets your password, they also need a special code sent to your phone. Always turn this on if you can!`,
          tryIt: {
            prompt: 'Which password is the STRONGEST?',
            type: 'choice',
            options: ['password123', 'TigerMoon!9', 'abc'],
            correct: 1,
            feedbackRight: 'Yes! It mixes uppercase, lowercase, a symbol, and a number — and it is not a dictionary word.',
            feedbackWrong: '"TigerMoon!9" is strongest — long, mixed characters, not a simple word.',
          },
          quiz: [
            {
              question: 'What makes a password strong?',
              options: [
                'Using your name and birthday',
                'Mixing letters, numbers, and symbols and making it long',
                'Using only letters',
              ],
              answer: 1,
              explanation: 'Length and character variety make passwords much harder to guess.',
            },
            {
              question: 'What is two-step login?',
              options: [
                'Logging in twice with the same password',
                'A second check (like a phone code) on top of your password',
                'A way to share your account',
              ],
              answer: 1,
              explanation: 'Two-step (or two-factor) authentication adds a second layer — usually a code sent to your phone — so a stolen password alone is not enough.',
            },
            {
              question: 'Should you use the same password on multiple sites?',
              options: [
                'Yes, it is easier to remember',
                'No — if one site is hacked, all accounts with that password are at risk',
                'Only if the sites are from the same company',
              ],
              answer: 1,
              explanation: 'Reusing passwords means one breach exposes all your accounts. Use a different password for each site.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Account security is the foundation everything else rests on. A hacked PayPal account can drain a balance instantly.\n\nPassword hygiene: use a unique password of at least 16 characters for every important account. A password manager (Bitwarden, 1Password) generates and stores them for you — you only memorise one master password.\n\nTwo-factor authentication (2FA): PayPal supports authenticator apps (Google Authenticator, Authy) and SMS codes. Authenticator apps are more secure because SMS can be intercepted via SIM-swap attacks. Enable 2FA in your PayPal security settings now if you have not already.\n\nDevice security: if your phone is logged into PayPal and someone unlocks it, they have full access. Use a strong phone PIN or biometrics and lock your screen automatically after 30 seconds.\n\nRecognise suspicious login activity: PayPal emails you whenever a new device logs into your account. Do not ignore these alerts. If you did not log in, change your password and contact support immediately.\n\nFinally, never enter your PayPal password on a Wi-Fi network you do not trust (coffee shop, airport). Use your mobile data or a VPN instead.`,
          tryIt: {
            prompt: 'You get a PayPal email: "New device logged in from Lagos." You live in London and have not travelled. What is your FIRST action?',
            type: 'choice',
            options: [
              'Ignore it — probably a glitch',
              'Change your PayPal password immediately and enable 2FA if not already on',
              'Wait to see if any money goes missing',
            ],
            correct: 1,
            feedbackRight: 'Right. A login from an unexpected location means act now — not after damage is done.',
            feedbackWrong: 'Waiting costs you money. Change your password immediately and review recent transactions.',
          },
          quiz: [
            {
              question: 'Why are authenticator apps more secure than SMS for 2FA?',
              options: [
                'They are faster to use',
                'SMS can be intercepted via a SIM-swap attack; app codes cannot',
                'Apps are free and SMS is not',
              ],
              answer: 1,
              explanation: 'A SIM-swap attack redirects your phone number to a scammer\'s SIM, letting them receive your SMS codes. Authenticator app codes are device-specific.',
            },
            {
              question: 'What is the main advantage of a password manager?',
              options: [
                'It chooses a single strong password you use everywhere',
                'It generates unique, strong passwords for every site and stores them securely',
                'It resets forgotten passwords automatically',
              ],
              answer: 1,
              explanation: 'A password manager solves the "unique password for every site" problem without requiring you to remember dozens of complex strings.',
            },
            {
              question: 'On an untrusted Wi-Fi network, you should:',
              options: [
                'Log into PayPal as normal — HTTPS protects you',
                'Use mobile data or a VPN instead',
                'Only read your activity, never send payments',
              ],
              answer: 1,
              explanation: 'Public Wi-Fi can be intercepted or manipulated. Mobile data or a reputable VPN adds a layer of protection.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `Identity and access management (IAM) is one of the most underestimated risk areas in personal and business finance. Most breaches are not caused by sophisticated hacks — they are caused by credential reuse and social engineering.\n\nThe credential-stuffing problem: when a site is breached (LinkedIn 2021: 700M records; Ticketmaster 2024: 560M records), those email/password combinations are tested against banking and payment sites automatically. If you reuse passwords, you are vulnerable to this. Check haveibeenpwned.com to see if your email has appeared in known breaches.\n\nSIM-swap fraud: an attacker calls your mobile carrier, impersonates you using social engineering, and has your number ported to their SIM. They now receive your SMS 2FA codes. High-profile attacks on crypto holders have used this exact method. Mitigation: use a TOTP authenticator app (TOTP = Time-based One-Time Password, the standard behind Google Authenticator) or a hardware security key (FIDO2/WebAuthn).\n\nSession hijacking: if malware on your device captures a valid session cookie, the attacker can access your account without knowing your password. This is why PayPal uses short-lived sessions, flags new device logins, and re-authenticates before high-risk actions.\n\nZero-trust principle: treat every access attempt as potentially hostile — verify it, regardless of source. This is the model enterprise security teams use and it applies personally too: no device, no network, no email is inherently trusted.`,
          tryIt: {
            prompt: 'Which authentication method is MOST resistant to SIM-swap attacks?',
            type: 'choice',
            options: [
              'SMS one-time codes',
              'Email one-time codes',
              'A FIDO2 hardware security key',
            ],
            correct: 2,
            feedbackRight: 'Correct. A hardware key requires physical possession — it cannot be SIM-swapped, phished, or intercepted remotely.',
            feedbackWrong: 'A hardware security key (like a YubiKey) is the gold standard. It requires physical possession and cannot be remotely cloned.',
          },
          quiz: [
            {
              question: 'Credential stuffing attacks work because:',
              options: [
                'Attackers guess passwords one by one',
                'Breached credential lists are tested against other sites automatically at scale',
                'Social media reveals passwords directly',
              ],
              answer: 1,
              explanation: 'Automated tools test billions of known email/password pairs against payment and banking sites in hours. Password reuse is the root cause.',
            },
            {
              question: 'TOTP stands for:',
              options: [
                'Transfer of Token Protocol',
                'Time-based One-Time Password',
                'Two-factor Online Transaction Process',
              ],
              answer: 1,
              explanation: 'TOTP generates a 6-digit code from a shared secret + current time. It refreshes every 30 seconds and requires physical access to your device.',
            },
            {
              question: 'The zero-trust security principle means:',
              options: [
                'Never use passwords',
                'No device or network is inherently trusted — every access request is verified',
                'Only employees can access business systems',
              ],
              answer: 1,
              explanation: 'Zero trust assumes breach. Every request is authenticated and authorised regardless of where it comes from — inside or outside the corporate network.',
            },
          ],
        },
      },
    },
  ],
};
