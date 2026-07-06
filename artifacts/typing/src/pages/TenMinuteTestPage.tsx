import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://taketypingtest.com';
const PAGE_URL = `${SITE_ORIGIN}/10-minute-typing-test`;

const FAQS = [
  {
    q: 'What is a 10-minute typing test?',
    a: 'A 10-minute typing test measures your sustained typing speed and accuracy over a full 10 minutes. It\'s used by professional transcription agencies, legal and medical offices, and government bodies that need to verify a typist can maintain reliable performance across an extended session, not just a quick sprint. It\'s one of the most demanding standard typing test formats.',
  },
  {
    q: 'Who uses 10-minute typing tests?',
    a: 'Professional transcription agencies, federal and state government civil service boards, some legal certification programs, and advanced data-entry employers use 10-minute tests. Any role that involves sustained high-volume typing, where performance over hours, not minutes, matters, benefits from a 10-minute assessment.',
  },
  {
    q: 'What WPM is considered good on a 10-minute test?',
    a: 'Maintaining 55+ WPM over 10 minutes is solid for most professional roles. 65–70 WPM sustained is excellent and qualifies for virtually all data-entry, transcription, and legal support positions. 80+ WPM over 10 minutes is elite, roughly the top 5% of typists. Note that most people score 10–20% lower on a 10-minute test than on their 1-minute peak.',
  },
  {
    q: 'What is a good accuracy for a 10-minute typing test?',
    a: 'For professional roles, 97%+ accuracy is the standard target on a 10-minute test. Medical transcription typically requires 98–99% accuracy. Data entry often specifies 98% or higher. Accuracy below 95% over 10 minutes usually indicates that your speed is outpacing your current muscle memory.',
  },
  {
    q: 'How much slower is a 10-minute test than a 1-minute test?',
    a: 'Most typists score 10–20% lower on a 10-minute test compared to their 1-minute peak. An endurance drop of less than 10% indicates strong muscle memory. A drop of 20%+ suggests that sustained practice at moderate pace, not sprint practice, is the most effective training approach.',
  },
  {
    q: 'How should I train for a 10-minute typing test?',
    a: 'Start with daily 5-minute tests until you can sustain your target WPM consistently. Then extend to 10-minute sessions at 85–90% of your 1-minute peak speed. Accuracy is especially critical over 10 minutes. Every error clusters at different points in the session, so monitor where your accuracy starts dropping and build drills targeting those patterns.',
  },
  {
    q: 'Is this 10-minute typing test free?',
    a: 'Yes. It\'s completely free, no account required, and results are instant. Retake as many times as you need.',
  },
];

