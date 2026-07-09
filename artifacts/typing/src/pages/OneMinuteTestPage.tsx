import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://www.taketypingtest.com';
const PAGE_URL = `${SITE_ORIGIN}/1-minute-typing-test`;

const FAQS = [
  {
    q: 'What is a 1-minute typing test?',
    a: 'A 1-minute typing test measures how many words you can type correctly in 60 seconds. It\'s the most widely used typing test format because it\'s long enough to give a reliable WPM score but short enough to avoid finger fatigue skewing the results. It\'s used by most employers, schools, and online typing certifications.',
  },
  {
    q: 'What is the average WPM for a 1-minute test?',
    a: 'The global average across all typists is 41.6 WPM. Most adults fall between 38–50 WPM in a 1-minute test. Students average slightly lower; regular office workers average slightly higher at 45–55 WPM. The average professional typist scores 65–75 WPM.',
  },
  {
    q: 'What WPM should I aim for on the 1-minute test?',
    a: '40 WPM is the global average. 60 WPM is above average (79th percentile) and qualifies for most office roles. 80+ WPM is professional-level; 100+ WPM is fast. For job applications, most data-entry and admin roles require 60–80 WPM with 95%+ accuracy.',
  },
  {
    q: 'How is WPM calculated on the 1-minute test?',
    a: 'TakeTypingTest uses net WPM: total correct characters divided by 5 (the standard "word" length), divided by 1 (for 1 minute). Uncorrected errors are penalized. Accuracy is the percentage of keystrokes that were correct over the full test. This is the same formula used by professional benchmarks and employer tests.',
  },
  {
    q: 'How many words is a 1-minute typing test?',
    a: 'It depends on your speed, but a test completed at 40 WPM covers 40 "words" (where a word = 5 characters). At 60 WPM, you type 60 words worth of characters in 60 seconds. TakeTypingTest generates enough text to fill any speed, so the test never runs out of words.',
  },
  {
    q: 'Is the 1-minute typing test free?',
    a: 'Yes. It\'s 100% free, no download, and no account required. Take as many tests as you like.',
  },
  {
    q: 'How often should I take a 1-minute typing test?',
    a: 'Once or twice a day as a quick benchmark works well. The real improvement comes from deliberate practice sessions in between tests. Use TakeTypingTest\'s typing practice page or structured lessons to build speed and accuracy, then test yourself to track progress. Daily testing without practice won\'t improve your WPM.',
  },
];

