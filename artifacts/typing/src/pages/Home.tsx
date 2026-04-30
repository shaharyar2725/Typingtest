import { useMemo, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { SettingsSheet } from '@/components/typing/SettingsSheet';
import { ResultCard } from '@/components/typing/ResultCard';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { SectionHeader } from '@/components/SectionHeader';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Play, CheckCircle2, Zap, Target, ArrowRight, Trophy, Sliders, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LESSONS } from '@/lib/lessons';

export default function Home() {
  useSEO({
    title: "Free Typing Test — Check Your WPM & Accuracy | TypeFlow",
    description:
      "Take the free TypeFlow typing test to measure your words per minute (WPM), accuracy and error count. Tweak the time, word count or quote mode and beat your personal best.",
    keywords:
      "typing test, wpm test, words per minute, free typing test, typing speed test, accuracy test, online typing practice",
  });

  const initial = loadState();
  const [settings, setSettings] = useState<AppState['settings']>(initial.settings);
  const [history, setHistory] = useState<TypingResult[]>(initial.history);
  const [progress] = useState(initial.lessonProgress);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({ wpm: 0, accuracy: 100, errors: 0 });
  const [restartKey, setRestartKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    setSettings(updateSettings(newSettings));
    if (
      'fontSize' in newSettings ||
      'funMode' in newSettings ||
      'mode' in newSettings ||
      'duration' in newSettings ||
      'wordCount' in newSettings
    ) {
      setResult(null);
      setStats({ wpm: 0, accuracy: 100, errors: 0 });
      setRestartKey(k => k + 1);
    }
  };

  // Personal best — purely local, never submitted anywhere.
  const handleComplete = (res: TypingResult) => {
    setResult(res);
    setHistory(loadState().history);
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey(k => k + 1);
  };

  const isRunning = stats.timeLeft !== undefined && stats.timeLeft > 0 && !result;

  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;
  const bestWpm = useMemo(() => Math.max(...history.map(h => h.wpm), 0), [history]);
  const bestAcc = useMemo(() => Math.max(...history.map(h => h.accuracy), 0), [history]);
  const totalRuns = history.length;
  const isNewPersonalBest = result !== null && result.wpm > 0 && result.wpm >= bestWpm;

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">

      {/* Personal best banner */}
      {totalRuns > 0 && (
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-sm font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Your personal best: <span className="tabular-nums font-extrabold">{bestWpm}</span> WPM · {bestAcc}% acc</span>
          </div>
        </div>
      )}

      {/* Hero typing test */}
      <section className="mb-16">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenAuth={() => setAuthOpen(true)}
              timeLeft={stats.timeLeft}
              isRunning={isRunning}
            />

            {settings.showLiveStats && (
              <div className="flex gap-10 justify-center mt-8 mb-6 text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">
                <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold tabular-nums">{stats.wpm}</span>wpm</div>
                <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold tabular-nums">{stats.accuracy}%</span>acc</div>
                <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold tabular-nums">{stats.errors}</span>err</div>
              </div>
            )}

            <div className={`min-h-[180px] flex items-center justify-center ${settings.showLiveStats ? 'mt-4' : 'mt-10'}`}>
              <TypingTest
                key={`${restartKey}-${settings.funMode}`}
                mode={settings.mode}
                durationSec={settings.duration}
                wordCount={settings.wordCount}
                funMode={settings.funMode}
                stopOnError={settings.stopOnError}
                soundEnabled={settings.soundEnabled}
                fontSize={settings.fontSize}
                onComplete={handleComplete}
                onStatsUpdate={setStats}
              />
            </div>
          </div>
        ) : (
          <div>
            {isNewPersonalBest && (
              <div className="flex items-center justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                  New personal best!
                </div>
              </div>
            )}
            <ResultCard result={result} onRestart={handleRestart} />
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                className="font-semibold rounded-xl"
                onClick={() => setLocation('/competition')}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Try the Competition
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Personal stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Zap className="w-7 h-7" strokeWidth={2.5} />}
          tone="cyan"
          value={`${bestWpm}`}
          label="best WPM"
          subtext={bestWpm === 0 ? 'try the test' : bestWpm < 40 ? 'keep practicing' : bestWpm < 70 ? 'getting faster' : 'great pace'}
        />
        <StatCard
          icon={<Target className="w-7 h-7" strokeWidth={2.5} />}
          tone="amber"
          value={`${bestAcc}%`}
          label="best accuracy"
          subtext={bestAcc === 0 ? 'no runs yet' : bestAcc < 90 ? 'aim higher' : bestAcc < 97 ? 'almost perfect' : 'precise'}
        />
        <StatCard
          icon={<CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />}
          tone="green"
          value={`${totalRuns}`}
          label="total runs"
          subtext={totalRuns === 0 ? 'first one is free' : totalRuns < 5 ? 'just warming up' : 'hooked, huh?'}
        />
      </section>

      {/* Competition CTA */}
      <section className="mt-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card border border-border rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Ready to compete?</h2>
              <p className="text-muted-foreground max-w-lg">
                Sign up and take the official 60-second Competition test. Your score lands on the global leaderboard alongside every other signed-up typist.
              </p>
            </div>
            <Button
              size="lg"
              className="font-semibold rounded-xl shrink-0"
              onClick={() => setLocation('/competition')}
            >
              Enter Competition
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Course preview */}
      <SectionHeader>Course</SectionHeader>

      <div className="space-y-3">
        {LESSONS.slice(0, 5).map((lesson, i) => {
          const lp = (progress as any)[lesson.slug];
          const done = lp?.completed;
          return (
            <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
              <div className="group flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-2xl hover:border-foreground/30 hover:shadow-sm transition-all cursor-pointer">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors ${done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background'}`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-foreground truncate">{lesson.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{lesson.description}</div>
                </div>
                <div className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                  Lesson {i + 1}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/learn-typing">
          <Button variant="ghost" className="font-semibold text-base">
            See all {LESSONS.length} lessons <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      <SectionHeader>Why TypeFlow</SectionHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeatureRow icon={<Sliders className="w-5 h-5" />} title="Test, your way" body="Pick Time, Words or Quote mode. Switch durations on the fly. Drill code, punctuation, or classic prose." />
        <FeatureRow icon={<Target className="w-5 h-5" />} title="Honest stats" body="Net WPM, accuracy, and live error count. Your personal best is saved locally — no account needed to track progress." />
        <FeatureRow icon={<Trophy className="w-5 h-5" />} title="Compete fairly" body="The Competition page locks everyone to the same fixed 60s test, so the leaderboard is a level playing field." />
        <FeatureRow icon={<CheckCircle2 className="w-5 h-5" />} title="Structured course" body="Ten focused lessons take you from home row to full keyboard mastery, one drill at a time." />
      </div>

      <div className="mt-16 px-6 py-8 sm:px-10 sm:py-10 bg-muted/40 border border-border rounded-3xl text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Ready when you are.</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Scroll back up to take the test, jump into competition, or pick a structured lesson.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" className="font-semibold rounded-xl" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Take the test
          </Button>
          <Button size="lg" variant="outline" className="font-semibold rounded-xl" onClick={() => setLocation('/competition')}>
            Enter competition
          </Button>
          <Button size="lg" variant="ghost" className="font-semibold rounded-xl" onClick={() => setLocation('/learn-typing')}>
            Start the course
          </Button>
        </div>
      </div>

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

function StatCard({ icon, tone, value, label, subtext }: { icon: React.ReactNode; tone: 'green' | 'cyan' | 'amber'; value: string; label: string; subtext: string }) {
  const tones: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tones[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-3xl font-extrabold leading-none tabular-nums">{value}</div>
          <div className="text-sm font-semibold text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground border-t border-border pt-3">{subtext}</div>
    </div>
  );
}

function FeatureRow({ icon, title, body }: { icon?: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1.5">
        {icon && <div className="text-primary">{icon}</div>}
        <div className="font-bold text-base">{title}</div>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}
