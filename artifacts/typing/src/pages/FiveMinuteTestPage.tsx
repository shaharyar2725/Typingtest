import { useState } from 'react';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/5-minute-typing-test`;

const FAQS = [
  {
    q: 'What is a 5-minute typing test?',
    a: 'A 5-minute typing test measures your sustained typing speed — words per minute (WPM) and accuracy — over a full five minutes. It\'s the standard duration used by many employers, transcription agencies, and legal offices to verify that a typist can maintain speed and accuracy under realistic working conditions.',
  },
  {
    q: 'Is a 5-minute typing test harder than a 1-minute test?',
    a: 'Yes. Over five minutes, finger fatigue, concentration lapses, and mental endurance become factors that a 60-second sprint doesn\'t test. Most typists see a WPM drop of 5–15% on a 5-minute test compared to their 1-minute score — which is why sustained practice matters.',
  },
  {
    q: 'What WPM is good on a 5-minute test?',
    a: '50–60 WPM is solid for most professional roles. Transcription and legal secretary positions often require 65–80 WPM sustained. Data-entry positions may specify 5-minute test minimums of 60–70 WPM with 98% accuracy.',
  },
  {
    q: 'How can I improve my 5-minute typing speed?',
    a: 'Practice at the pace you want to sustain — not at your sprint pace. Use TypeFlow\'s 5-minute test daily and track your average WPM across the full test, not just the peak. Also work on accuracy: errors over five minutes add up quickly and tank your net WPM.',
  },
  {
    q: 'Can I use this 5-minute test for job applications?',
    a: 'TypeFlow\'s 5-minute test uses the standard net WPM formula (correct characters ÷ 5 ÷ minutes). It\'s a reliable gauge of your speed, but official employer tests may have their own rules. Use TypeFlow to build and verify your speed before the formal test.',
  },
];

export default function FiveMinuteTestPage() {
  useSEO({
    title: '5 Minute Typing Test — Sustained WPM & Accuracy | TypeFlow',
    description:
      'Take the free 5-minute typing test and measure your sustained WPM and accuracy. The endurance benchmark used by employers — no signup, instant results.',
    keywords:
      '5 minute typing test, five minute typing test, 5 min typing test, endurance typing test, sustained wpm typing test, typing speed test 5 minutes',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow 5 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 5-minute typing endurance test. Measures sustained words per minute (WPM) and accuracy with live feedback. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 5-minute endurance mode',
          'Live WPM and accuracy tracking',
          'Switch word sources (common words, quotes, code)',
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
          { '@type': 'ListItem', position: 2, name: '5 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 300,
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
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 300 }));
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
          5 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          Five minutes. Sustained speed. The endurance benchmark used by employers worldwide.
          Free, no signup, instant results.
        </p>
      </header>

      <section aria-label="5 minute typing test" className="mb-16">
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
                durationSec={300}
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
        <h2>Why the 5-Minute Test Is the Employer Standard</h2>
        <p>
          A 1-minute typing test is a sprint; a 5-minute test is a marathon. Many professional
          environments — transcription agencies, law firms, government offices, and data-entry
          departments — specifically require a 5-minute typing test because it reveals something a
          60-second sprint cannot: whether your speed holds up under real working conditions.
        </p>
        <p>
          Finger fatigue, concentration lapses, and mental endurance all become measurable factors
          over five minutes. A typist who clocks 80 WPM in one minute but drops to 55 WPM by minute
          five will not perform the same as one who sustains 70 WPM consistently.
        </p>

        <h2>WPM Drop: What to Expect</h2>
        <p>
          Most typists see a WPM drop of 5–15% on a 5-minute test compared to their 1-minute
          personal best. This is normal. Elite typists have a much smaller drop — sometimes under 5%
          — because their muscle memory is so deep that individual words cost almost no conscious
          effort.
        </p>
        <p>
          Tracking your "5-minute WPM / 1-minute WPM" ratio over time is a useful endurance metric:
          higher ratios mean more consistent speed.
        </p>

        <h2>Who Needs a 5-Minute Typing Test?</h2>
        <ul>
          <li><strong>Transcriptionists:</strong> Converting audio to text requires consistent, sustained typing speed. Most agencies require 65–80 WPM on a 5-minute test.</li>
          <li><strong>Legal secretaries &amp; paralegals:</strong> Dictation and brief transcription demand both speed and accuracy over long sessions.</li>
          <li><strong>Data-entry clerks:</strong> High-volume data entry requires reliable, repeatable speed — not just peak performance.</li>
          <li><strong>Court reporters (digital):</strong> Real-time transcription under pressure; 5-minute tests are a standard part of certification.</li>
          <li><strong>Executive assistants:</strong> Correspondence, meeting notes, and scheduling require sustained typing throughout the day.</li>
        </ul>

        <h2>How to Improve Your 5-Minute Typing Speed</h2>

        <h3>Train at your target pace, not your sprint pace</h3>
        <p>
          If you want to sustain 70 WPM over five minutes, practice regularly at 65–70 WPM — not
          at your maximum 80 WPM burst. Practicing above your endurance pace builds speed in short
          bursts but not stamina.
        </p>

        <h3>Watch your accuracy, not just WPM</h3>
        <p>
          Errors over five minutes accumulate and compound your net WPM penalty. A 95% accuracy
          rate over five minutes is much harder to maintain than over one minute. Build the habit of
          slowing down when you start making mistakes rather than pushing through.
        </p>

        <h3>Pace yourself through the full test</h3>
        <p>
          The most common mistake is sprinting through the first minute and slowing down sharply
          afterwards. Use TypeFlow's live WPM counter to check your pace. If you're above your
          target in minute one, ease off — you'll finish stronger.
        </p>

        <h3>Build endurance with structured lessons</h3>
        <p>
          Use TypeFlow's <a href="/learn-typing">touch-typing course</a> to drill weak keys and
          patterns. Once you've covered the full keyboard, come back to the 5-minute test and
          track your improvement.
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
