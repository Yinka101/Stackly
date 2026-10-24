import type { LearningPath } from './types.js';

// Lessons 1–4 of Investing Basics
export const investingBasicsA: LearningPath = {
  id: 'investing-basics',
  title: 'Investing Basics',
  emoji: '📈',
  description: 'Learn how investing works, why it matters, and how to think about risk and reward.',
  lessons: [
    // ────────────────────────────────────────────────────────────────────
    // LESSON 1 — What is a stock?
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-01',
      pathId: 'investing-basics',
      order: 1,
      title: 'What is a Stock?',
      emoji: '🍕',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine your friend starts a lemonade stand and needs $10 to buy lemons. You give her $5 and another friend gives $5. Now you both own half of the lemonade stand!\n\nThat is what a stock is. When a big company needs money to grow, it splits itself into tiny pieces called shares. People buy shares. Each person who owns a share owns a tiny piece of that company.\n\nIf the lemonade stand earns lots of money, your piece becomes worth more. If business is slow, it might be worth less. That is the exciting — and tricky — part of owning stocks.\n\nIn Stackly we use Practice Dollars so you can try buying shares without using real money.`,
          tryIt: {
            prompt: 'A toy company has 100 shares. You buy 10. What percentage of the company do you own?',
            type: 'slider',
            min: 1,
            max: 50,
            step: 1,
            correctMin: 9,
            correctMax: 11,
            feedbackRight: '10 out of 100 = 10%. You own one tenth of the company!',
            feedbackWrong: '10 ÷ 100 = 10%. If you have 10 pieces of 100, you own 10% of the company.',
          },
          quiz: [
            {
              question: 'What is a share of a company most like?',
              options: ['A piece of pizza', 'A library book', 'A birthday card'],
              answer: 0,
              explanation: 'A share is your slice of ownership in a company, just like a slice of pizza is your piece of the whole pie.',
            },
            {
              question: 'If a company does really well, what usually happens to its shares?',
              options: ['They become worthless', 'They become worth more', 'Nothing changes'],
              answer: 1,
              explanation: 'When a company earns more money, people want to own a piece — so the price of each share goes up.',
            },
            {
              question: 'Why do companies sell shares?',
              options: ['To give money away', 'To raise money they need to grow', 'To pay for adverts'],
              answer: 1,
              explanation: 'Selling shares raises money for the company to expand, hire people, or build new things.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `When a company wants to raise money without borrowing, it can sell ownership stakes to the public. Each stake is a share of stock. The total number of shares multiplied by the price per share equals the company's market capitalisation — the market's current estimate of what the whole company is worth.\n\nIf a company has 10 million shares trading at $25 each, its market cap is $250 million. That figure moves every second the market is open, because the share price changes constantly.\n\nWhy do prices move? Supply and demand. If investors believe the company will earn more money in the future, demand for shares rises and so does the price. If there is bad news — a product flop, an economic slowdown — demand falls and prices drop.\n\nOwning stock entitles you to a share of profits (paid as dividends, if the company chooses to distribute them) and a vote on certain company decisions. It also means you absorb losses if the company struggles.\n\nRemember: in Stackly, all trades use Practice Dollars — not real money. Every investing screen is for educational purposes only.`,
          tryIt: {
            prompt: 'A company has 5 million shares at $40 each. What is its market cap?',
            type: 'choice',
            options: ['$20 million', '$200 million', '$2 billion'],
            correct: 1,
            feedbackRight: '5,000,000 × $40 = $200,000,000 = $200 million. Market cap = shares × price.',
            feedbackWrong: 'Market cap = shares × price. 5,000,000 × $40 = $200,000,000 ($200 million).',
          },
          quiz: [
            {
              question: 'Market capitalisation equals:',
              options: ['Annual profit × 10', 'Total shares × current price per share', 'Total debt + equity'],
              answer: 1,
              explanation: 'Market cap = shares outstanding × price. It reflects the market\'s current total valuation of the company.',
            },
            {
              question: 'What causes a share price to rise?',
              options: [
                'More people wanting to sell than buy',
                'More people wanting to buy than sell',
                'The company printing more shares',
              ],
              answer: 1,
              explanation: 'Like any market, when demand (buyers) exceeds supply (sellers), the price rises.',
            },
            {
              question: 'What is a dividend?',
              options: [
                'A fee charged when you buy shares',
                'A portion of company profit paid to shareholders',
                'The price of one share',
              ],
              answer: 1,
              explanation: 'Some companies share a portion of their profits with shareholders as regular dividend payments.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `A share of common stock represents a fractional ownership claim on a company's assets and future cash flows. Understanding what you are actually buying is foundational to rational investment analysis.\n\nThe intrinsic value of a stock, in theory, equals the present value of all future cash flows the company will generate, discounted at a rate that reflects risk. This is the discounted cash flow (DCF) framework. In practice, DCF is sensitive to assumptions — small changes in growth rate or discount rate produce large changes in estimated value, which is why two analysts can look at the same company and reach very different conclusions.\n\nMarket price reflects the collective opinion of all market participants in real time. It diverges from intrinsic value constantly. The opportunity in investing is identifying when that gap is large enough — in either direction — to act on. Value investors (Buffett, Graham) seek stocks trading below intrinsic value. Growth investors accept current high prices in expectation of future cash flows that do not yet exist.\n\nImportant structural reality: most of a stock's total long-run return comes not from dividends but from capital appreciation — the increase in share price. And most of that appreciation traces back to earnings growth compounded over decades. This is why time horizon matters so much.`,
          tryIt: {
            prompt: 'A company is expected to generate $5M in free cash flow next year, growing at 8% forever. You require a 12% return. What is the rough intrinsic value (use the Gordon Growth Model: V = CF / (r − g))?',
            type: 'choice',
            options: ['$41.7 million', '$62.5 million', '$125 million'],
            correct: 2,
            feedbackRight: 'V = $5M / (0.12 − 0.08) = $5M / 0.04 = $125M. Growth assumptions drive valuations enormously.',
            feedbackWrong: 'Gordon Growth Model: V = CF / (r − g) = $5M / (0.12 − 0.08) = $5M / 0.04 = $125M.',
          },
          quiz: [
            {
              question: 'Intrinsic value in DCF analysis equals:',
              options: [
                'The current market price',
                'The present value of all future expected cash flows, discounted at a risk-appropriate rate',
                'Book value of assets minus liabilities',
              ],
              answer: 1,
              explanation: 'DCF values a business by what it can earn for you in the future, adjusted for the time value of money and risk.',
            },
            {
              question: 'Why are DCF models sensitive to small assumption changes?',
              options: [
                'They use too many decimal places',
                'Compounding over long periods amplifies small differences in growth rate or discount rate',
                'The formula was designed incorrectly',
              ],
              answer: 1,
              explanation: 'A 1% change in a growth rate compounded over 20 years produces a dramatically different terminal value, making the model output highly sensitive.',
            },
            {
              question: 'The majority of long-run stock returns come from:',
              options: [
                'Dividends alone',
                'Capital appreciation driven by compounding earnings growth',
                'Currency fluctuations',
              ],
              answer: 1,
              explanation: 'Over decades, earnings growth — compounded — drives most of total return. Dividends contribute more in value stocks and early periods.',
            },
          ],
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // LESSON 2 — Risk and reward
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-02',
      pathId: 'investing-basics',
      order: 2,
      title: 'Risk and Reward',
      emoji: '⚖️',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine you can win a prize by guessing which hand holds a coin. If you guess right, you get $2. If you guess wrong, you get nothing. That feels fair, right?\n\nNow imagine a different game. You could win $10, but you might lose $5. More reward, but also more risk!\n\nInvesting works the same way. Things that can earn you more money usually have a bigger chance of going down too. Things that are very safe usually earn less.\n\nA savings account at a bank is very safe. Your money will not disappear. But it grows slowly. Stocks can grow faster, but they can also go down. Neither is bad — they are just different, and choosing the right one depends on your goal.`,
          tryIt: {
            prompt: 'Which would you choose to save for a new toy you want to buy in two weeks?',
            type: 'choice',
            options: [
              'A savings account — your money stays safe for the short time',
              'Stocks — they might grow more',
              'Spend it now before prices change',
            ],
            correct: 0,
            feedbackRight: 'Smart! For a short goal, safety matters more than growth. Stocks can drop right when you need the money.',
            feedbackWrong: 'Stocks can fall quickly. For a short-term goal, a safe savings account is the right match.',
          },
          quiz: [
            {
              question: 'What is risk in investing?',
              options: [
                'The chance your money might grow',
                'The chance your money might fall in value',
                'A type of savings account',
              ],
              answer: 1,
              explanation: 'Risk is the possibility that your investment loses value. Higher potential reward usually comes with higher risk.',
            },
            {
              question: 'Which is usually safer but slower to grow?',
              options: ['Stocks', 'A savings account', 'Lottery tickets'],
              answer: 1,
              explanation: 'Bank savings accounts are protected and grow at a steady, predictable rate — but that rate is lower than what stocks can offer over time.',
            },
            {
              question: 'When does risk matter most?',
              options: [
                'When you have a long time before you need the money',
                'When you need the money very soon',
                'Risk never matters',
              ],
              answer: 1,
              explanation: 'If you need the money soon, you cannot wait for a falling investment to recover — so lower risk is more important for short-term goals.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `In finance, risk and reward are linked. You cannot reliably earn high returns without accepting the possibility of losses. Understanding this trade-off is one of the most important lessons in investing.\n\nRisk in investing usually means volatility — how much an investment's value moves up and down. A government savings bond barely moves; it is low-risk, low-reward. A startup company's stock might double or halve in a year — high-risk, high-potential-reward.\n\nYour time horizon changes how much risk you should accept. If you need the money in six months, a drop in stocks could ruin your plan. If you will not touch the money for 20 years, short-term drops matter much less — markets have historically recovered over long periods.\n\nRisk tolerance is personal. It is not just about time — it is about how you feel when your portfolio drops 20%. Would you panic-sell, or stay the course? Honest self-awareness here is more important than any formula.\n\nOne more thing: risk-free does not mean no-risk. Even cash in a bank account loses purchasing power to inflation over time. Not investing is also a risk.`,
          tryIt: {
            prompt: 'You are saving for university in 8 years. Which allocation shows appropriate risk for your time horizon?',
            type: 'choice',
            options: [
              '100% in a low-interest savings account — maximum safety',
              'A mix of mostly diversified investments with a small cash buffer',
              '100% in a single high-growth small company stock',
            ],
            correct: 1,
            feedbackRight: 'Right. Eight years is long enough to ride out short-term drops, but enough diversification keeps extreme risk in check.',
            feedbackWrong: 'Eight years is a meaningful horizon — enough to take moderate risk. 100% cash loses to inflation; 100% one stock is concentrated risk.',
          },
          quiz: [
            {
              question: 'Volatility in investing means:',
              options: [
                'The size of the annual fee',
                'How much an investment\'s value moves up and down over time',
                'The speed at which dividends are paid',
              ],
              answer: 1,
              explanation: 'Volatility measures price swings. High volatility = large moves in both directions. Low volatility = steadier, smaller moves.',
            },
            {
              question: 'Why does time horizon affect how much risk you should take?',
              options: [
                'Longer horizons guarantee higher returns',
                'More time allows recovery from short-term losses before you need the money',
                'Shorter horizons always earn more',
              ],
              answer: 1,
              explanation: 'Markets fluctuate short-term but have historically trended upward over long periods. More time means drops are less threatening.',
            },
            {
              question: 'Holding only cash has a hidden risk because:',
              options: [
                'Thieves might steal it',
                'Inflation gradually erodes its purchasing power',
                'Banks can disappear overnight',
              ],
              answer: 1,
              explanation: 'If inflation runs at 3% and your savings earn 1%, your money buys less each year. This is inflation risk.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `Risk is not a single concept — it is a family of related but distinct ideas, and conflating them leads to poor decisions.\n\nVolatility (standard deviation): the most commonly used quantitative risk measure. It captures how much returns vary around their average. High standard deviation = high volatility. The problem: volatility treats upside and downside moves equally, which investors do not — losing $100 feels worse than gaining $100 feels good (loss aversion, Kahneman & Tversky).\n\nDrawdown: the peak-to-trough decline in value. This is often more emotionally and practically relevant than standard deviation. A fund with moderate volatility but a 50% drawdown is very hard to hold through; one that occasionally spikes but rarely drops more than 15% may be psychologically easier.\n\nBeta: a measure of a security's sensitivity to market movements. Beta > 1 means more volatile than the market; beta < 1 means less volatile. Beta only captures systematic (market-wide) risk, not company-specific risk.\n\nConcentration risk: the danger of too much exposure to a single position, sector, or geography. A portfolio of 30 uncorrelated stocks has far lower concentration risk than one with 3 stocks in the same industry.\n\nLiquidity risk: the risk that you cannot sell an investment at a fair price quickly. Real estate, private equity, and small-cap stocks carry more liquidity risk than large-cap public equities.\n\nMacro / sequence risk: for someone drawing down savings (a retiree), a bear market in the first few years of withdrawal is far more damaging than the same bear market at the end — because early losses reduce the capital base that would otherwise compound.`,
          tryIt: {
            prompt: 'Two portfolios have the same average annual return (8%) over 10 years. Portfolio A has a maximum drawdown of 12%. Portfolio B has a maximum drawdown of 45%. For a retiree drawing $30k/year, which is safer and why?',
            type: 'choice',
            options: [
              'Portfolio B — higher volatility means higher long-term return',
              'Portfolio A — a smaller drawdown protects the capital base the retiree draws from',
              'Neither — average returns are identical so they are equivalent',
            ],
            correct: 1,
            feedbackRight: 'Correct. Sequence-of-returns risk means a 45% drawdown early in retirement can permanently impair the portfolio, even if long-run returns are identical.',
            feedbackWrong: 'Average return hides sequence risk. A 45% drawdown during withdrawal years forces selling at depressed prices, permanently reducing future returns.',
          },
          quiz: [
            {
              question: 'Standard deviation as a risk measure has a key limitation because:',
              options: [
                'It is too complex to calculate',
                'It weights upside and downside moves equally, ignoring loss aversion',
                'It only applies to bonds, not stocks',
              ],
              answer: 1,
              explanation: 'Investors are not symmetric about gains and losses. Standard deviation does not capture this asymmetry — hence measures like CVaR or maximum drawdown supplement it.',
            },
            {
              question: 'Beta measures:',
              options: [
                'A stock\'s total risk',
                'A stock\'s sensitivity to broad market movements (systematic risk)',
                'A company\'s annual profit growth rate',
              ],
              answer: 1,
              explanation: 'Beta only captures how a stock moves relative to the market. Company-specific (idiosyncratic) risk is separate and can be diversified away.',
            },
            {
              question: 'Sequence-of-returns risk is most dangerous for:',
              options: [
                'A 25-year-old adding to savings each month',
                'A retiree making regular withdrawals from their portfolio',
                'A company holding bonds to maturity',
              ],
              answer: 1,
              explanation: 'Early large losses reduce the capital base during withdrawal years, creating permanent damage that recoveries cannot fully repair.',
            },
          ],
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // LESSON 3 — Diversification
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-03',
      pathId: 'investing-basics',
      order: 3,
      title: 'Diversification',
      emoji: '🧺',
      durationMins: 3,
      xpReward: 50,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine carrying all your Easter eggs in one basket. If you drop it — smash! All gone.\n\nBut if you spread the eggs into three baskets, dropping one is not so bad. You still have the other two!\n\nInvesting works the same way. If you put all your money into one company and that company has a bad year, you could lose a lot. But if you spread your money across many different companies, one bad year for one company matters much less.\n\nSpreading your money across many investments is called diversification. It is one of the smartest free tools in investing — it reduces risk without giving up much reward.`,
          tryIt: {
            prompt: 'You have $100. Which is safer?',
            type: 'choice',
            options: [
              'Put all $100 into one ice-cream company',
              'Put $25 each into an ice-cream company, a games company, a book company, and a bakery',
              'Keep it all as cash',
            ],
            correct: 1,
            feedbackRight: 'Yes! Spreading across four different types of companies means one bad one will not hurt as much.',
            feedbackWrong: 'Spreading money across different companies reduces the damage if any one of them has a bad year.',
          },
          quiz: [
            {
              question: 'What is diversification?',
              options: [
                'Putting all your money in one safe company',
                'Spreading investments across many different things',
                'Only buying shares on Mondays',
              ],
              answer: 1,
              explanation: 'Diversification means not putting all your eggs in one basket — spreading your investments to reduce the impact of any single loss.',
            },
            {
              question: 'If you own shares in 20 different companies and one has a bad year, what happens?',
              options: [
                'You lose all your money',
                'The damage is limited because the other 19 may be fine',
                'All 20 companies have a bad year too',
              ],
              answer: 1,
              explanation: 'One bad company in a diversified portfolio has much less impact than if it were your only holding.',
            },
            {
              question: 'Diversification is "free" because:',
              options: [
                'It costs money to diversify',
                'It reduces risk without requiring you to give up expected returns',
                'You never lose money if you diversify',
              ],
              answer: 1,
              explanation: 'Unlike buying insurance (which costs money), diversification reduces risk by spreading it — without reducing your expected return.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Diversification is sometimes called "the only free lunch in investing." It reduces risk without proportionally reducing expected return — which is remarkable and worth understanding deeply.\n\nHere is why it works: if two companies' share prices move independently of each other, sometimes one is up while the other is down. Those movements partially cancel out. The combined portfolio is smoother than either investment alone.\n\nCorrelation is the key measure. If two investments move in lockstep (correlation = 1), diversifying between them helps little. If they move in opposite directions (correlation = -1), they perfectly offset each other. Real assets sit somewhere between: not perfectly correlated, so diversification helps, but not perfectly uncorrelated either.\n\nPractical diversification: spreading across different industries (technology, healthcare, energy, consumer goods), different geographies, and different asset types (stocks, bonds, real estate) reduces concentration risk.\n\nImportant limit: diversification reduces company-specific risk (idiosyncratic risk) but does not eliminate market-wide risk (systematic risk). When a major crash happens, most stocks fall together regardless of diversification. You cannot diversify away a recession.`,
          tryIt: {
            prompt: 'You own shares in five tech companies. A new law badly hurts the tech industry. Your portfolio:',
            type: 'choice',
            options: [
              'Is well diversified — you have five different companies',
              'Is NOT well diversified — all five move together because they are in the same industry',
              'Is unaffected because you own five stocks',
            ],
            correct: 1,
            feedbackRight: 'Correct. Owning five companies in the same sector is sector concentration, not true diversification.',
            feedbackWrong: 'Five companies in the same industry are highly correlated. A sector-wide shock hits them all. True diversification requires different industries.',
          },
          quiz: [
            {
              question: 'Correlation measures:',
              options: [
                'The fee for buying two stocks at once',
                'How closely two investments move together',
                'The speed of price changes',
              ],
              answer: 1,
              explanation: 'Correlation ranges from -1 (opposite moves) to +1 (identical moves). Lower correlation between holdings means better diversification.',
            },
            {
              question: 'What type of risk can diversification NOT eliminate?',
              options: [
                'Company-specific risk',
                'Systematic (market-wide) risk like a broad recession',
                'Sector-specific risk',
              ],
              answer: 1,
              explanation: 'Market-wide risk affects all assets. When the whole economy contracts, even diversified portfolios fall — diversification cannot help there.',
            },
            {
              question: 'Owning 10 stocks all in the same sector:',
              options: [
                'Provides strong diversification',
                'Provides less diversification than owning 5 stocks across 5 different sectors',
                'Is always better than owning 10 stocks in different sectors',
              ],
              answer: 1,
              explanation: 'Cross-sector diversification reduces correlation between holdings. Same-sector stocks tend to rise and fall together.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `Modern Portfolio Theory (MPT), developed by Harry Markowitz in 1952, formalises the mathematics of diversification. Its core insight: for a given level of expected return, you can minimise risk by choosing the right combination of assets — and the "minimum variance portfolio" lies on the efficient frontier.\n\nThe efficient frontier is the set of portfolios that offer the highest expected return for each level of risk. Portfolios below the frontier are suboptimal — you are taking more risk than necessary for your return. Portfolios above it are impossible to achieve (in theory).\n\nThe Capital Asset Pricing Model (CAPM) builds on MPT to define the risk premium you should expect for holding any asset. Expected return = Risk-free rate + Beta × (Market return − Risk-free rate). The key implication: only systematic risk (beta) earns compensation; idiosyncratic risk (company-specific) does not, because it can be diversified away for free.\n\nPractical limits of MPT: the model assumes returns are normally distributed (they are not — fat tails exist), correlations are stable (they are not — correlations spike during crises), and investors are rational (they are not). These assumptions matter most precisely when you need the model most — during market stress.\n\nAlternative frameworks (risk parity, factor investing) extend MPT but share its core insight: the structure of your portfolio, not just the individual holdings, determines the risk you carry.`,
          tryIt: {
            prompt: 'Portfolio A: 20 stocks, all high-beta tech. Portfolio B: 20 stocks, 4 from each of 5 sectors, mixed betas. CAPM says idiosyncratic risk is diversified away in both. What remains and why does sector matter?',
            type: 'choice',
            options: [
              'Nothing remains — both portfolios are fully diversified',
              'Systematic risk remains in both, but Portfolio A has higher average beta and more sector concentration, amplifying market moves',
              'Only Portfolio B has risk remaining',
            ],
            correct: 1,
            feedbackRight: 'Right. CAPM removes idiosyncratic risk through diversification, but Portfolio A\'s higher average beta means it swings more with the market — and sector concentration increases correlation during sector-specific shocks.',
            feedbackWrong: 'Both portfolios retain systematic risk. Portfolio A\'s higher average beta and sector concentration mean larger swings when markets or the tech sector move.',
          },
          quiz: [
            {
              question: 'The efficient frontier represents:',
              options: [
                'The maximum return possible at any level of risk',
                'The set of portfolios with the highest return for each level of risk',
                'The minimum fee portfolio for each asset class',
              ],
              answer: 1,
              explanation: 'Portfolios on the efficient frontier are optimal — no other combination offers more return for the same risk (or less risk for the same return).',
            },
            {
              question: 'CAPM says only systematic risk earns a return premium because:',
              options: [
                'Company-specific risk is always zero',
                'Idiosyncratic risk can be eliminated for free through diversification, so the market does not compensate for it',
                'Beta is always greater than 1',
              ],
              answer: 1,
              explanation: 'If you can remove a risk for free (by diversifying), rational markets will not pay you extra to hold it. Only undiversifiable (market) risk commands a premium.',
            },
            {
              question: 'A key failure of MPT during market crises is:',
              options: [
                'It assumes too many stocks in the portfolio',
                'Correlations between assets spike toward 1 precisely when diversification is most needed',
                'It underestimates average returns over long periods',
              ],
              answer: 1,
              explanation: 'In a crisis, "diversified" portfolios suddenly fall together because fear and liquidity needs drive all asset sales simultaneously — the correlation assumption breaks down.',
            },
          ],
        },
      },
    },

    // ────────────────────────────────────────────────────────────────────
    // LESSON 4 — Compound growth
    // ────────────────────────────────────────────────────────────────────
    {
      id: 'inv-04',
      pathId: 'investing-basics',
      order: 4,
      title: 'Compound Growth',
      emoji: '🌳',
      durationMins: 4,
      xpReward: 60,
      variants: {
        sprouts: {
          band: 'sprouts',
          story: `Imagine you have a magic $10. Every year it grows by 10%. After one year you have $11. After two years, you earn 10% of $11 — that is $1.10 — so you have $12.10.\n\nNotice something? The second year you earned $1.10, not just $1.00. That is because you earned money on your earlier earnings too. This is called compound growth — your money earns money on itself!\n\nOver a long time, compound growth is very powerful. $10 growing at 10% for 30 years becomes over $174. That is more than 17 times your starting amount — just from waiting!\n\nThe three magic ingredients are: start early, let it grow, and do not take it out too soon.`,
          tryIt: {
            prompt: 'You invest $100 and earn 10% per year. After TWO years, how much do you have? (Hint: Year 1: $100 + 10% = $110. Year 2: $110 + 10% = ?)',
            type: 'choice',
            options: ['$120.00', '$121.00', '$110.00'],
            correct: 1,
            feedbackRight: '$110 × 1.10 = $121. You earned $1 extra compared to simple interest because of compounding!',
            feedbackWrong: 'Year 1: $100 × 1.10 = $110. Year 2: $110 × 1.10 = $121. The extra $1 is compound growth at work.',
          },
          quiz: [
            {
              question: 'What does "compound growth" mean?',
              options: [
                'Earning money only on your starting amount',
                'Earning money on both your starting amount AND your previous earnings',
                'Losing money slowly over time',
              ],
              answer: 1,
              explanation: 'Compounding earns returns on returns. Each period, your growing total earns growth — not just the original amount.',
            },
            {
              question: 'The most important ingredient for compound growth to work is:',
              options: ['Starting with a lot of money', 'Time', 'Luck'],
              answer: 1,
              explanation: 'Even a small amount grows dramatically over many years. Time is the most powerful ingredient in compounding.',
            },
            {
              question: '$100 at 10% for 1 year gives you:',
              options: ['$200', '$110', '$100.10'],
              answer: 1,
              explanation: '$100 × 10% = $10 growth. $100 + $10 = $110.',
            },
          ],
        },
        builders: {
          band: 'builders',
          story: `Compound growth — earning returns on returns — is the most powerful force in long-term investing. Albert Einstein allegedly called it "the eighth wonder of the world." Whether or not he said it, the maths backs it up.\n\nThe formula is simple: Future Value = Present Value × (1 + r)^n. Where r is the annual return rate and n is the number of years.\n\nExample: $1,000 at 7% for 40 years = $1,000 × (1.07)^40 ≈ $14,974. Your $1,000 becomes nearly $15,000 without adding anything.\n\nThe rule of 72: divide 72 by the annual return rate to find roughly how many years it takes to double. At 7%, money doubles every ~10 years. At 12%, every ~6 years.\n\nStarting early beats contributing more later. Investing $200/month from age 18 to 28 (10 years) and then stopping results in more wealth at 65 than investing $200/month from age 28 to 65 (37 years) — because the first ten years of compounding are the most powerful foundation.\n\nKey constraint: this assumes returns are left to compound. Withdrawing, spending returns, or stopping contributions interrupts the chain.`,
          tryIt: {
            prompt: 'Using the Rule of 72, roughly how long does it take $5,000 to double at a 9% annual return?',
            type: 'choice',
            options: ['About 4 years', 'About 8 years', 'About 16 years'],
            correct: 1,
            feedbackRight: '72 ÷ 9 = 8 years. The Rule of 72 is a fast mental shortcut for doubling time.',
            feedbackWrong: 'Rule of 72: divide 72 by the rate. 72 ÷ 9 = 8 years to double.',
          },
          quiz: [
            {
              question: 'The formula FV = PV × (1 + r)^n gives:',
              options: [
                'The fee charged on an investment',
                'The future value of an amount growing at rate r over n years',
                'The number of shares to buy',
              ],
              answer: 1,
              explanation: 'This is the compound growth formula. It tells you exactly how much a lump sum grows over time at a fixed rate.',
            },
            {
              question: 'The Rule of 72 says your money doubles when:',
              options: [
                'You invest for 72 months',
                'You divide 72 by the annual return rate',
                'Your balance reaches $72,000',
              ],
              answer: 1,
              explanation: 'Rule of 72 is a mental maths shortcut. At 6% annual return: 72 ÷ 6 = 12 years to double.',
            },
            {
              question: 'Why does starting early beat contributing more later?',
              options: [
                'Early investors get a tax break',
                'Earlier money compounds for more years, creating a bigger base that all future growth multiplies on',
                'Markets always go up in the first years',
              ],
              answer: 1,
              explanation: 'The first dollars invested have the longest time to compound. Later contributions join a larger base but miss the early multiplication.',
            },
          ],
        },
        investors: {
          band: 'investors',
          story: `Compound growth is mathematically simple but behaviourally hard. The challenge is not understanding the formula — it is not interrupting the compounding process.\n\nGeometric vs arithmetic returns: compounding uses geometric returns (each period multiplies the previous). Arithmetic returns (averaging percentage gains) overstate actual performance when returns are volatile. If an investment gains 50% one year and loses 50% the next, the arithmetic average is 0% — but the geometric (compound) return is −25%. $100 → $150 → $75.\n\nThe Kelly Criterion — from information theory — gives the theoretically optimal fraction of capital to risk per bet to maximise long-run geometric growth. It penalises over-betting severely: risking too large a fraction drags down the geometric mean dramatically even when the bet has a positive expected value. This is mathematically why diversification and position sizing matter: not just to reduce volatility, but to protect geometric growth.\n\nInflation's compounding: the same formula works in reverse for inflation. At 3% annual inflation, $100 today becomes $55 of purchasing power in 20 years. Real returns (nominal minus inflation) are what actually matter for wealth building.\n\nThe J-curve of compounding: the early years feel slow. $10,000 at 8% earns $800 in year one. The same portfolio at $500,000 earns $40,000 — in the same year, with the same 8% rate. The explosive growth phase is invisible at the start, which is why investors underestimate the importance of starting early and staying invested.`,
          tryIt: {
            prompt: 'An investment gains 100% in year 1, then loses 50% in year 2. The arithmetic average return is 25%. What is the actual geometric return (and ending value of $1,000)?',
            type: 'choice',
            options: [
              '$1,250 — the arithmetic average applies',
              '$1,000 — back to start; geometric return is 0%',
              '$750 — geometric return is negative',
            ],
            correct: 1,
            feedbackRight: '$1,000 × 2 = $2,000 after year 1. $2,000 × 0.5 = $1,000 after year 2. Geometric return = 0%, not the 25% arithmetic average.',
            feedbackWrong: '$1,000 → ×2 → $2,000 → ×0.5 → $1,000. Geometric return = 0%. Volatility destroys arithmetic-average returns.',
          },
          quiz: [
            {
              question: 'Geometric returns differ from arithmetic returns because:',
              options: [
                'They use different currencies',
                'Compounding means losses have a larger effect than equivalent gains — volatility reduces geometric returns below arithmetic ones',
                'Geometric returns are always higher',
              ],
              answer: 1,
              explanation: 'A 50% loss requires a 100% gain to recover. This asymmetry means volatile returns compound to less than their arithmetic average suggests.',
            },
            {
              question: 'The Kelly Criterion addresses:',
              options: [
                'Which stocks to pick',
                'How much of your capital to risk per bet to maximise long-run geometric growth',
                'The optimal time to exit a position',
              ],
              answer: 1,
              explanation: 'Kelly optimises the fraction to risk. Over-betting reduces geometric growth even on positive-expectation bets — the math of ruin governs long-run outcomes.',
            },
            {
              question: 'At 3% annual inflation, $100 of purchasing power today equals approximately how much in 20 years?',
              options: ['$100', '$74', '$55'],
              answer: 2,
              explanation: '$100 × (0.97)^20 ≈ $54.38. Inflation compounds against you — real returns matter, not just nominal ones.',
            },
          ],
        },
      },
    },
  ],
};
