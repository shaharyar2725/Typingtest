import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://taketypingtest.com';
const PAGE_URL = `${SITE_ORIGIN}/3-minute-typing-test`;

const FAQS = [
  {
    q: 'What is a 3-minute typing test?',
    a: 'A 3-minute typing test measures your typing speed (WPM) and accuracy over 180 seconds. It sits between the quick snapshot of a 1-minute test and the full endurance challenge of a 5-minute test, long enough to smooth out flukes and short bursts, but efficient enough to use as a daily check-in. Many typing certification programs use 3-minute tests as their standard format.',
  },
  {
    q: 'Is a 3-minute typing test used by employers?',
    a: 'Yes. The 3-minute typing test is a common pre-employment format used by government agencies, insurance companies, and general office roles. It\'s long enough to give a reliable snapshot of your sustained speed without the time commitment of a 5-minute test. Many civil service typing certifications specify a 3-minute standard.',
  },
  {
    q: 'What is a good WPM on a 3-minute test?',
    a: '45–55 WPM is average for the 3-minute format. 60 WPM qualifies you for most administrative roles. 70–80 WPM is professional-level. Most typists score 5–10% lower on a 3-minute test than on their best 1-minute test because sustained accuracy becomes more demanding.',
  },
  {
    q: 'How does a 3-minute test compare to a 1-minute test?',
    a: 'A 1-minute test captures your peak speed; a 3-minute test reveals your sustainable cruising speed. The difference between your 1-minute and 3-minute WPM is a useful consistency metric. An elite typist sees less than 5% drop; most typists see a 5–12% drop. If your drop is larger, building accuracy through slower deliberate practice helps close the gap.',
  },
  {
    q: 'How can I improve my 3-minute typing score?',
    a: 'Build a strong accuracy foundation using TakeTypingTest\'s touch-typing lessons, then move into timed practice at your target pace. 3-minute daily practice sessions, where you focus on maintaining pace rather than sprinting, are the most efficient way to raise your sustained WPM. Track your average across five runs rather than your single best score.',
  },
  {
    q: 'Is this 3-minute typing test free?',
    a: 'Yes. It\'s 100% free, no signup, no download required. Take as many tests as you need.',
  },
];

