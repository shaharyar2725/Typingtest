import { useState } from 'react';
import { Link } from 'wouter';
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
    a: 'A 5-minute typing test measures your sustained typing speed — words per minute (WPM) and accuracy — over a full five minutes. It\'s the standard duration used by many employers, transcription agencies, and legal offices to verify that a typist can maintain speed under realistic working conditions, not just in a 60-second sprint.',
  },
  {
    q: 'Is a 5-minute typing test harder than a 1-minute test?',
    a: 'Yes. Over five minutes, finger fatigue, concentration lapses, and mental endurance become factors that a 60-second sprint doesn\'t test. Most typists see a WPM drop of 5–15% on a 5-minute test compared to their 1-minute score. Elite typists typically drop under 5%, because their muscle memory is so deep that individual words cost almost no conscious effort.',
  },
  {
    q: 'What WPM is good on a 5-minute test?',
    a: '50–60 WPM is solid for most professional roles. Transcription and legal secretary positions often require 65–80 WPM sustained. Data-entry positions may specify 5-minute test minimums of 60–70 WPM with 98% accuracy. Court reporting certification typically requires 80–95 WPM over 5 minutes with very high accuracy.',
  },
  {
    q: 'What is my WPM endurance ratio?',
    a: 'Your WPM endurance ratio is your 5-minute WPM divided by your 1-minute WPM, expressed as a percentage. A ratio above 90% means excellent endurance — your speed holds up under sustained effort. Below 80% means significant fatigue degradation and signals that building stamina through longer practice sessions would help.',
  },
  {
    q: 'How can I improve my 5-minute typing speed?',
    a: 'Practice at the pace you want to sustain, not at your sprint pace. If you want to sustain 70 WPM, regularly practice at 65–70 WPM rather than always pushing maximum speed. Also build accuracy: errors over five minutes accumulate quickly and tank your net WPM. Use TypeFlow\'s 5-minute test daily and track your average WPM over the full test.',
  },
  {
    q: 'Can I use this 5-minute test for job applications?',
    a: 'TypeFlow\'s 5-minute test uses the standard net WPM formula (correct characters ÷ 5 ÷ minutes) that most employers mean when they ask for your typing speed. It\'s a reliable gauge, but always confirm whether a specific employer uses gross or net WPM and what their exact accuracy requirements are.',
  },
];

