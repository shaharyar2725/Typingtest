import { useState } from 'react';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/typing-speed-test`;

const FAQS = [
  {
    q: 'What is a typing speed test?',
    a: 'A typing speed test measures how many words you can type per minute (WPM) and how accurately you type them. TypeFlow calculates net WPM — total correct characters divided by 5, divided by time in minutes — which is the same formula used by professional typing benchmarks.',
  },
  {
    q: 'What is an average typing speed?',
    a: 'The average adult typist clocks around 40 WPM. Typing at 60 WPM puts you above average; 80+ WPM is considered professional-level; and anything above 100 WPM is fast. Many competitive typists routinely exceed 120 WPM.',
  },
  {
    q: 'How long should I practice to improve my typing speed?',
    a: '15–20 minutes of focused daily practice is more effective than hour-long sessions. Consistency matters far more than duration. Most people see measurable gains — 10–20 WPM — within 4–6 weeks of daily deliberate practice.',
  },
  {
    q: 'Does typing speed matter for programmers?',
    a: 'Yes, but accuracy matters more. Programmers typically type 50–70 WPM. While faster typing helps maintain a flow state, a typo in code can cost far more time to debug than the few seconds saved by typing quickly. Accurate, consistent touch typing is the real goal.',
  },
  {
    q: 'Is this typing speed test free?',
    a: 'Yes — TypeFlow\'s typing speed test is 100% free, runs entirely in your browser, and requires no download or account.',
  },
];

export default function TypingSpeedTestPage() {
  useSEO({
    title: 'Typing Speed Test — Check Your WPM Free | TypeFlow',
    description:
      'Take the free TypeFlow typing speed test and instantly see your WPM, accuracy, and error count. Adjustable duration, word sets and code mode. No signup needed.',
    keywords:
      'typing speed test, typing test, wpm test, words per minute test, online typing test, free typing test, check typing speed, keyboard speed test',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow Typing Speed Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free online typing speed test with live WPM, accuracy, and error tracking. Adjustable duration and word sets.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Live WPM, accuracy and error tracking',
          'Adjustable duration: 15 s, 30 s, 60 s, 2 min, 5 min',
          'Word mode and quote mode',
          'Code typing practice mode',
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
          { '@type': 'ListItem', position: 2, name: 'Typing Speed Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => loadState().settings);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
  });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const updated = updateSettings(newSettings);
    setSettings(updated);
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey(k => k + 1);
  };

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center">
        Typing Speed Test
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Measure your WPM and accuracy — free, instant, no signup required.
      </p>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center mb-16">
        {!result ? (
          <div className="w-full relative">
            <TypingHeader
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
              timeLeft={stats.timeLeft}
              isRunning={stats.timeLeft !== undefined && stats.timeLeft > 0 && stats.timeLeft < settings.duration}
            />

            <div className="flex gap-8 justify-center my-6 opacity-80 text-sm font-mono font-medium tracking-widest text-muted-foreground uppercase transition-opacity hover:opacity-100">
              <div className="flex flex-col items-center">
                <span className="text-2xl text-foreground mb-1">{stats.wpm}</span>wpm
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl text-foreground mb-1">{stats.accuracy}%</span>acc
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl text-foreground mb-1">{stats.errors}</span>err
              </div>
            </div>

            <div className="min-h-[160px] flex items-center justify-center">
              <TypingTest
                key={restartKey}
                mode={settings.mode}
                durationSec={settings.duration}
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
          <div className="w-full py-8">
            <ResultCard
              result={result}
              onRestart={handleRestart}
            />
          </div>
        )}
      </div>

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-4">
        <h2>What Does Your Typing Speed Say About You?</h2>
        <p>
          Your words-per-minute (WPM) score is more than a number — it's a snapshot of
          how efficiently you communicate through a keyboard. Here's how the global
          average stacks up across different skill levels.
        </p>

        <h3>Typing Speed Benchmarks by Skill Level</h3>
        <ul>
          <li><strong>Beginner (under 30 WPM):</strong> Still looking at the keyboard for most keystrokes. Touch-typing basics will create the biggest gains at this stage.</li>
          <li><strong>Average (30–55 WPM):</strong> Roughly where most adults land. Enough for everyday tasks, but there's room to nearly double your speed with deliberate practice.</li>
          <li><strong>Above average (55–80 WPM):</strong> You type without thinking about it. A few weeks of targeted drill can push you into the professional tier.</li>
          <li><strong>Professional (80–100 WPM):</strong> The threshold many employers cite for data entry and administrative roles.</li>
          <li><strong>Fast (100+ WPM):</strong> Rare. You've built deep muscle memory across the full keyboard. Accuracy at this speed is the real differentiator.</li>
        </ul>

        <h3>Typing Speed Benchmarks by Profession</h3>
        <ul>
          <li><strong>Data entry &amp; transcription:</strong> 60–80 WPM minimum; some roles require 90 WPM.</li>
          <li><strong>Programmers &amp; developers:</strong> 50–70 WPM typical. Accuracy over speed — a typo in code costs more time to debug than the seconds you'd save typing faster.</li>
          <li><strong>Executive assistants &amp; legal secretaries:</strong> 65–90 WPM, often with strict accuracy requirements.</li>
          <li><strong>Writers &amp; journalists:</strong> 70–100 WPM to keep pace with their own thinking.</li>
          <li><strong>Court reporters &amp; stenographers:</strong> 225 WPM or more (on specialized stenotype machines).</li>
        </ul>

        <h2>How to Improve Your Typing Speed</h2>
        <p>
          Typing speed is a skill, not a talent. The ceiling is high and the floor rises
          quickly with the right habits. Here's a proven framework.
        </p>

        <h3>1. Stop looking at the keyboard</h3>
        <p>
          This is the single biggest unlock. Every time your eyes drop to find a key,
          your brain interrupts its flow. Cover your hands with a cloth, use a blank
          keyboard, or simply force yourself to keep your eyes on the screen. It will
          feel painfully slow for a week — and then it won't.
        </p>

        <h3>2. Slow down to speed up</h3>
        <p>
          Speed is a byproduct of accuracy and muscle memory. If you're making errors,
          you're going too fast for your current skill level. Drop to a pace where you
          can type without mistakes, hold it there until it feels automatic, then
          gradually increase. Chasing WPM before building accuracy just reinforces
          bad habits.
        </p>

        <h3>3. Use all ten fingers in the correct positions</h3>
        <p>
          Home row position (ASDF / JKL;) is not optional — it's the foundation of
          touch typing. Each finger has an assigned zone of keys. Straying from this
          means every new key is a cognitive decision instead of a reflex.
        </p>

        <h3>4. Practice deliberately, not just more</h3>
        <p>
          15–20 minutes of focused typing practice beats a two-hour casual session. Use
          TypeFlow's typing test to track your baseline, identify your weak spots (errors
          tend to cluster around the same key combinations), and drill those specifically
          with our <a href="/learn-typing">touch-typing lessons</a>.
        </p>

        <h3>5. Maintain good posture</h3>
        <p>
          Sit upright, keep your wrists slightly elevated above the keyboard (not resting
          on the desk), and strike keys with the pads of your fingers — not your
          fingertips or nails. Fatigue and poor posture create inconsistency, which kills
          speed.
        </p>

        <h2>How TypeFlow Calculates WPM</h2>
        <p>
          TypeFlow uses <strong>net WPM</strong>: total correct characters typed, divided
          by 5 (the standard "word" length), divided by test duration in minutes.
          Uncorrected errors are penalized. This is the same formula used by professional
          typing benchmarks and most employer-administered tests.
        </p>
        <p>
          <strong>Gross WPM</strong> (used by some other tools) counts every keystroke
          regardless of errors — which is why you may see different scores across
          platforms. Net WPM is the more honest number.
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
