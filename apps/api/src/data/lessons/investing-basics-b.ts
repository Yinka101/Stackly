import type { LearningPath } from './types.js';

// Lessons 5–8 of Investing Basics
export const investingBasicsB: LearningPath = {
  id: 'investing-basics',
  title: 'Investing Basics',
  emoji: '📈',
  description: 'Learn how investing works, why it matters, and how to think about risk and reward.',
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    // LESSON 5 — Index funds
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-05',
      pathId: 'investing-basics',
      order: 5,
      title: 'Index Funds',
      emoji: '📦',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine a box of 500 tiny pieces of different companies — one from every big company in the country. When you buy the box, you own a little bit of all 500 at once!\n\nThat is what an index fund is. Instead of picking one company to invest in, you buy a little piece of hundreds at the same time.\n\nIf one company in the box has a bad year, it barely matters — you have 499 others. And the cost is very low because nobody has to spend time picking which companies to choose.\n\nIndex funds are one of the most popular ways for regular people to invest because they are simple, spread the risk, and do not cost much.`,
          tryIt: {
            prompt: 'Why is an index fund like a "box" of companies?',
            type: 'choice',
            options: [
              'Because you store your money in a physical box',
              'Because you buy a little piece of many companies all at once',
              'Because it costs as much as a box of cereal',
            ],
            correct: 1,
            feedbackRight: 'Exactly! An index fund bundles many companies together so you own a tiny slice of all of them.',
            feedbackWrong: 'An index fund bundles hundreds of companies so you own a piece of all of them with one purchase.',
          },
          quiz: [
            {
              question: 'An index fund lets you:',
              options: [
                'Bet on one company doing well',
                'Own a tiny piece of many companies at once',
                'Only invest in technology companies',
              ],
              answer: 1,
              explanation: 'An index fund tracks a collection of companies (an index), giving you instant diversification.',
            },
            {
              question: 'Why do index funds usually have low costs?',
              options: [
                'They are government-funded',
                'Nobody has to spend time choosing individual stocks',
                'They only invest in cheap companies',
              ],
              answer: 1,
              explanation: 'Index funds simply copy an index rather than paying analysts to research and pick stocks, so management costs are minimal.',
            },
            {
              question: 'If one company in an index fund has a very bad year, what happens to you?',
              options: [
                'You lose all your money',
                'The impact is small because you own hundreds of other companies too',
                'The fund immediately removes that company',
              ],
              answer: 1,
              explanation: 'With hundreds of holdings, one bad company barely moves your overall total.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `An index fund is a type of fund that tracks a market index — a predefined list of companies, like the S&P 500 (the 500 largest US companies by market value). The fund holds shares in all the companies on the list, in proportion to their size.\n\nIndex funds are passively managed: the fund does not try to beat the market; it just replicates it. This has two important consequences:\n\nFirst, costs are very low. The annual fee (called the expense ratio) on a typical index fund is 0.03–0.20%, compared to 1–2% for actively managed funds. Over decades, this difference is enormous due to compounding.\n\nSecond, most actively managed funds do not outperform their benchmark index over long periods after fees. Research consistently shows that over 15-20 years, 80–90% of active funds underperform their index. This is not because fund managers are incompetent — it is because markets are competitive and efficient, making consistent outperformance very hard.\n\nFor most people, a low-cost index fund is the most reliable way to capture market returns over time. This is the core insight behind passive investing.`,
          tryIt: {
            prompt: 'Fund A: active management, 1.5% annual fee, aims to beat the S&P 500. Fund B: index fund, 0.05% annual fee, tracks the S&P 500. On a $10,000 investment earning 8% market returns over 30 years, roughly how much MORE do you end up with in Fund B?',
            type: 'choice',
            options: [
              'About $500 more',
              'About $12,000 more',
              'About $45,000 more',
            ],
            correct: 2,
            feedbackRight: 'Fund A net: ~6.5% = ~$66k. Fund B net: ~7.95% = ~$100k+. The fee gap compounds to tens of thousands over 30 years.',
            feedbackWrong: 'At 8%: $10k grows to ~$100k in 30 years. At 6.5% (after 1.5% fee): ~$66k. The $34k difference is all fees — compound costs.',
          },
          quiz: [
            {
              question: 'A passively managed fund differs from an actively managed fund because:',
              options: [
                'It picks the best stocks manually',
                'It simply replicates an index rather than trying to beat it',
                'It is only available to professional investors',
              ],
              answer: 1,
              explanation: 'Passive funds track an index mechanically. Active funds employ analysts to pick stocks in an attempt to outperform.',
            },
            {
              question: 'Over 15–20 years, research shows that actively managed funds:',
              options: [
                'Consistently outperform index funds',
                'Mostly underperform their benchmark index after fees',
                'Perform identically to index funds',
              ],
              answer: 1,
              explanation: 'The data is robust: 80–90% of active funds lag their index over long periods. The primary culprit is fees, not stock selection.',
            },
            {
              question: 'The expense ratio of a fund is:',
              options: [
                'The minimum investment required',
                'The annual fee charged as a percentage of your investment',
                'The fund\'s annual return',
              ],
              answer: 1,
              explanation: 'The expense ratio is deducted from your returns annually. A 1% fee on $10,000 costs $100/year — and that $100 misses out on future compounding too.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `The rise of index funds is one of the most consequential shifts in financial history. Jack Bogle founded Vanguard in 1975 and launched the first public index fund, initially mocked as "Bogle's Folly." Today, passive funds hold over 50% of US equity assets under management.\n\nThe Efficient Market Hypothesis (EMH), developed by Eugene Fama, provides the theoretical foundation. In its semi-strong form, EMH holds that all publicly available information is already reflected in stock prices. If true, no analysis of public data can consistently produce above-market returns — making active management a negative-sum game after costs.\n\nThe arithmetic of active management (William Sharpe, 1991): before costs, the average actively managed fund must earn the market return (because the sum of all investors IS the market). After costs, the average active fund must underperform. A small minority of active managers do outperform persistently — but identifying them in advance is extremely hard, and their fees capture most of the excess return.\n\nFactor investing (Fama/French) offers a middle path: systematic tilts toward value, size, profitability, and momentum factors that have historically earned risk premia above the market. Factor funds are more expensive than plain index funds but cheaper than discretionary active management — and the premia have theoretical risk-based explanations.\n\nLimitations of pure indexing: market-cap weighting means you own more of the most expensive companies. In a bubble, index funds are overweight the bubble. This is not a fatal flaw but it is worth understanding.`,
          tryIt: {
            prompt: 'Sharpe\'s arithmetic says: before costs, the average active manager earns the market return. Therefore, after costs, the average active manager must:',
            type: 'choice',
            options: [
              'Still earn the market return because fees are small',
              'Underperform the market — costs are a zero-sum drag on the active management pool',
              'Outperform because they are more skilled than average',
            ],
            correct: 1,
            feedbackRight: 'Correct. Before costs, active = passive (by arithmetic). After costs, active < passive on average. This is not an opinion — it is accounting.',
            feedbackWrong: 'Sharpe\'s arithmetic: before costs, active average = market. Subtract costs and active average < market. It must be true for the average.',
          },
          quiz: [
            {
              question: 'The semi-strong form of EMH claims:',
              options: [
                'Only insiders can beat the market',
                'All publicly available information is already priced into stocks',
                'Technical analysis reliably produces excess returns',
              ],
              answer: 1,
              explanation: 'Semi-strong EMH means research on earnings, news, or fundamentals cannot systematically produce excess returns, because the market already incorporates that information.',
            },
            {
              question: 'Factor investing (e.g. value, size tilts) sits between pure indexing and active management because:',
              options: [
                'It uses discretionary stock picking',
                'It applies systematic, rules-based tilts toward historically rewarded risk factors at lower cost than active funds',
                'It is only available to hedge funds',
              ],
              answer: 1,
              explanation: 'Factor funds follow rules-based strategies (not human discretion) to capture documented return premia. Lower costs than active, but more targeted than plain cap-weighted indexing.',
            },
            {
              question: 'A market-cap-weighted index fund\'s key structural vulnerability is:',
              options: [
                'It holds too few companies',
                'It automatically overweights the most expensive stocks, concentrating in bubbles',
                'It only invests in developed markets',
              ],
              answer: 1,
              explanation: 'As a stock\'s price rises, its weight in the index rises too — regardless of valuation. This means cap-weighted indexes hold more of whatever is most expensive.',
            },
          ],
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // LESSON 6 — Fees matter
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-06',
      pathId: 'investing-basics',
      order: 6,
      title: 'Fees Matter',
      emoji: '💸',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine every year your piggy bank charges you ten cents just to hold your coins. That does not sound like much. But after ten years, that is a whole dollar gone!\n\nInvestments charge fees too. The fee is usually a small percentage each year. One percent does not sound big, but because of compound growth it adds up to a LOT over time.\n\nThink of a fee as a tiny hole in the bottom of your piggy bank. The bigger the hole, the more leaks out before you can use it.\n\nAlways ask: what is this investment's fee? Lower fees almost always mean more money stays with you in the end.`,
          tryIt: {
            prompt: 'Two piggy banks hold $100 each and both earn $10 per year. Piggy A charges no fee. Piggy B takes $1 every year. After 3 years, which has more?',
            type: 'choice',
            options: ['They have the same amount', 'Piggy A has $3 more', 'Piggy B has $3 more'],
            correct: 1,
            feedbackRight: 'Piggy A keeps all $10 each year. Piggy B loses $1 each year — $3 over 3 years!',
            feedbackWrong: 'Piggy B loses $1 per year to fees, so after 3 years Piggy A has $3 more.',
          },
          quiz: [
            {
              question: 'What is an investment fee?',
              options: [
                'Free money from the government',
                'A charge taken from your investment each year',
                'A reward for investing',
              ],
              answer: 1,
              explanation: 'Fees are deducted from your investment balance. Even small fees reduce how much your money grows.',
            },
            {
              question: 'Why do fees hurt more than they seem?',
              options: [
                'Because they are illegal',
                'Because money lost to fees cannot compound and grow',
                'Because banks always charge extra too',
              ],
              answer: 1,
              explanation: 'A fee today does not just reduce your balance — it also reduces all the future growth that money would have earned.',
            },
            {
              question: 'For the same investment, you should prefer:',
              options: ['The one with the highest fee', 'The one with the lowest fee', 'Fees do not matter'],
              answer: 1,
              explanation: 'Lower fees mean more of your return stays with you. Over decades, the difference is enormous.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Investment fees are one of the only things in investing you can control. You cannot control market returns, but you can choose funds with lower fees.\n\nFees come in several forms. The expense ratio (annual management fee) is the most important — it is deducted from your fund's returns automatically. A fund with 1% expense ratio earning 8% gross returns delivers 7% to you. A fund with 0.05% expense ratio delivers 7.95%.\n\nOver 30 years, the compounding effect of this difference is striking. $10,000 at 7% grows to ~$76,000. At 7.95%, it grows to ~$100,000. A 0.95% annual fee difference cost you $24,000 over three decades.\n\nOther fees to watch: trading commissions (rare now for index funds, common for active funds), sales loads (one-time entry or exit fees on some funds), and platform fees charged by your broker.\n\nThe practical rule: for broad market exposure, choose funds with expense ratios below 0.20%. Many index funds charge 0.03–0.10%. For specialist funds or factors, 0.3–0.5% may be justified. Any fund charging 1%+ needs an extraordinary justification.`,
          tryIt: {
            prompt: 'Fund A: 0.05% fee, 8% gross return. Fund B: 1.5% fee, 8% gross return. What is the net annual return of each?',
            type: 'choice',
            options: [
              'A: 7.95%, B: 6.5%',
              'A: 8.05%, B: 9.5%',
              'Both: 8% — fees are rebated',
            ],
            correct: 0,
            feedbackRight: 'Net return = gross − fee. Fund A: 8% − 0.05% = 7.95%. Fund B: 8% − 1.5% = 6.5%. That 1.45% gap compounds heavily.',
            feedbackWrong: 'Net = gross − fee. A: 8 − 0.05 = 7.95%. B: 8 − 1.5 = 6.5%.',
          },
          quiz: [
            {
              question: 'An expense ratio of 0.05% vs 1.5% over 30 years on $10,000 at 8% gross typically results in a difference of:',
              options: ['About $100', 'About $2,400', 'Tens of thousands of dollars'],
              answer: 2,
              explanation: 'Net at 7.95% (30y): ~$100k. Net at 6.5% (30y): ~$66k. The ~$34,000 gap is entirely explained by fees compounding against you.',
            },
            {
              question: 'A "sales load" is:',
              options: [
                'The fund\'s annual management fee',
                'A one-time entry or exit fee charged by some funds',
                'The total assets in the fund',
              ],
              answer: 1,
              explanation: 'Sales loads are upfront (entry) or back-end (exit) fees charged on purchase or sale. Modern index funds have no sales loads.',
            },
            {
              question: 'For broad market index exposure, a reasonable expense ratio target is:',
              options: ['Below 0.20%', 'Below 1%', 'Below 3%'],
              answer: 0,
              explanation: 'Many index funds charge 0.03–0.10%. Staying under 0.20% for broad market exposure is achievable and makes a significant long-run difference.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `The compounding of fees operates identically to the compounding of returns — but in the opposite direction. Understanding this mathematically is important for anyone evaluating investment products.\n\nThe total cost equation: for a fund charging fee f on gross return r, your net return is r − f. Over n years, $P grows to P × (1 + r − f)^n. The ratio of fee-drag to return compounds: at r=8% and f=1.5%, your ending wealth is (1.065/1.08)^n × what it could have been. Over 30 years, that ratio is (1.065/1.08)^30 ≈ 0.67 — you keep 67 cents of every dollar you would otherwise have had.\n\nBeyond the expense ratio: institutional investors obsess over total cost of ownership (TCO), which includes the expense ratio, transaction costs within the fund, bid-ask spread on ETF trades, tax drag from fund distributions, and platform custodian fees. For large portfolios, TCO optimisation is a meaningful exercise.\n\nAlpha vs fee drag: a fund claiming to earn 1% alpha (return above benchmark) must be evaluated net of its fees. If it charges 1.5%, it needs to generate 1.5% gross alpha just to break even with an index fund. Research by Vanguard and Morningstar suggests fewer than 10% of active funds sustain 1.5% gross alpha over 10+ years.\n\nFee compression trend: the passive investing revolution has driven expense ratios toward zero. Fidelity launched zero-fee index funds in 2018. Competition among brokers has eliminated trading commissions. This is genuinely good for retail investors — but it has also commoditised the fund business, pushing revenue to other products and creating subtle incentive misalignment to watch for.`,
          tryIt: {
            prompt: 'A fund charges 1.5% and claims to earn 1% annual alpha over its benchmark. An index fund charges 0.05% and earns the benchmark. Net of fees, which earns more and by how much annually?',
            type: 'choice',
            options: [
              'The active fund earns 0.95% more net annually (alpha exceeds fee gap)',
              'They are exactly equal — the alpha covers the fee',
              'The index fund earns 0.55% more net annually (fee gap exceeds alpha)',
            ],
            correct: 2,
            feedbackRight: 'Active net: benchmark + 1% − 1.5% = benchmark − 0.5%. Index net: benchmark − 0.05%. Index leads by 0.45–0.55% net. Fees consume the alpha.',
            feedbackWrong: 'Active: + 1% alpha − 1.5% fee = −0.5% relative to benchmark. Index: −0.05% relative. Index wins by ~0.45%.',
          },
          quiz: [
            {
              question: 'Over 30 years at 8% gross with a 1.5% fee, you retain approximately what fraction of the wealth you would have at 0% fee?',
              options: ['About 95%', 'About 80%', 'About 67%'],
              answer: 2,
              explanation: '(1.065/1.08)^30 ≈ 0.67. A 1.5% annual fee destroys roughly one third of 30-year terminal wealth through compounding.',
            },
            {
              question: 'An active fund needs __ gross alpha to match an index fund with 0.05% fee, if the active fund charges 1.5%:',
              options: ['0.5%', '1.45%', '1.55%'],
              answer: 1,
              explanation: 'The active fund must overcome the fee gap: 1.5% − 0.05% = 1.45% of gross alpha needed just to break even with the index fund.',
            },
            {
              question: 'Fidelity\'s zero-fee index funds create a risk of:',
              options: [
                'No risk — lower fees always benefit investors',
                'Incentive misalignment where revenue comes from other, less transparent products',
                'Overpaying for management',
              ],
              answer: 1,
              explanation: 'Zero-fee funds may steer investors toward affiliated products (money market funds, loans, advisory services) that generate undisclosed or higher-margin revenue.',
            },
          ],
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // LESSON 7 — Long term vs hype
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-07',
      pathId: 'investing-basics',
      order: 7,
      title: 'Long Term vs Hype',
      emoji: '📰',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Have you ever seen everyone run to get the last toy on sale? Everyone wants it right now — even if it is not that great!\n\nSometimes people do the same thing with investing. They hear a company is "hot" and everyone rushes to buy its shares. The price goes way up. Then the excitement dies and the price falls back down. People who bought at the top lost money.\n\nThis rush is called hype. Hype is when feelings push prices higher than a company's real worth.\n\nPatient investors do not chase hype. They buy good things at fair prices and wait a long time. The tortoise beats the hare — slow and steady wins the investing race.`,
          tryIt: {
            prompt: 'Your friend says "Everyone is buying SunToy shares! The price went up 500% this week!" You should:',
            type: 'choice',
            options: [
              'Buy as many as you can — it will keep going up!',
              'Stop and think: does SunToy actually earn more money, or is this just excitement?',
              'Ask your friend how much they already made',
            ],
            correct: 1,
            feedbackRight: 'Good thinking! Pausing to ask "why" protects you from chasing hype.',
            feedbackWrong: 'Big fast price rises are often hype, not real growth. Always ask why before you act.',
          },
          quiz: [
            {
              question: 'What is "hype" in investing?',
              options: [
                'A type of savings account',
                'Excitement that pushes prices above what a company is really worth',
                'A guaranteed way to make money',
              ],
              answer: 1,
              explanation: 'Hype is when emotion drives prices higher than facts justify. When the excitement fades, prices often fall sharply.',
            },
            {
              question: 'What do patient long-term investors do differently?',
              options: [
                'Buy the hottest investment every week',
                'Buy good things at fair prices and wait a long time',
                'Check prices every hour',
              ],
              answer: 1,
              explanation: 'Long-term investors focus on real value and let compound growth do the work over years — not days.',
            },
            {
              question: 'If a share price rises 500% in one week, you should:',
              options: [
                'Always buy immediately',
                'Pause and ask if the company\'s real earnings justify the price',
                'Never invest at all',
              ],
              answer: 1,
              explanation: 'Dramatic short-term rises are often driven by emotion, not facts. Asking "why" keeps you from chasing hype.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Financial markets have experienced cycles of boom and bust driven by hype throughout history — tulip mania (1637), the South Sea bubble (1720), dot-com (2000), the 2021 meme-stock surge. The pattern is the same: a real or imagined opportunity, growing excitement, prices detach from fundamentals, the crowd piles in, then sentiment shifts and prices collapse.\n\nThe dot-com bubble is instructive. From 1995 to 2000, NASDAQ rose ~600%. Companies with no revenue and no profit attracted billions in investment because they were "internet companies." When profitability could not materialise, the NASDAQ fell 78% from peak to trough. Many companies went to zero.\n\nLong-term investing works not by predicting short-term excitement, but by owning productive assets long enough that their underlying earnings growth compounds into wealth. The S&P 500's 20-year annualised return (as of 2024) is around 10%, despite living through two of the worst crashes in history.\n\nThe practical danger: studies show that the average retail investor significantly underperforms the funds they invest in. Why? They buy after prices rise (chasing performance) and sell after prices fall (panic). Buying high and selling low is the opposite of what works. Consistent investing regardless of news — often called "staying the course" — consistently outperforms timing the market.`,
          tryIt: {
            prompt: 'The stock market drops 30% in three months. News headlines say "worst crash in a decade." Your investment plan says invest $200/month. You should:',
            type: 'choice',
            options: [
              'Stop investing until the market recovers',
              'Continue investing $200/month — your dollars now buy more shares at lower prices',
              'Invest nothing and wait for a guaranteed recovery',
            ],
            correct: 1,
            feedbackRight: 'Correct. Continuing to invest in a downturn buys more shares for the same money — this is called dollar-cost averaging, and it works in your favour.',
            feedbackWrong: 'Pausing during a crash is a common, costly mistake. Continuing to invest means buying more shares at lower prices — which pays off when they recover.',
          },
          quiz: [
            {
              question: 'In the dot-com crash, the NASDAQ fell approximately:',
              options: ['20%', '50%', '78%'],
              answer: 2,
              explanation: 'The NASDAQ fell ~78% peak to trough between 2000 and 2002. Companies with no earnings saw their valuations return to zero.',
            },
            {
              question: 'Research shows average retail investors underperform their funds because:',
              options: [
                'They pick the wrong funds',
                'They buy after prices rise and sell after prices fall — the opposite of optimal',
                'Funds always charge them extra fees',
              ],
              answer: 1,
              explanation: 'Behaviour gap: emotional buying and selling means investors capture less of a fund\'s return than the fund itself earns. Staying invested matters more than picking the right fund.',
            },
            {
              question: 'Continuing to invest a fixed amount each month, regardless of market conditions, is called:',
              options: ['Market timing', 'Dollar-cost averaging', 'Short selling'],
              answer: 1,
              explanation: 'Dollar-cost averaging (DCA) removes the temptation to time the market. In down months you buy more shares; in up months you buy fewer. It smooths entry prices over time.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `The psychology of speculative manias follows a documented pattern — Hyman Minsky's model of credit cycles and Charles Kindleberger's "Manias, Panics and Crashes" both describe it: displacement (new opportunity), boom, euphoria, overtrading, revulsion, crash. The rational-expectations model of economics struggles to explain why manias happen; behavioural finance fills the gap.\n\nKey behavioural biases that fuel hype cycles: availability heuristic (recent gains make future gains feel likely), social proof (if everyone is buying, it must be good), commitment and consistency (having publicly praised something makes you reluctant to sell), and overconfidence (above-average performance creates the illusion of skill over luck).\n\nGrowth vs value cycles: "growth" investing (paying high multiples for fast-growing companies) and "value" investing (buying cheap companies) have historically alternated in dominance. 2010–2021 saw an unprecedented growth cycle, with companies like Tesla, Shopify, and Zoom trading at 50–100× revenue. Post-2022 rate rises reversed much of this. The lesson: no factor dominates forever.\n\nThe evidence on market timing: Dalbar's annual QAIB report consistently shows the average equity investor earns roughly half the market\'s return over 20 years. Vanguard's research attributes about 1.5% per year of the gap to poor timing decisions. Dimensional's research shows that missing the 25 best trading days in 25 years (out of ~6,300 trading days — less than 0.5%) reduced returns by roughly 50%.\n\nFor a rational long-term investor, the implications are stark: patience, consistency, low costs, and systematic rebalancing compound into large advantages — not because they produce alpha, but because they avoid the self-inflicted underperformance that destroys most of the market\'s return for average investors.`,
          tryIt: {
            prompt: 'A company trades at 80× revenue with no profit. Defenders say: "It is growing at 50%/year and will dominate its market." Bears say: "No margin of safety." What framework helps evaluate both arguments?',
            type: 'choice',
            options: [
              'Look only at recent price momentum — it reflects all available information',
              'Reverse-engineer what growth rate and eventual margin the stock price requires using DCF, then assess whether those assumptions are reasonable',
              'Never invest in growth companies — value always wins',
            ],
            correct: 1,
            feedbackRight: 'Correct. DCF reverse-engineering asks: what must be true for this price to be justified? Then you evaluate whether those conditions are achievable.',
            feedbackWrong: 'Reverse DCF asks what the price "bakes in." If the implied assumptions are heroic (say, 40% margins and 30% growth for 20 years), you can quantify the optimism and assess it rationally.',
          },
          quiz: [
            {
              question: 'Minsky\'s financial instability hypothesis argues that:',
              options: [
                'Markets are always efficient',
                'Stability breeds instability — long periods of calm lead to excessive risk-taking, setting up the next crisis',
                'Central banks always cause crashes',
              ],
              answer: 1,
              explanation: 'Minsky: prolonged stability encourages speculation. Speculative positions become Ponzi-like. Eventually cash flows can\'t cover debt, and the cycle reverses violently.',
            },
            {
              question: 'Dalbar\'s QAIB reports show average equity investors earn roughly half the market\'s return because:',
              options: [
                'They pay higher fees',
                'They systematically buy high (after gains) and sell low (after losses)',
                'They invest in worse funds',
              ],
              answer: 1,
              explanation: 'The behaviour gap — poor timing driven by emotion — is the dominant cause of underperformance, not fund selection or fees.',
            },
            {
              question: 'Reverse-engineering a DCF helps evaluate high-multiple growth stocks by:',
              options: [
                'Confirming the stock will rise',
                'Revealing what growth rate, margins, and duration the current price implicitly assumes',
                'Calculating the correct P/E ratio',
              ],
              answer: 1,
              explanation: 'Rather than forecasting, you ask: what must happen for this price to be fair? If the required assumptions are unrealistic, the price is likely too high.',
            },
          ],
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // LESSON 8 — Fear and FOMO
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-08',
      pathId: 'investing-basics',
      order: 8,
      title: 'Fear and FOMO',
      emoji: '😰',
      durationMins: 3,
      xpReward: 60,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Have you ever been scared to try something new because it looked hard? That is a bit like fear in investing. When prices go down, some people get scared and want to take all their money out — even if waiting would have been better.\n\nFOMO is "Fear Of Missing Out." It is the feeling you get when everyone else seems to be getting rich and you are not part of it. You rush in — and sometimes buy right at the worst moment.\n\nBoth fear and FOMO make us do things in a hurry that we might regret later. The best investors know about these feelings and do not let them win.\n\nTake a breath. Ask: does anything real change? If nothing important has changed about a good investment, fear and FOMO are usually bad guides.`,
          tryIt: {
            prompt: 'The Practice Dollar chart on your portfolio went down $50 this week. You feel worried. What is the BEST thing to do?',
            type: 'choice',
            options: [
              'Sell everything immediately so you stop losing',
              'Take a breath and check if anything actually changed about your plan',
              'Put in more money quickly to fix the loss',
            ],
            correct: 1,
            feedbackRight: 'Good! Short-term drops are normal. Checking your plan first stops fear from making you sell at the worst time.',
            feedbackWrong: 'Selling after a drop locks in the loss. A calm check of your plan usually shows nothing fundamental has changed.',
          },
          quiz: [
            {
              question: 'What is FOMO?',
              options: [
                'A type of investment account',
                'The feeling of fear that you are missing out on a big gain',
                'A fee paid to brokers',
              ],
              answer: 1,
              explanation: 'FOMO (Fear Of Missing Out) pushes people to buy quickly when prices are rising, often near the top — right before a fall.',
            },
            {
              question: 'When your portfolio drops, selling immediately is usually:',
              options: [
                'The safest thing to do',
                'A mistake that locks in losses you could have recovered from',
                'Always the right decision',
              ],
              answer: 1,
              explanation: 'Selling in a dip locks in a real loss. If you wait and the price recovers, no loss was "real" — it was just a temporary lower number on the screen.',
            },
            {
              question: 'Before reacting to a scary market move, the best first step is:',
              options: [
                'Call your bank',
                'Stop, breathe, and check whether anything real has changed',
                'Switch all your money to cash',
              ],
              answer: 1,
              explanation: 'Most market drops are temporary noise. Checking whether your underlying reasons to invest have changed is a rational first step before any action.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Two emotions dominate bad investment decisions: fear and FOMO. Understanding them is the foundation of behavioural finance.\n\nFear: when markets fall sharply, the emotional response is to sell and "wait for things to get better." This feels rational but is usually the opposite of what works. Prices are low precisely when fear peaks — meaning you sell cheap and buy back expensive. Research by Morningstar and Dalbar shows investor returns significantly lag fund returns because of this behaviour.\n\nFOMO (Fear Of Missing Out): when a market or asset is rising fast and everyone is talking about it, the urge to buy is overwhelming. This is typically when assets are most overpriced. The best trades are often lonely — buying when there is blood in the streets (Warren Buffett's famous line) or sitting out the euphoria when others are rushing in.\n\nNot all fear is irrational. If the fundamentals of what you own genuinely change — a company commits fraud, an industry faces permanent disruption — then selling is rational. The skill is distinguishing between a real change in value and temporary emotional noise.\n\nPractical tools: pre-commit to an investment plan in writing before markets get noisy. When fear or FOMO hits, check the plan first. Studies show this simple step dramatically reduces emotional trading.`,
          tryIt: {
            prompt: '"Be greedy when others are fearful, and fearful when others are greedy." This strategy suggests:',
            type: 'choice',
            options: [
              'Always buy when prices are rising and sell when they fall',
              'Consider buying when sentiment is most negative and trimming positions when optimism peaks',
              'Only invest when news is positive',
            ],
            correct: 1,
            feedbackRight: 'Correct. Contrarian thinking means the best buying opportunities often appear when everyone else wants to sell.',
            feedbackWrong: 'The quote advocates contrarianism: buy into fear (cheap prices), sell into greed (expensive prices). It\'s the opposite of following the crowd.',
          },
          quiz: [
            {
              question: 'Research shows investor returns lag fund returns primarily because:',
              options: [
                'Investors pay higher platform fees',
                'Investors buy after gains and sell after losses — the wrong timing',
                'Funds hide their true performance',
              ],
              answer: 1,
              explanation: 'The behaviour gap is the documented difference between a fund\'s return and what its average investor actually earns due to timing decisions.',
            },
            {
              question: 'FOMO-driven buying tends to happen when:',
              options: [
                'Markets are cheap and unloved',
                'Assets are rising fast and receiving wide media coverage — often near a peak',
                'Interest rates are low',
              ],
              answer: 1,
              explanation: 'FOMO peaks when everyone is talking about a hot investment. That same popularity often means the price already reflects all the optimism.',
            },
            {
              question: 'The best protection against emotional trading decisions is:',
              options: [
                'Checking prices every hour',
                'Writing an investment plan in advance and reviewing it before acting',
                'Using leverage to recover losses faster',
              ],
              answer: 1,
              explanation: 'A written plan acts as an anchor. When fear or FOMO strikes, asking "does this action fit my plan?" interrupts the emotional impulse.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `Behavioural finance — the field combining psychology and economics — has documented dozens of cognitive biases that lead to systematic investment errors. Fear and FOMO are entry points into a deeper set of mechanisms.\n\nLoss aversion (Kahneman & Tversky): losses feel roughly twice as painful as equivalent gains feel pleasurable. This asymmetry means investors hold losing positions too long (hoping to avoid "realising" the loss) and sell winning positions too early (locking in the pleasure of a gain). The net effect — cut your winners, run your losers — is the opposite of rational portfolio management.\n\nRecency bias: the tendency to over-weight recent experience. After a bull market, investors project recent returns forward (fuelling FOMO). After a crash, they project recent losses forward (fuelling fear). Both errors are directly traceable to recency bias.\n\nMental accounting: treating money in different contexts as non-fungible. "House money" effect — profits from investments feel less real than principal, leading to excessive risk-taking with gains. Segregating "safe" and "risky" buckets in a way that creates suboptimal overall allocations.\n\nAnchor bias: over-weighting an arbitrary reference price (the price you paid, a 52-week high or low) when making decisions. There is no economic reason why $50 is more meaningful than $49 or $51 — but investors consistently use purchase price as an anchor for "fair value."\n\nPractical tools: systematic, rules-based approaches (auto-invest, rebalancing triggers, pre-committed asset allocations) work by removing the human from the decision at the moment of maximum emotional pressure. Mechanical discipline is the best defence against a brain that was not wired to handle financial markets.`,
          tryIt: {
            prompt: 'You bought a stock at $100. It is now $60. You feel you "cannot sell because then the loss is real." This is an example of which bias?',
            type: 'choice',
            options: [
              'Overconfidence bias',
              'Loss aversion combined with mental accounting — the loss is already real; refusing to sell is holding a bad position to avoid the emotional pain of crystallising it',
              'Recency bias',
            ],
            correct: 1,
            feedbackRight: 'Correct. The loss exists whether you sell or not. Refusing to sell to avoid "realising" it is loss aversion driving an irrational decision.',
            feedbackWrong: 'Loss aversion: the loss is real at $60 regardless of action. Not selling is an attempt to defer the emotional pain — not a rational investment decision.',
          },
          quiz: [
            {
              question: 'Loss aversion causes investors to:',
              options: [
                'Take too little risk overall',
                'Hold losing positions too long and sell winning positions too early',
                'Invest only in government bonds',
              ],
              answer: 1,
              explanation: 'The pain of losses > pleasure of gains leads to holding losers (avoiding "real" loss) and selling winners early (locking in pleasure). Both reduce long-run returns.',
            },
            {
              question: 'Recency bias in investing means:',
              options: [
                'Preferring recently founded companies',
                'Over-weighting recent performance when forecasting future returns',
                'Investing only in assets that recently paid dividends',
              ],
              answer: 1,
              explanation: 'After a bull run, investors project it forward (FOMO). After a crash, they project it forward (fear). Both errors stem from anchoring to recent experience.',
            },
            {
              question: 'Systematic, rules-based investing strategies outperform discretionary ones primarily because:',
              options: [
                'Rules access better information',
                'They remove the human decision-maker at the moment of maximum emotional pressure',
                'They charge lower fees',
              ],
              answer: 1,
              explanation: 'The edge of systematic strategies is not superior analysis — it is the consistent removal of emotional decision-making at exactly the moments it is most damaging.',
            },
          ],
        },
      },
    },
  ],
};
