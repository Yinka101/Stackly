import { useState } from 'react';
import { api } from '@/lib/api';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TOPICS = ['compound growth', 'diversification', 'risk and reward', 'index funds', 'PayPal fees', 'spotting scams'];

const FALLBACK_BANK: Record<string, QuizQuestion[]> = {
  'compound growth': [
    { question: 'What does compound growth mean?', options: ['Earning interest on your interest', 'Buying shares in a company', 'Paying monthly fees', 'Opening a savings account'], correctIndex: 0, explanation: 'Compound growth means your earnings also earn more over time - like a snowball that gets bigger as it rolls downhill.' },
    { question: 'You invest $100 and earn 10% interest. With compound growth, what happens next year?', options: ['You earn 10% on $110', 'You earn 10% on $100 again', 'You earn 20% on $100', 'You earn nothing until you withdraw'], correctIndex: 0, explanation: 'With compound growth you earn interest on the new total ($110), not just the original $100.' },
    { question: 'Which is the best example of compound growth?', options: ['A savings account that pays interest on your balance including past interest', 'A wallet with cash in it', 'A gift card you never use', 'A piggy bank under your bed'], correctIndex: 0, explanation: 'A savings account that compounds means each month your interest earns more interest.' },
    { question: 'Why does starting to save early matter for compound growth?', options: ['More time means more cycles of interest earning interest', 'Banks give discounts to younger savers', 'Early savers pay lower taxes', 'Interest rates are higher for children'], correctIndex: 0, explanation: 'The longer your money compounds, the more dramatic the growth - time is the most powerful ingredient.' },
    { question: 'What is the "Rule of 72" related to?', options: ['Estimating how long it takes to double money at a given interest rate', 'The maximum number of stocks you should own', 'A PayPal fee calculation rule', 'The age you should start investing'], correctIndex: 0, explanation: 'Divide 72 by your interest rate to estimate how many years it takes to double your money through compounding.' },
  ],
  'diversification': [
    { question: 'Why do investors spread money across different assets?', options: ['To reduce risk if one investment falls', 'To earn more fees', 'To avoid paying taxes', 'To buy more of one stock'], correctIndex: 0, explanation: 'Diversification reduces risk. If one investment drops, others may hold steady or rise.' },
    { question: 'What does "don\'t put all your eggs in one basket" mean in investing?', options: ['Spread investments across different assets so one loss does not ruin you', 'Buy as many eggs (stocks) as possible', 'Only invest in food companies', 'Keep all money in cash'], correctIndex: 0, explanation: 'If all your money is in one investment and it fails, you lose everything. Diversification protects you.' },
    { question: 'Which portfolio is most diversified?', options: ['Stocks in tech, healthcare, bonds, and real estate', 'Five different tech company stocks only', 'One very large company stock', 'Cash in three different currencies'], correctIndex: 0, explanation: 'True diversification spans different asset types and sectors, not just different companies in one industry.' },
    { question: 'What is an easy way for a beginner to diversify instantly?', options: ['Buy an index fund that tracks hundreds of companies', 'Pick 2 stocks you like', 'Save in a piggy bank', 'Buy only government bonds'], correctIndex: 0, explanation: 'An index fund gives you a tiny share of hundreds of companies in one purchase - instant diversification.' },
    { question: 'If you own stocks in both an umbrella company and a sunscreen company, why is that good diversification?', options: ['One does well in rain, the other in sunshine - opposite conditions', 'Both companies are cheap', 'They pay the highest dividends', 'They are in the same industry'], correctIndex: 0, explanation: 'When conditions hurt one investment, they help the other. That balance is the whole point of diversification.' },
  ],
  'risk and reward': [
    { question: 'What is the general relationship between risk and reward?', options: ['Higher risk usually offers higher potential reward', 'Lower risk always gives higher reward', 'Risk and reward are unrelated', 'Only large companies have risk'], correctIndex: 0, explanation: 'Higher-risk investments can offer bigger returns but also bigger losses. Lower-risk options grow more slowly but are more stable.' },
    { question: 'Which investment is typically considered the lowest risk?', options: ['Government bonds', 'A single small startup stock', 'Cryptocurrency', 'A new business idea'], correctIndex: 0, explanation: 'Government bonds are backed by the government and considered very low risk, though they offer lower returns.' },
    { question: 'A friend offers you 50% return in 30 days with no risk. What should you think?', options: ['It is probably a scam - no risk and that return is impossible', 'Jump in immediately', 'It is fine because the return is high', 'Only invest if it is a famous company'], correctIndex: 0, explanation: 'Guaranteed very high returns with no risk is a classic scam signal. Real investments always carry some risk.' },
    { question: 'What does "volatility" mean in investing?', options: ['How much an investment\'s value goes up and down', 'How fast you can sell an investment', 'The fees charged by a broker', 'The age of a company'], correctIndex: 0, explanation: 'A volatile investment swings up and down a lot in value. High volatility means higher risk.' },
    { question: 'Why might a young person choose riskier investments than an older person?', options: ['They have more time to recover from losses', 'Young people pay less tax', 'Risky investments are cheaper', 'Banks prefer young investors'], correctIndex: 0, explanation: 'Time is the key factor. A young investor can ride out market dips and wait for recovery. Someone close to retirement cannot.' },
  ],
  'index funds': [
    { question: 'What does an index fund track?', options: ['A group of stocks representing a market or sector', 'A single company\'s shares', 'Government bonds only', 'Real estate prices'], correctIndex: 0, explanation: 'An index fund tracks a collection of stocks (like the S&P 500) giving broad market exposure.' },
    { question: 'Why are index funds popular with beginner investors?', options: ['Low cost, automatic diversification, no stock-picking needed', 'They guarantee profit every year', 'Only available to wealthy investors', 'They pay daily cash dividends'], correctIndex: 0, explanation: 'Index funds are simple, cheap, and diversified by design - you own a tiny slice of many companies at once.' },
    { question: 'What is the S&P 500?', options: ['An index of the 500 largest US companies by market value', 'A savings account with 500% interest', 'A PayPal payment plan', 'A government savings bond'], correctIndex: 0, explanation: 'The S&P 500 tracks 500 large US companies. Many index funds simply mirror this index.' },
    { question: 'How does an index fund differ from actively managed funds?', options: ['It automatically tracks a market index instead of having a manager pick stocks', 'It always beats the market', 'It is managed by a team of experts daily', 'It only invests in one company'], correctIndex: 0, explanation: 'Index funds follow a preset index mechanically. Active funds have managers making daily decisions - and higher fees.' },
    { question: 'If the overall stock market goes up 8% in a year, what would a total market index fund roughly do?', options: ['Go up about 8% too', 'Go up 80%', 'Stay flat', 'Go down 8%'], correctIndex: 0, explanation: 'Index funds mirror the market they track. If the market rises 8%, the fund rises roughly 8% minus small fees.' },
  ],
  'PayPal fees': [
    { question: 'When does PayPal typically charge a fee to the seller?', options: ['When receiving a payment for goods or services', 'When sending money to a friend', 'When checking your balance', 'When logging in'], correctIndex: 0, explanation: 'PayPal charges sellers a small percentage when they receive payments for goods or services.' },
    { question: 'You sell a $20 item on PayPal. PayPal charges 3%. How much do you keep?', options: ['$19.40', '$20.00', '$17.00', '$18.50'], correctIndex: 0, explanation: '3% of $20 is $0.60, so you keep $19.40. Always factor in fees when pricing your products.' },
    { question: 'Why does PayPal charge fees to sellers but not for sending money to friends?', options: ['Business payments are a commercial service; friend transfers are personal', 'PayPal is a charity for friends', 'Friend transfers are taxed instead', 'Sellers earn more money so pay more'], correctIndex: 0, explanation: 'PayPal earns revenue from commercial transactions. Person-to-person transfers are a free service to attract users.' },
    { question: 'What is a "transaction fee" in the context of PayPal?', options: ['A small charge taken from each payment processed', 'A fee to open a PayPal account', 'A penalty for late payments', 'A tax paid to the government'], correctIndex: 0, explanation: 'A transaction fee is a cut taken from each payment. PayPal\'s fee is a percentage plus a small fixed amount.' },
    { question: 'If you run an online shop and charge $10 per item, why should you consider PayPal fees when setting prices?', options: ['To make sure you still profit after fees are deducted', 'PayPal fees are optional', 'Fees increase your profit', 'Only large shops pay fees'], correctIndex: 0, explanation: 'If your profit margin is $2 per item and PayPal takes $0.60, your real profit is only $1.40. Always price with fees in mind.' },
  ],
  'spotting scams': [
    { question: 'Which is a common sign of an online scam?', options: ['"Act now or lose your money!"', 'A padlock in the browser address bar', 'A purchase confirmation email', 'A company verifying your identity'], correctIndex: 0, explanation: 'Scammers create urgency to stop you thinking clearly. Legitimate businesses never pressure you to act immediately.' },
    { question: 'You receive an email saying you won a lottery you never entered. What is this?', options: ['A scam - you cannot win something you did not enter', 'A genuine prize, claim it fast', 'A government rebate', 'A bank error in your favour'], correctIndex: 0, explanation: 'Unsolicited prize notifications are almost always scams designed to get your personal details or a "processing fee".' },
    { question: 'What does "phishing" mean?', options: ['Tricking someone into giving personal details through a fake website or email', 'A type of online investment', 'A PayPal payment method', 'Searching for cheap products online'], correctIndex: 0, explanation: 'Phishing uses fake emails or websites that look real to steal your passwords, card numbers, or identity.' },
    { question: 'A seller asks you to pay via gift cards. What should you do?', options: ['Refuse - gift card payments are a major scam red flag', 'Pay immediately to secure the deal', 'Pay half by gift card and half by PayPal', 'Only pay if the amount is under $50'], correctIndex: 0, explanation: 'Legitimate businesses never ask for gift card payments. Scammers love them because they are untraceable.' },
    { question: 'Which of these websites is more likely to be safe?', options: ['https://paypal.com with a padlock', 'http://paypa1.com/login', 'https://paypal-secure-login.net', 'paypal.com.verify-account.ru'], correctIndex: 0, explanation: 'Always check the exact domain. Scammers use lookalike URLs with extra words, wrong TLDs, or number/letter swaps.' },
  ],
};