export default function TenMinuteTestPage() {
  useSEO({
    title: '10 Minute Typing Test — Professional Endurance WPM | TakeTypingTest',
    description:
      'Free 10-minute typing test, the professional endurance standard used by transcription agencies and civil service boards. Measure your sustained WPM, accuracy, and global percentile. No signup.',
    keywords:
      '10 minute typing test, ten minute typing test, 10 min typing test, professional typing test, transcription typing test, civil service typing test, endurance typing test 10 minutes, wpm test 10 minutes',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TakeTypingTest 10 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 10-minute typing endurance test for professionals. Measures sustained WPM and accuracy with live feedback and global percentile ranking. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 10-minute professional endurance mode',
          'Live WPM and accuracy tracking',
          'Global WPM percentile ranking on completion',
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
          { '@type': 'ListItem', position: 2, name: '10 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 600,
  }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({
    wpm: 0, accuracy: 100, errors: 0,
  });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const saved = updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 600 }));
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
          10 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          The professional endurance standard. Used by transcription agencies, civil service boards,
          and legal offices. Free, no signup, instant WPM and accuracy results.
        </p>
      </header>

      <section aria-label="10 minute typing test" className="mb-16">
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
                durationSec={600}
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

      {/* Unique angle: professional certification context */}
      <section className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6 py-8 border-y border-border">
        {[
          {
            title: 'Civil service standard',
            desc: 'Many government typing certification boards use 10-minute tests as the definitive format. It\'s long enough to rule out lucky sessions and short bursts masquerading as sustained ability.',
          },
          {
            title: 'Endurance revealed',
            desc: 'In minute 7–10, concentration lapses and finger fatigue compound in ways that 5-minute tests don\'t capture. Your score here is your true professional baseline.',
          },
          {
            title: 'Transcription benchmark',
            desc: 'Professional transcription agencies typically require 65–80 WPM over 10 minutes with 97%+ accuracy. Consistent performance here signals readiness for high-volume production work.',
          },
        ].map(({ title, desc }) => (
          <div key={title}>
            <h3 className="text-base font-bold mb-1.5">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* Accuracy degradation chart: data section */}
      <section className="mb-16">
        <h2 className="text-xl font-extrabold tracking-tight mb-2">How WPM and accuracy degrade over 10 minutes</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Most typists don't experience a linear decline. Instead, performance falls in two distinct phases.
          Understanding this pattern helps you train more effectively.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Phase</th>
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Minutes</th>
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">What happens</th>
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Training fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {[
                {
                  phase: 'Warmup', minutes: '0–2 min', what: 'Speed ramps up as fingers settle into rhythm. Accuracy is highest here, and focus is sharp.',
                  fix: 'Don\'t sprint. Start 5–10 WPM below your target and let pace build naturally.',
                },
                {
                  phase: 'Peak zone', minutes: '2–6 min', what: 'Optimal performance window. WPM is near maximum, accuracy still high. This is the window employers are testing.',
                  fix: 'Use 3-minute daily tests to build consistency specifically in this zone.',
                },
                {
                  phase: 'Fatigue onset', minutes: '6–8 min', what: 'Mental fatigue and finger tiredness begin. Accuracy errors increase, often clustering around the same weak keys.',
                  fix: 'Drill your error-heavy key combinations in TakeTypingTest\'s lesson course to make them automatic before fatigue hits.',
                },
                {
                  phase: 'Endurance test', minutes: '8–10 min', what: 'Only deeply-ingrained muscle memory holds up. Typists with shallow skill show significant WPM drop here.',
                  fix: 'Train at 85–90% of your 1-minute peak regularly. Consistent moderate-pace practice builds this zone faster than sprinting.',
                },
              ].map(({ phase, minutes, what, fix }) => (
                <tr key={phase} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-bold">{phase}</td>
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground whitespace-nowrap">{minutes}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{what}</td>
                  <td className="px-4 py-3 text-sm text-primary/80">{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert">
        <h2>Why the 10-Minute Format Separates Skill from Luck</h2>
        <p>
          Any typist can have a great 60-second run. Fatigue, concentration lapses, and accuracy drift
          don't become measurable until at least 5 minutes, and they become fully revealing at 10. A
          10-minute typing test is where genuine professional skill separates itself from learned test-taking
          tricks, burst speed, and lucky runs.
        </p>
        <p>
          Civil service typing certification boards, from local government agencies to federal departments,
          have adopted the 10-minute format specifically because it matches the reality of office work.
          Processing documents, entering data, and transcribing meetings all require sustained performance
          over extended periods, not peak performance in controlled 60-second windows.
        </p>

        <h2>Professional WPM Standards for 10-Minute Tests</h2>
        <ul>
          <li><strong>General administrative (entry-level):</strong> 40–50 WPM with 95%+ accuracy</li>
          <li><strong>Government / civil service:</strong> 45–55 WPM, varies by jurisdiction and role</li>
          <li><strong>Insurance and claims processing:</strong> 55–65 WPM with 97%+ accuracy</li>
          <li><strong>General transcription:</strong> 65–75 WPM with 97%+ accuracy</li>
          <li><strong>Medical transcription:</strong> 65–80 WPM with 98–99% accuracy</li>
          <li><strong>Legal support / paralegal:</strong> 70–80 WPM with 98%+ accuracy</li>
          <li><strong>Advanced data entry:</strong> 70–80 WPM with 98% accuracy, production-rate roles</li>
        </ul>

        <h2>Building Toward 10-Minute Endurance</h2>

        <h3>Step 1: Master 3 minutes first</h3>
        <p>
          If you can't sustain your target WPM for 3 minutes with 97%+ accuracy, the jump to 10 minutes
          will be punishing. Use the <Link href="/3-minute-typing-test">3-minute test</Link> daily until you
          can hit your target WPM consistently across 5 runs. Only then extend to 5 and then 10 minutes.
        </p>

        <h3>Step 2: Practice at 85% of your peak, not at 100%</h3>
        <p>
          The biggest mistake advanced typists make is always practicing at their sprint pace. To build
          10-minute endurance, practice regularly at 85–90% of your 1-minute peak WPM. This trains the
          specific muscle-memory patterns that hold up when fatigue sets in at the 7–8 minute mark.
        </p>

        <h3>Step 3: Fix accuracy before extending duration</h3>
        <p>
          Over 10 minutes, a 96% accuracy rate generates roughly 3× the number of errors of a 1-minute test
          at the same rate, and uncorrected errors are penalized against your net WPM. Use strict mode in
          TakeTypingTest to force error correction, and drill your weak keys in the{' '}
          <Link href="/learn-typing">touch-typing course</Link> before adding duration.
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