export default function FiveMinuteTestPage() {
  useSEO({
    title: '5 Minute Typing Test — Sustained WPM & Accuracy | TypeFlow',
    description:
      'Free 5-minute typing test — measure your sustained WPM and accuracy under endurance conditions. The benchmark used by employers and transcription agencies. No signup, instant results.',
    keywords:
      '5 minute typing test, five minute typing test, 5 min typing test, endurance typing test, sustained wpm, typing speed test 5 minutes, typing test for employment, transcription typing test',
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
          'Free 5-minute typing endurance test. Measures sustained words per minute (WPM) and accuracy with live feedback. Shows WPM endurance ratio vs 1-minute score.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 5-minute endurance mode',
          'Live WPM and accuracy tracking',
          'Switch word sources (common words, quotes, code)',
          'WPM percentile ranking on completion',
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
    wpm: 0, accuracy: 100, errors: 0,
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
          Free, no signup, instant results with global percentile ranking.
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

      {/* Unique: WPM Endurance Ratio — concept no competitor covers */}
      <section className="mb-16 p-6 sm:p-8 bg-card border border-border rounded-3xl">
        <h2 className="text-xl font-extrabold tracking-tight mb-2">Your WPM endurance ratio</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Most typists think only about their peak WPM. But the gap between your 1-minute score and your
          5-minute score reveals just as much. We call this the <strong>WPM endurance ratio</strong>.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Endurance ratio</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">5-min vs 1-min WPM</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { ratio: '95%+', range: '57+ WPM on 5-min if 60 on 1-min', label: 'Elite endurance', desc: 'Muscle memory is so deep that fatigue barely registers. Competitive typists and seasoned professionals.' },
                { ratio: '88–94%', range: '53–56 WPM on 5-min if 60 on 1-min', label: 'Solid endurance', desc: 'Normal for experienced touch typists. Speed holds up throughout the full test.' },
                { ratio: '80–87%', range: '48–52 WPM on 5-min if 60 on 1-min', label: 'Average endurance', desc: 'Typical for most typists. Some drop-off from finger fatigue and concentration lapses.' },
                { ratio: 'Below 80%', range: 'Under 48 WPM on 5-min if 60 on 1-min', label: 'Endurance gap', desc: 'Significant fatigue degradation. Build stamina with daily longer-duration practice sessions.' },
              ].map(({ ratio, range, label, desc }) => (
                <tr key={ratio} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold">{ratio}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{range}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          To find your ratio: divide your 5-minute WPM by your 1-minute WPM and multiply by 100.
          Take both tests on TypeFlow for a fair comparison using the same word source.
        </p>
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-4">
        <h2>Why the 5-Minute Test Is the Employer Standard</h2>
        <p>
          A 1-minute typing test is a sprint; a 5-minute test is a marathon. Many professional environments
          — transcription agencies, law firms, government offices, and data-entry departments — specifically
          require a 5-minute typing test because it reveals something a 60-second sprint cannot: whether your
          speed holds up under real working conditions.
        </p>
        <p>
          Finger fatigue, concentration lapses, and mental endurance all become measurable factors over five
          minutes. A typist who clocks 80 WPM in one minute but drops to 55 WPM by minute five will not
          perform the same as one who sustains 70 WPM consistently. Employers hiring for high-volume typing
          roles know this distinction well.
        </p>

        <h2>Who Needs a 5-Minute Typing Test?</h2>
        <ul>
          <li><strong>Transcriptionists:</strong> Converting audio to text requires consistent, sustained typing speed. Most agencies require 65–80 WPM on a 5-minute test with 97%+ accuracy.</li>
          <li><strong>Legal secretaries and paralegals:</strong> Dictation and brief transcription demand both speed and accuracy over long sessions — the 5-minute format mirrors real working conditions directly.</li>
          <li><strong>Data-entry clerks:</strong> High-volume data entry requires reliable, repeatable speed — not just peak performance. Most roles require 60–70 WPM sustained with 98% accuracy.</li>
          <li><strong>Court reporters (digital):</strong> Real-time transcription under pressure. 5-minute tests are a standard part of certification for digital court reporters.</li>
          <li><strong>Executive assistants:</strong> Correspondence, meeting notes, and document preparation require sustained typing throughout the entire workday.</li>
          <li><strong>Medical transcriptionists:</strong> Medical terminology and zero error tolerance mean sustained speed and rock-solid accuracy are both required — 65–80 WPM on a 5-minute test.</li>
        </ul>

        <h2>How to Improve Your 5-Minute Typing Speed</h2>

        <h3>Train at your target pace, not your sprint pace</h3>
        <p>
          If you want to sustain 70 WPM over five minutes, practice regularly at 65–70 WPM. Practicing above
          your endurance pace builds short-burst speed but not stamina. Use TypeFlow's live WPM counter to
          keep your pace in range — if minute one puts you over target, ease back intentionally.
        </p>

        <h3>Watch your accuracy throughout, not just at the end</h3>
        <p>
          Errors over five minutes accumulate fast. A 95% accuracy rate over five minutes is significantly
          harder to maintain than over one minute. Build the habit of slowing down when you start making
          mistakes rather than pushing through errors — a corrected mistake costs less than an uncorrected one
          in your net WPM score.
        </p>

        <h3>Build endurance with structured lessons</h3>
        <p>
          Use TypeFlow's <Link href="/learn-typing">touch-typing course</Link> to drill weak keys and
          patterns. Once you've covered the full keyboard, come back to the 5-minute test and track your
          improvement. Lesson-based drilling is much more efficient than random practice for fixing specific
          key combinations that slow you down.
        </p>

        <h2>Try Other Durations</h2>
        <p>
          Build up to 5 minutes progressively: start with the{' '}
          <Link href="/1-minute-typing-test">1-minute test</Link> to find your speed ceiling, then use the{' '}
          <Link href="/3-minute-typing-test">3-minute test</Link> as your daily practice benchmark. For
          serious professional certification, try the{' '}
          <Link href="/10-minute-typing-test">10-minute test</Link> — the standard used by civil service
          boards and transcription agencies. Elite typists and court reporter trainees use the{' '}
          <Link href="/20-minute-typing-test">20-minute test</Link> to verify maximum long-session endurance.
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