export default function OneMinuteTestPage() {
  useSEO({
    title: '1 Minute Typing Test — Free WPM Speed Check | TakeTypingTest',
    description:
      'Take the free 1-minute typing test and get your WPM, accuracy, and global percentile instantly. The fastest way to measure your typing speed. No signup, no download.',
    keywords:
      '1 minute typing test, one minute typing test, 60 second typing test, 1 min typing test, wpm test 1 minute, typing speed test 1 minute, average wpm 1 minute test',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TakeTypingTest 1 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 60-second typing test. Measures words per minute (WPM) and accuracy with live feedback and global percentile ranking. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 60-second time mode',
          'Live WPM, accuracy and error count',
          'Global WPM percentile ranking on completion',
          'Switch between word sets (common words, quotes, code)',
          'No account required',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: '1 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 60,
  }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({
    wpm: 0, accuracy: 100, errors: 0,
  });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const saved = updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 60 }));
    if ('fontSize' in newSettings || 'funMode' in newSettings) {
      setResult(null);
      setStats({ wpm: 0, accuracy: 100, errors: 0 });
      setRestartKey((k) => k + 1);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey((k) => k + 1);
  };

  const isRunning = stats.timeLeft !== undefined && stats.timeLeft > 0 && !result;

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">

      <header className="text-center mb-6 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          1 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          Type for 60 seconds and get your WPM, accuracy, and global percentile instantly.
          Free, no signup, works on any device.
        </p>
      </header>

      <section aria-label="1 minute typing test" className="mb-16">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
              timeLeft={stats.timeLeft}
              isRunning={isRunning}
              lockSettings
            />
            <div className="min-h-[180px] flex items-center justify-center mt-10">
              <TypingTest
                key={restartKey}
                mode="time"
                durationSec={60}
                wordCount={settings.wordCount}
                funMode={settings.funMode}
                stopOnError={settings.stopOnError}
                soundEnabled={settings.soundEnabled}
                soundOnError={settings.soundOnError}
                soundOnSuccess={settings.soundOnSuccess}
                soundOnKey={settings.soundOnKey}
                fontSize={settings.fontSize}
                linesVisible={settings.linesVisible}
                onComplete={(res) => setResult(res)}
                onStatsUpdate={setStats}
              />
            </div>
          </div>
        ) : (
          <ResultCard result={result} onRestart={handleRestart} />
        )}
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-12">
        <h2>Why the 1-Minute Test Is the Gold Standard</h2>
        <p>
          The 60-second typing test has become the default benchmark for measuring typing speed for a clear
          reason: it hits a sweet spot between reliability and practicality. It's long enough to smooth out
          momentary bursts and accidental errors, but short enough that finger fatigue doesn't distort your
          score. This is the format used by most employers, schools, and online typing certifications worldwide.
        </p>
        <p>
          For everyday typists, a 1-minute test gives the most realistic picture of your practical typing
          speed, the speed you actually use when writing emails, drafting documents, or taking notes. It's
          also the format that most job posting WPM requirements refer to.
        </p>

        <h2>Average WPM by 1-Minute Test: Real Data</h2>
        <p>
          Across 10.4 million measured tests, the global average sits at 41.6 WPM. Here's how that breaks
          down in context:
        </p>
        <ul>
          <li><strong>Students (average):</strong> 34–38 WPM. Keyboard use is high but deliberate practice is low.</li>
          <li><strong>General adults:</strong> 38–50 WPM. The bulk of the population falls here.</li>
          <li><strong>Office workers:</strong> 45–60 WPM. Regular typing builds passive speed gains.</li>
          <li><strong>Programmers:</strong> 50–70 WPM. Accuracy-first mindset, and code symbols slow the average.</li>
          <li><strong>Writers/journalists:</strong> 65–90 WPM. Typing to keep pace with thought.</li>
          <li><strong>Professional typists:</strong> 65–80 WPM. Deliberate skill, and what most employer tests target.</li>
          <li><strong>Competitive typists:</strong> 120–180 WPM. Dedicated practice, often years of refinement.</li>
        </ul>

        <h2>How WPM Is Calculated on This Test</h2>
        <p>
          TakeTypingTest uses <strong>net WPM</strong>: the total number of correctly typed characters divided by 5
          (the standard "word" length), divided by 1 (for 1 minute), minus a penalty for uncorrected errors.
          Accuracy is the percentage of all keystrokes that were correct.
        </p>
        <p>
          Some tools report <strong>gross WPM</strong>, which counts every keystroke regardless of errors.
          Net WPM is the more honest number, and the one most employers mean when they ask for your WPM.
          If you've ever scored higher on another platform, that platform may be using gross WPM.
        </p>

        <h2>Tips to Improve Your 1-Minute Score</h2>

        <h3>Keep your fingers on the home row</h3>
        <p>
          Home row (ASDF · JKL;) is your resting position between every keystroke. Each finger has assigned
          keys, and letting it stray means every new key becomes a decision instead of a reflex. The bumps on F
          and J are there to anchor you without looking. If you're not using home row, fixing this one habit
          will likely add 10–20 WPM within two to three weeks.
        </p>

        <h3>Never look at the keyboard</h3>
        <p>
          Looking down forces a context switch that kills your rhythm and breaks the flow state. Cover your
          hands or use a blank keycap; it will feel impossibly slow for a few days, then become your new
          normal. This single habit change is responsible for the biggest WPM jumps in new touch typists.
        </p>

        <h3>Slow down to speed up</h3>
        <p>
          Type at the fastest pace where you can maintain 97%+ accuracy. Errors at high speed just reinforce
          bad habits, and one error costs ~2.5 seconds of reset time, which tanks your net WPM more than
          slowing down would. Steady, accurate typing builds the muscle memory that naturally converts into
          speed over 2–4 weeks.
        </p>

        <h3>Practice daily in short sessions</h3>
        <p>
          15–20 minutes per day beats hour-long weekly sessions because muscle memory consolidates during
          rest. Use TakeTypingTest's <Link href="/learn-typing">touch-typing course</Link> between tests to target
          your weak keys, then return to the 1-minute test to measure improvement.
        </p>

        <h2>Try Other Durations</h2>
        <p>
          Use the <Link href="/3-minute-typing-test">3-minute test</Link> to check your sustainable cruising
          speed, the one that matters for daily practice. The{' '}
          <Link href="/5-minute-typing-test">5-minute test</Link> mirrors professional employment conditions
          used by transcription agencies and legal offices. For advanced endurance, the{' '}
          <Link href="/10-minute-typing-test">10-minute test</Link> is the civil service and professional
          certification standard. The <Link href="/20-minute-typing-test">20-minute test</Link> is for
          serious typists and court reporter trainees who want to stress-test their long-session baseline.
        </p>

        <h2>Frequently Asked Questions</h2>
        <dl>
          {FAQS.map(({ q, a }) => (
            <div key={q} className="mb-5">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1 text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}