const lastIndexByTopic: Record<string, number> = {};

function pickFallback(topic: string): QuizQuestion {
  const key = Object.keys(FALLBACK_BANK).find(k => topic.toLowerCase().includes(k.toLowerCase())) ?? 'compound growth';
  const bank = FALLBACK_BANK[key];
  const last = lastIndexByTopic[key] ?? -1;
  let idx = Math.floor(Math.random() * bank.length);
  if (bank.length > 1 && idx === last) idx = (idx + 1) % bank.length;
  lastIndexByTopic[key] = idx;
  return bank[idx];
}

export default function QuizCard() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setQuiz(null);
    setSelected(null);
    try {
      const data = await api.post<QuizQuestion>('/ai/quiz', { topic });
      setQuiz(data);
    } catch {
      setQuiz(pickFallback(topic));
    } finally {
      setLoading(false);
    }
  };

  const correct = selected !== null && selected === quiz?.correctIndex;
  const wrong   = selected !== null && selected !== quiz?.correctIndex;

  return (
    <div className="bg-surface rounded-2xl p-5 border border-ink/8 space-y-4">
      <h3 className="font-display font-bold text-ink text-lg">Quiz me!</h3>

      <div className="flex gap-2 flex-wrap">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              topic === t
                ? 'bg-primary text-white'
                : 'bg-ink/8 text-ink/70 hover:bg-primary/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        onClick={() => { void generate(); }}
        disabled={loading}
        className="w-full bg-primary text-white font-display font-semibold rounded-xl py-3
                   hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px]"
      >
        {loading ? 'Generating…' : 'Get a question'}
      </button>

      {quiz && (
        <div className="space-y-3">
          <p className="font-semibold text-ink">{quiz.question}</p>
          <div className="space-y-2">
            {quiz.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect  = i === quiz.correctIndex;
              let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[44px] ';
              if (selected === null) {
                cls += 'border-ink/10 bg-ink/4 hover:border-primary/40 hover:bg-primary/5';
              } else if (isCorrect) {
                cls += 'border-green-500 bg-green-50 text-green-800';
              } else if (isSelected) {
                cls += 'border-red-400 bg-red-50 text-red-700';
              } else {
                cls += 'border-ink/10 bg-ink/4 opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => selected === null && setSelected(i)}
                  disabled={selected !== null}
                  className={cls}
                >
                  {isCorrect && selected !== null ? '✓ ' : isSelected ? '✗ ' : ''}{opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className={`rounded-xl p-4 text-sm ${correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
              <p className="font-bold mb-1">{correct ? '🎉 That\'s right!' : '🤔 Not quite…'}</p>
              <p>{quiz.explanation}</p>
            </div>
          )}

          {selected !== null && (
            <button
              onClick={() => { void generate(); }}
              className="w-full border-2 border-primary text-primary font-semibold rounded-xl py-2.5
                         hover:bg-primary/5 active:scale-95 transition-all min-h-[44px] text-sm"
            >
              Try another question
            </button>
          )}
        </div>
      )}
    </div>
  );
}
