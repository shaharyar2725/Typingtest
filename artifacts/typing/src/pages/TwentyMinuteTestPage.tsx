import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Flame, Brain, BarChart2 } from 'lucide-react';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/20-minute-typing-test`;

const FAQS = [
  {
    q: 'What is a 20-minute typing test?',
    a: 'A 20-minute typing test is an extended endurance assessment that measures your typing speed and accuracy under maximum sustained load. It is used by elite court reporter training programs, advanced stenography certifications, specialized legal transcription roles, and typists who want to stress-test their true long-session performance. Very few typing platforms offer this duration.',
  },
  {
    q: 'Who needs a 20-minute typing test?',
    a: 'Court reporter trainees (digital and stenographic), advanced legal transcriptionists, professional captioners, and competitive typists use 20-minute tests. Any role that involves non-stop extended typing — such as live captioning events or marathon document transcription — benefits from testing at this duration. Most general office roles do not require 20-minute tests.',
  },
  {
    q: 'What is a good WPM on a 20-minute test?',
    a: 'Maintaining 50+ WPM over 20 minutes is a solid result for general typists. 60–70 WPM sustained is excellent and reflects deep muscle memory. 80+ WPM over 20 minutes is elite — this level is typically seen only in professional transcriptionists and competitive typists who have trained specifically for endurance. Expect a 15–25% WPM drop from your 1-minute peak at this duration.',
  },
  {
    q: 'Why is a 20-minute test so much harder than shorter tests?',
    a: 'By minute 15–20, mental fatigue compounds on finger fatigue in ways that shorter tests cannot replicate. Concentration lapses become frequent, and the errors you make tend to cluster around patterns your brain has been suppressing — weak key combinations that work fine for 5 minutes but break down under sustained load. The 20-minute test is a direct measure of your typing\'s structural soundness under real working conditions.',
  },
  {
    q: 'How should I prepare for a 20-minute typing test?',
    a: 'Build up duration progressively: master 5 minutes first (consistent 97%+ accuracy at your target WPM), then 10 minutes, then 20. Practice at 80–85% of your 1-minute peak to build the specific endurance adaptations needed. Posture and wrist position become critical at this duration — poor ergonomics that feel fine at 5 minutes cause measurable performance degradation at 15–20 minutes.',
  },
  {
    q: 'Is this 20-minute typing test free?',
    a: 'Yes — completely free, no account required, instant results with WPM, accuracy, and global percentile ranking. Retake as many times as you want.',
  },
];

export default function TwentyMinuteTestPage() {
  useSEO({
    title: '20 Minute Typing Test — Elite Endurance WPM | TypeFlow',
    description:
      'Free 20-minute typing test — the ultimate endurance challenge for serious typists, court reporter trainees, and professional transcriptionists. Measure your sustained WPM and accuracy. No signup.',
    keywords:
      '20 minute typing test, twenty minute typing test, 20 min typing test, advanced typing test, court reporter typing test, transcription typing test, elite typing test, long typing test, endurance typing',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow 20 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 20-minute advanced typing endurance test. Measures sustained WPM and accuracy under maximum load with global percentile ranking. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 20-minute advanced endurance mode',
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
          { '@type': 'ListItem', position: 2, name: '20 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 1200,
  }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({
    wpm: 0, accuracy: 100, errors: 0,
  });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const saved = updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 1200 }));
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
          20 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          The ultimate endurance challenge. For court reporter trainees, professional transcriptionists,
          and serious typists who want to know their true long-session baseline. Free, no signup.
        </p>
      </header>

      <section aria-label="20 minute typing test" className="mb-16">
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
                durationSec={1200}
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

      {/* Unique angle: marathon stress-test framing */}
      <section className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Flame,
            color: 'text-orange-500',
            title: 'The marathon test',
            sub: 'For serious typists only',
            desc: 'At 20 minutes, every weakness in your typing becomes measurable. Shallow muscle memory, poor posture, weak key combinations — all of it surfaces. This is the stress-test that reveals your real structural skill level.',
          },
          {
            icon: Brain,
            color: 'text-primary',
            title: 'Mental endurance',
            sub: 'Concentration under load',
            desc: 'By minute 12–15, mental fatigue compounds on physical fatigue. The typists who score well at 20 minutes have trained concentration as deliberately as they\'ve trained speed — both matter equally here.',
          },
          {
            icon: BarChart2,
            color: 'text-emerald-500',
            title: 'Court reporter standard',
            sub: 'Training benchmark format',
            desc: 'Court reporter training programs use extended duration tests — often 20–30 minutes — because live proceedings run continuously. If you\'re training for court reporting, 20-minute practice tests are a core part of the curriculum.',
          },
        ].map(({ icon: Icon, color, title, sub, desc }) => (
          <div key={title} className="bg-card border border-border rounded-2xl p-5">
            <Icon className={`w-5 h-5 mb-3 ${color}`} />
            <div className={`text-xl font-extrabold mb-0.5 ${color}`}>{title}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{sub}</div>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* Ergonomics section — unique angle for 20-min page */}
      <section className="mb-16 p-6 sm:p-8 bg-card border border-border rounded-3xl">
        <h2 className="text-xl font-extrabold tracking-tight mb-2">Ergonomics matter most at 20 minutes</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Poor posture and wrist position are performance issues, not just comfort issues. Over 20 minutes,
          ergonomic mistakes compound into measurable WPM degradation. Here's what to check before you start.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'Wrist position',
              bad: 'Resting flat on desk — compresses carpal tunnel, causes fatigue by minute 8–10',
              good: 'Hovering slightly above keyboard level — keeps tendons relaxed throughout the session',
            },
            {
              title: 'Elbow angle',
              bad: 'Below 90° (arms angled down) — strains forearms and slows finger recovery between keystrokes',
              good: '90–100° angle — keyboard slightly below elbow level, reduces fatigue onset significantly',
            },
            {
              title: 'Back posture',
              bad: 'Slouching forward — shifts weight to neck and shoulders, causes progressive upper-body fatigue',
              good: 'Upright with lumbar support — distributes load properly, sustains focus longer',
            },
            {
              title: 'Screen distance',
              bad: 'Too close or too far — causes eye strain that increases mental fatigue in later minutes',
              good: 'Arms-length (50–70 cm) — reduces eye fatigue, keeps reading rhythm smooth',
            },
          ].map(({ title, bad, good }) => (
            <div key={title} className="rounded-2xl border border-border p-4">
              <div className="font-bold text-sm mb-3">{title}</div>
              <div className="space-y-2">
                <div className="flex gap-2 text-xs">
                  <span className="text-destructive font-bold shrink-0">✗</span>
                  <span className="text-muted-foreground">{bad}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span className="text-foreground">{good}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert">
        <h2>What the 20-Minute Test Actually Measures</h2>
        <p>
          At 20 minutes, typing becomes a different skill from what you're testing in a 1-minute sprint.
          The variables that matter most shift dramatically: instead of raw finger speed, what separates
          good performers from great ones is <strong>structural soundness</strong> — the depth of muscle
          memory built for every single key combination, not just the common ones. And beyond that, mental
          endurance: the ability to maintain focus and concentration when your brain is screaming at you to
          stop watching the screen and look at something else.
        </p>
        <p>
          This is exactly why court reporter training programs rely on extended test formats. A court
          proceeding doesn't last 5 minutes — it can run for hours. Trainees need to demonstrate that their
          skills hold under the sustained cognitive load of real proceedings, where every missed word has
          legal consequences.
        </p>

        <h2>The Four Phases of a 20-Minute Session</h2>

        <h3>Minutes 0–3: Warmup</h3>
        <p>
          Your fingers settle into position, rhythm builds naturally. Don't start at sprint pace — begin
          10 WPM below your target and let speed build. The biggest mistake in long-format tests is going
          too fast in the opening minutes and paying for it in the final stretch.
        </p>

        <h3>Minutes 3–10: Optimal window</h3>
        <p>
          Peak performance phase. Fingers are warmed up, concentration is sharp, rhythm is established.
          Most of your best WPM readings will come from this window. Maintain a consistent, slightly
          conservative pace here — you're saving something for the end.
        </p>

        <h3>Minutes 10–16: Fatigue onset</h3>
        <p>
          Mental concentration begins to waver. This is where weak key combinations — the ones you
          haven't fully automated — start appearing as errors. Finger fatigue makes transitions between
          rows slightly slower. Your job here is to trust your muscle memory and resist the urge to look
          at your hands. Don't compensate by slowing down dramatically; that breaks your rhythm more
          than it helps.
        </p>

        <h3>Minutes 16–20: Endurance finish</h3>
        <p>
          Only deeply-ingrained muscle memory survives intact here. Typists who haven't built genuine
          automation — who still rely on partial conscious direction for some keys — see significant WPM
          and accuracy drops in this window. If your score holds within 10% of your 10-minute number,
          your endurance is excellent.
        </p>

        <h2>Recommended Training Progression</h2>
        <ul>
          <li>Start with the <Link href="/learn-typing">touch-typing course</Link> if you haven't covered all keys with proper ten-finger technique</li>
          <li>Daily <Link href="/1-minute-typing-test">1-minute tests</Link> to establish and raise your WPM ceiling</li>
          <li>Weekly <Link href="/3-minute-typing-test">3-minute tests</Link> to build daily practice endurance</li>
          <li>Weekly <Link href="/5-minute-typing-test">5-minute tests</Link> to approach professional standards</li>
          <li>Monthly <Link href="/10-minute-typing-test">10-minute tests</Link> to build sustained endurance</li>
          <li>Monthly 20-minute sessions to benchmark your true long-form performance</li>
        </ul>

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
