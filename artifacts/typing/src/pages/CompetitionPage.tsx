import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { Leaderboard } from '@/components/typing/Leaderboard';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Button } from '@/components/ui/button';
import { loadState, AppState, TypingResult } from '@/lib/storage';
import { submitScore } from '@/lib/auth-api';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { LogIn, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const COMPETITION_DURATION = 60; // seconds — fixed for everyone
const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/competition`;

const FAQS = [
  {
    q: 'What is a typing test?',
    a: 'A typing test measures how fast and accurately you can type. The standard score is words per minute (WPM), where one "word" equals five characters. The TypeFlow typing test is a fixed 60-second run with the same word pool for every player so the global leaderboard stays fair.',
  },
  {
    q: 'What is a good WPM on a typing test?',
    a: 'The average adult types about 40 WPM. 60 WPM is above average, 80+ WPM is professional-level, and anything above 100 WPM is considered fast. Competitive typists routinely break 120 WPM.',
  },
  {
    q: 'How is WPM calculated?',
    a: 'TypeFlow uses net WPM: total correctly typed characters divided by 5, divided by the test duration in minutes, with uncorrected errors penalized. This is the same formula used by professional typing benchmarks.',
  },
  {
    q: 'Is the typing test free?',
    a: 'Yes — the 60-second TypeFlow typing test is 100% free, browser-based and works on any device. You only need a free account if you want to submit your score to the global leaderboard.',
  },
  {
    q: 'How does the TypeFlow leaderboard work?',
    a: 'Every signed-in run on the Competition page is submitted automatically. The leaderboard ranks the top 20 typists by best WPM. Your best score stays on the board until someone beats it or you do better.',
  },
];

function buildCompSettings(base: AppState['settings']): AppState['settings'] {
  return {
    ...base,
    mode: 'time',
    duration: COMPETITION_DURATION,
    funMode: 'words',
    stopOnError: false,
  };
}

export default function CompetitionPage() {
  useSEO({
    title: 'Free Typing Test — Live Leaderboard & WPM Score | TypeFlow',
    description:
      'Take the official 60-second TypeFlow typing test. See your live WPM, accuracy and error count, then submit your score to the global typing test leaderboard. Free, no install.',
    keywords:
      'typing test, free typing test, online typing test, wpm test, words per minute test, 60 second typing test, typing leaderboard, typing competition',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 60-second online typing test with live WPM, accuracy and a global leaderboard.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Fixed 60-second time mode for fair comparison',
          'Live WPM, accuracy and error tracking',
          'Global leaderboard ranked by best WPM',
          'Same word pool for every player',
          'Free signup to submit scores',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: 'Typing Test', item: PAGE_URL },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  });

  const { user } = useAuth();
  const baseSettings = useMemo(() => loadState().settings, []);
  const settings = useMemo(() => buildCompSettings(baseSettings), [baseSettings]);

  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({ wpm: 0, accuracy: 100, errors: 0 });
  const [restartKey, setRestartKey] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  const handleComplete = async (res: TypingResult) => {
    setResult(res);
    if (!user) {
      setSubmitState('idle');
      return;
    }
    setSubmitState('submitting');
    const ok = await submitScore({
      wpm: res.wpm,
      accuracy: res.accuracy,
      errors: res.errors,
      mode: res.mode,
      durationSec: res.durationSec,
    });
    if (ok) {
      setSubmitState('success');
      setLeaderboardKey(k => k + 1);
    } else {
      setSubmitState('error');
    }
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setSubmitState('idle');
    setRestartKey(k => k + 1);
  };

  const isRunning = stats.timeLeft !== undefined && stats.timeLeft > 0 && !result;

  const noop = () => {};

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">
      {/* Page header — H1 leads with primary keyword "typing test" */}
      <header className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          Free Typing Test — 60 Seconds
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm leading-snug">
          Take the official 60-second TypeFlow typing test. See your WPM and accuracy in real time,
          then sign in to submit your score to the global leaderboard.
        </p>
      </header>

      {/* Sign-in gate banner */}
      {!user && (
        <div className="mb-6 max-w-3xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
            <span className="font-semibold">Sign in to submit your score.</span> You can still take the typing test, but only signed-in runs make the leaderboard.
          </div>
          <Button size="sm" className="rounded-xl shrink-0" onClick={() => setAuthOpen(true)}>
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Sign in
          </Button>
        </div>
      )}

      {/* Typing test */}
      <section aria-label="Typing test" className="mb-12">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={noop}
              onRestart={handleRestart}
              onOpenAuth={() => setAuthOpen(true)}
              timeLeft={stats.timeLeft}
              isRunning={isRunning}
              lockSettings
              lockedLabel={`${COMPETITION_DURATION}s · Competition`}
            />

            <div className="min-h-[180px] flex items-center justify-center mt-10">
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
                onComplete={handleComplete}
                onStatsUpdate={setStats}
                saveToHistory={false}
              />
            </div>
          </div>
        ) : (
          <div>
            {user && submitState === 'success' && (
              <div className="max-w-3xl mx-auto mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Score submitted to the leaderboard.
              </div>
            )}
            {user && submitState === 'submitting' && (
              <div className="max-w-3xl mx-auto mb-4 text-center text-sm text-muted-foreground">
                Submitting your score…
              </div>
            )}
            {user && submitState === 'error' && (
              <div className="max-w-3xl mx-auto mb-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold">
                <AlertCircle className="w-4 h-4" />
                Couldn't submit your score. Try again.
              </div>
            )}
            {!user && (
              <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40">
                <div className="text-sm text-amber-900 dark:text-amber-100 font-semibold">
                  Sign in next time to put your score on the board.
                </div>
                <Button size="sm" className="rounded-xl" onClick={() => setAuthOpen(true)}>
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  Sign in
                </Button>
              </div>
            )}
            <ResultCard result={result} onRestart={handleRestart} />
          </div>
        )}
      </section>

      {/* Leaderboard */}
      <section aria-label="Global typing test leaderboard" className="mb-12">
        <Leaderboard refreshKey={leaderboardKey} />
      </section>

      {/* Rules */}
      <section className="bg-card border border-border rounded-2xl p-6 mb-12">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Typing test rules
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Fixed <span className="font-semibold text-foreground">{COMPETITION_DURATION}-second</span> time mode for every entry.</li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Common-words word source — same pool of words for everyone.</li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Strict mode is off so you can correct mistakes, but errors lower your net WPM.</li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Only signed-in runs are submitted. The leaderboard ranks by best WPM.</li>
        </ul>
      </section>

      {/* Long-form SEO content for "typing test" intent */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">About the TypeFlow typing test</h2>
        <article className="prose dark:prose-invert prose-headings:font-bold prose-h3:text-xl prose-h3:mt-8">
          <p>
            The TypeFlow typing test is a free, browser-based way to measure your typing speed and accuracy in 60 seconds.
            Whether you&apos;re benchmarking yourself, prepping for a job assessment, or just chasing a higher WPM, this is
            the same test, with the same rules, for everyone on the leaderboard.
          </p>

          <h3>What WPM means</h3>
          <p>
            Words per minute is the standard measure of typing speed. To stay fair across different texts and languages,
            a "word" is defined as exactly five characters (including spaces). Net WPM — the score we use — subtracts
            uncorrected errors so you can&apos;t inflate your number with sloppy typing.
          </p>

          <h3>Average WPM benchmarks</h3>
          <ul>
            <li><strong>Average typist:</strong> 40 WPM</li>
            <li><strong>Above average:</strong> 60 WPM</li>
            <li><strong>Productive professional:</strong> 70–80 WPM</li>
            <li><strong>Fast typist:</strong> 90–100 WPM</li>
            <li><strong>Competitive typist:</strong> 120+ WPM</li>
          </ul>

          <h3>How to prepare</h3>
          <p>
            The fastest way to climb the leaderboard isn&apos;t cramming on the typing test itself — it&apos;s consistent{' '}
            <Link href="/" className="text-primary font-semibold">typing practice</Link>{' '}
            in the modes that match your weak spots. Drill common words and quotes daily, focus on accuracy first, and
            come back to the typing test when you&apos;re consistently beating your personal best.
          </p>
        </article>
      </section>

      {/* FAQ — visible content + JSON-LD twin */}
      <section className="max-w-3xl mx-auto mt-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">Typing test FAQ</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group bg-card border border-border rounded-2xl px-5 py-4 hover:border-foreground/30 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-base">
                <span>{f.q}</span>
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
