import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { ProfessionSpeedTable } from '@/components/ProfessionSpeedTable';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/typing-speed-test`;

const FAQS = [
  {
    q: 'What is a typing speed test?',
    a: 'A typing speed test measures how many words you can type per minute (WPM) and how accurately you type them. TypeFlow calculates net WPM — total correct characters divided by 5, divided by time in minutes — which is the same formula used by professional typing benchmarks and most employer tests.',
  },
  {
    q: 'What is the average typing speed for an adult?',
    a: 'The global average typing speed is 41.6 WPM, measured across 10.4 million tests. Most adults fall between 38–50 WPM in daily use. The average professional typist hits 65–75 WPM. Northern European countries average the highest at around 48 WPM.',
  },
  {
    q: 'Is 40 WPM a good typing speed?',
    a: 'Yes — 40 WPM is exactly at the global average. It\'s sufficient for everyday tasks like email and documents. However, most professional roles (data entry, admin, legal) require 60–80 WPM. If your goal is employment, 60 WPM is the practical target for most office positions.',
  },
  {
    q: 'Is 60 WPM a good typing speed?',
    a: '60 WPM is above average and qualifies you for most office, admin, and customer support roles. It puts you roughly in the 79th percentile globally — faster than about 4 out of every 5 typists. With deliberate daily practice, most people can reach 60 WPM within 4–8 weeks.',
  },
  {
    q: 'How can I type 100 WPM?',
    a: 'Reaching 100 WPM requires: mastery of all ten-finger touch typing positions, consistent daily practice (not marathon sessions), drilling weak key combinations until they become automatic, and typing without looking at the keyboard. Most people who reach 100 WPM have spent 3–6 months of daily 15-minute practice sessions after first mastering accurate touch typing.',
  },
  {
    q: 'How long should I practice to improve my typing speed?',
    a: '15–20 minutes of focused daily practice is more effective than hour-long sessions. Muscle memory consolidates during rest, not during typing. Most people see measurable gains — 10–20 WPM — within 4–6 weeks of daily deliberate practice.',
  },
  {
    q: 'Does typing speed matter for programmers?',
    a: 'Yes, but accuracy matters more. Programmers typically type 50–70 WPM. While faster typing helps maintain a flow state and prevents thoughts from outrunning your fingers, a typo in code costs far more time to debug than the seconds saved by typing a little faster. Accurate, consistent touch typing is the real goal.',
  },
  {
    q: 'Is this typing speed test free?',
    a: 'Yes — TypeFlow\'s typing speed test is 100% free, runs entirely in your browser, and requires no download, account, or email.',
  },
  {
    q: 'What is the best free typing website?',
    a: 'TypeFlow offers a free typing speed test, 15-second through 5-minute time modes, quote and code modes, and a free 10-lesson touch typing course — all without signup. Other good free options include Monkeytype (minimalist), TypingClub (structured lessons for beginners), and 10FastFingers (multiplayer competition).',
  },
];

export default function TypingSpeedTestPage() {
  useSEO({
    title: 'Free Typing Speed Test — Check Your WPM Instantly | TypeFlow',
    description:
      'Take the free TypeFlow typing speed test and instantly see your WPM, accuracy, and global percentile. Adjustable from 15 seconds to 5 minutes. No signup needed.',
    keywords:
      'typing speed test, typing test, wpm test, words per minute test, online typing test, free typing test, check typing speed, keyboard speed test, typing test wpm, what is good typing speed',
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
          'Free online typing speed test with live WPM, accuracy, and error tracking. Adjustable duration and word sets. Shows global WPM percentile on completion.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Live WPM, accuracy and error tracking',
          'Adjustable duration: 15 s, 30 s, 1 min, 2 min, 5 min',
          'Word mode, quote mode and code mode',
          'Global WPM percentile ranking after each test',
          'Profession speed comparison table',
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
    wpm: 0, accuracy: 100, errors: 0,
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
        Free Typing Speed Test
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Measure your WPM and accuracy — free, instant, no signup required. See your global percentile ranking after the test.
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
            <ResultCard result={result} onRestart={handleRestart} />
          </div>
        )}
      </div>

      {/* Profession Speed Table — unique, high-value section */}
      <section className="mb-16">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">
          Typing speed requirements by profession
        </h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
          Real WPM requirements from job postings and employer benchmarks. Filter by category to see if your
          score qualifies you for specific roles.
          {result && result.wpm > 0 && (
            <span className="text-primary font-semibold"> Your last score was {result.wpm} WPM — rows are highlighted based on your result.</span>
          )}
        </p>
        <ProfessionSpeedTable userWpm={result?.wpm} />
      </section>

      {/* Long-form article */}
      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-4">
        <h2>What Does Your Typing Speed Say About You?</h2>
        <p>
          Your words-per-minute (WPM) score is more than a number — it's a snapshot of how efficiently you
          communicate through a keyboard. The global average across 10.4 million measured tests is 41.6 WPM.
          That's your baseline. Here's what the full spectrum looks like.
        </p>

        <h3>Typing Speed Benchmarks by Skill Level</h3>
        <ul>
          <li><strong>Beginner (under 30 WPM):</strong> Still looking at the keyboard for most keystrokes. Touch-typing basics will create the biggest gains at this stage — you can expect 7–10 WPM weekly improvement with daily practice.</li>
          <li><strong>Average (30–50 WPM):</strong> Roughly where most adults land. The global average is 41.6 WPM. Enough for everyday tasks, but there's room to nearly double your speed with deliberate practice over 6–8 weeks.</li>
          <li><strong>Above average (50–70 WPM):</strong> You type without thinking about most keys. Targeted drilling on weak combinations can push you into the professional tier within a few weeks.</li>
          <li><strong>Professional (70–90 WPM):</strong> The threshold many employers cite for data entry, administrative, and legal secretary roles. Accuracy at this speed is the real differentiator.</li>
          <li><strong>Fast (90–120 WPM):</strong> You've built deep muscle memory across the full keyboard. Journalists, experienced legal assistants, and power users operate here.</li>
          <li><strong>Elite (120+ WPM):</strong> Top 1–2% globally. Where competitive typists and speed-typing champions operate. At this level, every keystroke is a reflex.</li>
        </ul>

        <h2>How to Improve Your Typing Speed</h2>
        <p>
          Typing speed is a skill, not a talent. The ceiling is much higher than most people realize, and the
          floor rises quickly with the right habits. Here's a proven framework used by the fastest self-taught typists.
        </p>

        <h3>1. Stop looking at the keyboard</h3>
        <p>
          This is the single biggest unlock. Every time your eyes drop to find a key, your brain interrupts
          its flow state. Cover your hands with a cloth, use a blank keyboard, or simply force yourself to
          keep your eyes on the screen. It will feel painfully slow for a week — and then it won't. Most
          people break through their old cap within 10–14 days of strict no-peeking practice.
        </p>

        <h3>2. Slow down to speed up</h3>
        <p>
          Speed is a byproduct of accuracy and muscle memory, not the other way around. If you're making
          errors, you're going too fast for your current skill level. Research shows a single error costs
          ~2.5 seconds of cognitive reset — so typing at 90% accuracy with 10% errors can be slower in
          practice than typing at 70 WPM with 99% accuracy. Drop to a pace where you type without mistakes,
          hold it there until it feels automatic, then gradually increase.
        </p>

        <h3>3. Use all ten fingers from home row</h3>
        <p>
          Home row position (ASDF for left hand, JKL; for right hand) is the foundation of touch typing.
          Each finger has an assigned zone — index fingers cover the inner columns, pinkies cover the outer
          edges. Straying from this means every new key is a conscious decision rather than a reflex. Use
          TypeFlow's <Link href="/learn-typing">touch-typing course</Link> to build each zone systematically.
        </p>

        <h3>4. Practice deliberately, not just more</h3>
        <p>
          15–20 minutes of focused typing practice beats a two-hour casual session. Use TypeFlow's typing
          test to track your baseline, then practice in short, focused blocks. Identify your weak spots —
          errors tend to cluster around the same key combinations — and drill those specifically in the
          lesson course.
        </p>

        <h3>5. Maintain good posture</h3>
        <p>
          Sit upright, keep your wrists slightly elevated above the keyboard (not resting flat on the desk),
          and strike keys with the pads of your fingertips. Keep your elbows at roughly 90 degrees, and
          position the keyboard so your hands are slightly below elbow level. Fatigue and poor posture create
          inconsistency, which directly kills speed and accuracy in the second half of longer tests.
        </p>

        <h2>How TypeFlow Calculates WPM</h2>
        <p>
          TypeFlow uses <strong>net WPM</strong>: total correct characters typed, divided by 5 (the standard
          "word" length), divided by test duration in minutes. Uncorrected errors are penalized. This is the
          same formula used by professional typing benchmarks, certification tests, and most employer-administered assessments.
        </p>
        <p>
          <strong>Gross WPM</strong> (used by some other tools) counts every keystroke regardless of errors —
          which is why you may see higher scores on those platforms. Net WPM is the more honest number. If an
          employer asks for your WPM, they almost always mean net WPM.
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