export default function ThreeMinuteTestPage() {
  useSEO({
    title: '3 Minute Typing Test — Free WPM & Accuracy Check | TakeTypingTest',
    description:
      'Free 3-minute typing test, the daily practice standard used by office and government employers. Measure your sustainable WPM and accuracy with instant results and global percentile ranking.',
    keywords:
      '3 minute typing test, three minute typing test, 3 min typing test, typing test 3 minutes, office typing test, government typing test, civil service typing test, wpm test 3 minutes',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TakeTypingTest 3 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 3-minute typing test. Measures words per minute (WPM) and accuracy with live feedback and global percentile ranking. Used by office and government employers.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 3-minute timed mode',
          'Live WPM and accuracy tracking',
          'Global WPM percentile ranking on completion',
          'Multiple word sources (common words, quotes, code)',
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
          { '@type': 'ListItem', position: 2, name: '3 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 180,
  }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({
    wpm: 0, accuracy: 100, errors: 0,
  });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const saved = updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 180 }));
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
          3 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          The daily practice standard. Three minutes reveals your real cruising speed,
          not your sprint peak. Free, no signup, instant results with global percentile ranking.
        </p>
      </header>

      <section aria-label="3 minute typing test" className="mb-16">
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
                durationSec={180}
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

      {/* Unique angle: 3-min as the daily benchmark sweet spot */}
      <section className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6 py-8 border-y border-border">
        {[
          {
            title: '3 minutes, the daily check-in',
            desc: 'Long enough to smooth out lucky streaks and bad starts. Short enough to do twice before breakfast. The most efficient daily benchmark format.',
          },
          {
            title: 'Cruising speed, not your sprint peak',
            desc: '3 minutes separates your true sustainable WPM from your 60-second burst. The gap between the two tells you exactly how much endurance work you need.',
          },
          {
            title: 'Employer standard for office roles',
            desc: 'Civil service agencies, insurance companies, and general admin roles often use a 3-minute typing test. Qualifying at 60+ WPM here opens the door to most entry-level office positions.',
          },
        ].map(({ title, desc }) => (
          <div key={title}>
            <h3 className="text-base font-bold mb-1.5">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert">
        <h2>Why 3 Minutes Is the Daily Practice Sweet Spot</h2>
        <p>
          The 1-minute typing test is great for a quick peak-speed check, but it's too short to reveal
          your real work rate. A 3-minute test is the minimum duration where concentration, finger
          endurance, and accuracy consistency all come into play. It's also short enough to fit into any
          practice routine, making it the ideal daily benchmark format for typists at every level.
        </p>
        <p>
          For anyone preparing for an office job or civil service position, the 3-minute format is
          particularly important. Many government typing certifications, from administrative assistants to
          postal clerks to DMV staff, use a 3-minute standard specifically because it's long enough to
          weed out lucky short-burst scores while remaining practical for a screening context.
        </p>

        <h2>The 3-Minute Consistency Metric</h2>
        <p>
          The most useful number from a 3-minute test isn't your WPM. It's the ratio of your 3-minute
          WPM to your 1-minute WPM. Here's what that gap tells you:
        </p>
        <ul>
          <li><strong>Less than 5% drop:</strong> Excellent consistency. Your muscle memory is solid across sustained effort. Focus on pushing your ceiling higher.</li>
          <li><strong>5–10% drop:</strong> Normal range. Occasional concentration lapses and minor fatigue. Daily 3-minute practice will tighten this quickly.</li>
          <li><strong>10–15% drop:</strong> Accuracy degrades under sustained effort. Slow down to 97%+ accuracy pace and rebuild from there.</li>
          <li><strong>Over 15% drop:</strong> Significant endurance gap. You're sprinting in minute one and fading badly. Practice at your 3-minute target pace, not your burst pace.</li>
        </ul>

        <h2>3-Minute WPM Benchmarks by Role</h2>
        <ul>
          <li><strong>General office / admin:</strong> 50–60 WPM minimum, 65+ preferred</li>
          <li><strong>Civil service (government):</strong> Often 40–50 WPM with 95%+ accuracy required for entry-level</li>
          <li><strong>Customer support (live chat):</strong> 55–65 WPM. Response speed directly affects resolution rates.</li>
          <li><strong>Data entry:</strong> 60–70 WPM with 98%+ accuracy on a 3-minute test</li>
          <li><strong>Insurance / claims processing:</strong> 50–60 WPM sustained. 3-minute tests are standard pre-hire screening.</li>
        </ul>

        <h2>How to Build Your 3-Minute Score</h2>

        <h3>Practice at pace, not at max</h3>
        <p>
          If you want a 65 WPM 3-minute score, train at 60–65 WPM rather than always trying to hit 75.
          Practicing above your endurance speed builds burst speed, not sustained performance. Use
          TakeTypingTest's live WPM counter to keep yourself in the target range throughout the full 3 minutes.
        </p>

        <h3>Track your average, not your best</h3>
        <p>
          A single 70 WPM test doesn't make you a 70 WPM typist. Take 5 runs and record your average.
          That average, not the peak, is your real score. Employers who use typing tests are measuring
          your reliable rate, not your lucky day.
        </p>

        <h3>Use structured lessons for weak spots</h3>
        <p>
          If your accuracy dips below 96% during a 3-minute run, you have specific key combinations that
          aren't yet automatic. TakeTypingTest's <Link href="/learn-typing">touch-typing course</Link> isolates
          those combinations in dedicated drills so you can fix them faster than through random practice alone.
        </p>

        <h2>Other Durations to Try</h2>
        <p>
          Use the <Link href="/1-minute-typing-test">1-minute test</Link> to find your speed ceiling and
          check daily progress. Use the <Link href="/5-minute-typing-test">5-minute test</Link> to
          simulate professional employment conditions. Use the{' '}
          <Link href="/typing-speed-test">standard typing speed test</Link> for your official benchmark
          with adjustable duration.
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
