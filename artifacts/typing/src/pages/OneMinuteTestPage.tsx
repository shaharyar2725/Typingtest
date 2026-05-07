import { useState } from 'react';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/1-minute-typing-test`;

const FAQS = [
  {
    q: 'What is a 1-minute typing test?',
    a: 'A 1-minute typing test measures how many words you can type correctly in 60 seconds. It\'s the most widely used typing test format because it\'s long enough to give a reliable WPM score but short enough to avoid finger fatigue skewing the results.',
  },
  {
    q: 'What WPM should I aim for on the 1-minute test?',
    a: 'The average adult scores around 40 WPM. 60 WPM is above average; 80+ WPM is professional-level; 100+ WPM is fast. If you\'re preparing for a job, many data-entry roles require 60–80 WPM with 95%+ accuracy.',
  },
  {
    q: 'How is WPM calculated on the 1-minute test?',
    a: 'TypeFlow uses net WPM: total correct characters divided by 5, divided by 1 (for 1 minute). Uncorrected errors are penalized. Accuracy is the percentage of keystrokes that were correct over the full test.',
  },
  {
    q: 'Is the 1-minute typing test free?',
    a: 'Yes — 100% free, no download, and no account required. Take as many tests as you like.',
  },
  {
    q: 'How often should I take a 1-minute typing test?',
    a: 'Once or twice a day as a quick benchmark. The real improvement comes from deliberate practice sessions in between — use TypeFlow\'s typing practice page or structured lessons to build speed and accuracy, then test yourself to track progress.',
  },
];

export default function OneMinuteTestPage() {
  useSEO({
    title: '1 Minute Typing Test — Free WPM Speed Check | TypeFlow',
    description:
      'Take the free 1-minute typing test and get your WPM and accuracy instantly. The fastest way to measure your typing speed — no signup, no download.',
    keywords:
      '1 minute typing test, one minute typing test, 60 second typing test, 1 min typing test, wpm test 1 minute, typing speed test 1 minute',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow 1 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 60-second typing test. Measures words per minute (WPM) and accuracy with live feedback. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 60-second time mode',
          'Live WPM, accuracy and error count',
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
    wpm: 0,
    accuracy: 100,
    errors: 0,
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
          Type for 60 seconds and get your WPM and accuracy instantly.
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
        <h2>Why the 1-Minute Typing Test is the Gold Standard</h2>
        <p>
          The 60-second typing test has become the default benchmark for measuring typing speed for
          good reason. It's long enough to smooth out momentary bursts and accidental errors, but
          short enough that finger fatigue doesn't distort your score. It's the format used by most
          employers, schools, and online typing certifications.
        </p>
        <p>
          For everyday typists, a 1-minute test gives the most realistic picture of your practical
          typing speed — the speed you actually use when writing emails, drafting documents, or
          chatting online.
        </p>

        <h2>How WPM Is Calculated on This Test</h2>
        <p>
          TypeFlow uses <strong>net WPM</strong>: the total number of correctly typed characters
          divided by 5 (the standard "word" length), divided by 1 (for 1 minute), minus a penalty
          for uncorrected errors. Accuracy is the percentage of all keystrokes that were correct.
        </p>
        <p>
          Some tools report gross WPM, which counts every keystroke regardless of errors. Net WPM is
          the more honest number — and the one most employers mean when they ask for your WPM.
        </p>

        <h2>WPM Benchmarks: How Do You Compare?</h2>
        <ul>
          <li><strong>Under 30 WPM:</strong> Beginner level. Focus on home-row position and eliminating the habit of looking at your keyboard.</li>
          <li><strong>30–50 WPM:</strong> Average adult typist. Most casual computer use falls here.</li>
          <li><strong>50–70 WPM:</strong> Above average. You type without thinking about it; targeted practice can push you into the professional tier.</li>
          <li><strong>70–90 WPM:</strong> Professional level. The standard required for most data-entry, admin, and clerical roles.</li>
          <li><strong>90–120 WPM:</strong> Fast. Deep muscle memory across the full keyboard. Accuracy at this speed is the real test.</li>
          <li><strong>120+ WPM:</strong> Elite. Where competitive typists and speed-typing champions operate.</li>
        </ul>

        <h2>Tips to Improve Your 1-Minute Score</h2>

        <h3>Keep your fingers on the home row</h3>
        <p>
          Home row (ASDF · JKL;) is your resting position between every keystroke. Each finger
          has assigned keys — letting it stray means every new key becomes a decision instead of
          a reflex. The bumps on F and J are there to anchor you without looking.
        </p>

        <h3>Never look at the keyboard</h3>
        <p>
          Looking down forces a context switch that kills your rhythm. Cover your hands or use a
          blank keycap; it will feel impossibly slow for a few days, then become your new normal.
        </p>

        <h3>Slow down to speed up</h3>
        <p>
          Type at the fastest pace where you can maintain 97%+ accuracy. Errors at high speed just
          reinforce bad habits. Steady, accurate typing builds the muscle memory that naturally
          converts into speed.
        </p>

        <h3>Practice daily in short sessions</h3>
        <p>
          15–20 minutes per day beats hour-long weekly sessions because muscle memory consolidates
          during rest. Use TypeFlow's <a href="/learn-typing">touch-typing course</a> between tests
          to target your weak keys.
        </p>

        <h2>Frequently Asked Questions</h2>
        <dl>
          {FAQS.map(({ q, a }) => (
            <div key={q} className="mb-4">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1 text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}
