import { useState, useMemo } from 'react';
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
import { Trophy, LogIn, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const COMPETITION_DURATION = 60; // seconds — fixed for everyone

// A locked settings object for the competition. We don't persist this to storage —
// we just use it to drive the TypingTest + TypingHeader UI.
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
    title: "Typing Competition — Race the Global Leaderboard | TypeFlow",
    description:
      "Take the official 60-second TypeFlow typing competition. Same time, same rules for every signed-up typist. Submit your WPM and climb the global leaderboard.",
    keywords:
      "typing competition, typing leaderboard, wpm leaderboard, fastest typist, online typing race, competitive typing test",
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

  // Locked mode change handler — explicitly does nothing.
  const noop = () => {};

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          Official Competition
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">60-Second Typing Race</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Same fixed time, same rules for everyone. Sign in, give it your best run, and your WPM goes straight to the global leaderboard.
        </p>
      </div>

      {/* Sign-in gate banner */}
      {!user && (
        <div className="mb-6 max-w-3xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1 text-sm text-amber-900 dark:text-amber-100">
            <span className="font-semibold">Sign in to submit your score.</span> You can still take the test, but only signed-in runs make the leaderboard.
          </div>
          <Button size="sm" className="rounded-xl shrink-0" onClick={() => setAuthOpen(true)}>
            <LogIn className="w-3.5 h-3.5 mr-1.5" />
            Sign in
          </Button>
        </div>
      )}

      {/* Test */}
      <section className="mb-12">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={noop}
              onRestart={handleRestart}
              onOpenSettings={noop}
              onOpenAuth={() => setAuthOpen(true)}
              timeLeft={stats.timeLeft}
              isRunning={isRunning}
              lockSettings
              lockedLabel={`${COMPETITION_DURATION}s · Competition`}
            />

            <div className="flex gap-10 justify-center mt-8 mb-6 text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">
              <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold tabular-nums">{stats.wpm}</span>wpm</div>
              <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold tabular-nums">{stats.accuracy}%</span>acc</div>
              <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold tabular-nums">{stats.errors}</span>err</div>
            </div>

            <div className="min-h-[180px] flex items-center justify-center mt-4">
              <TypingTest
                key={restartKey}
                mode={settings.mode}
                durationSec={settings.duration}
                wordCount={settings.wordCount}
                funMode={settings.funMode}
                stopOnError={settings.stopOnError}
                soundEnabled={settings.soundEnabled}
                fontSize={settings.fontSize}
                onComplete={handleComplete}
                onStatsUpdate={setStats}
                saveToHistory={false}
              />
            </div>
          </div>
        ) : (
          <div>
            {/* Submission status */}
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
      <section className="mb-12">
        <Leaderboard refreshKey={leaderboardKey} />
      </section>

      {/* Rules */}
      <section className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Competition rules
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Fixed <span className="font-semibold text-foreground">{COMPETITION_DURATION}-second</span> time mode for every entry.</li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Common-words word source — same pool of words for everyone.</li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Strict mode is off so you can correct mistakes, but errors lower your net WPM.</li>
          <li className="flex gap-2"><span className="text-primary font-bold">•</span> Only signed-in runs are submitted. The leaderboard ranks by best WPM.</li>
        </ul>
      </section>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
