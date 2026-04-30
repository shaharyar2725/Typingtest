import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { Controls } from '@/components/typing/Controls';
import { ResultCard } from '@/components/typing/ResultCard';
import { Leaderboard } from '@/components/typing/Leaderboard';
import { SectionHeader } from '@/components/SectionHeader';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Play, CheckCircle2, Zap, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LESSONS } from '@/lib/lessons';
import { submitScore } from '@/lib/leaderboard-api';

export default function Home() {
  useSEO({
    title: "TypeFlow | Free Typing Test & Course",
    description: "Improve your typing speed and accuracy with TypeFlow's free typing test and interactive courses. No signup required.",
  });

  const initial = loadState();
  const [settings, setSettings] = useState<AppState['settings']>(initial.settings);
  const [history, setHistory] = useState<TypingResult[]>(initial.history);
  const [progress, setProgress] = useState(initial.lessonProgress);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({ wpm: 0, accuracy: 100, errors: 0 });
  const [restartKey, setRestartKey] = useState(0);
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [, setLocation] = useLocation();

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    setSettings(updateSettings(newSettings));
  };

  const handleComplete = async (res: TypingResult) => {
    setResult(res);
    setHistory(loadState().history);
    const ok = await submitScore({
      wpm: res.wpm,
      accuracy: res.accuracy,
      errors: res.errors,
      mode: res.mode,
      durationSec: res.durationSec,
    });
    if (ok) setLeaderboardKey(k => k + 1);
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey(k => k + 1);
  };

  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;
  const bestWpm = Math.max(...history.map(h => h.wpm), 0);
  const bestAcc = Math.max(...history.map(h => h.accuracy), 0);

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">

      {/* Hero typing test — no decoration, just the test, focused immediately */}
      <section className="mb-20">
        {!result ? (
          <div>
            <Controls
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
              timeLeft={stats.timeLeft}
              durationSec={settings.duration}
            />

            <div className="flex gap-10 justify-center mt-8 mb-6 text-xs font-mono font-semibold tracking-widest text-muted-foreground uppercase">
              <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold">{stats.wpm}</span>wpm</div>
              <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold">{stats.accuracy}%</span>acc</div>
              <div className="flex flex-col items-center gap-1"><span className="text-3xl text-foreground font-bold">{stats.errors}</span>err</div>
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
                onComplete={handleComplete}
                onStatsUpdate={setStats}
              />
            </div>
          </div>
        ) : (
          <ResultCard result={result} onRestart={handleRestart} />
        )}
      </section>

      {/* Leaderboard — sits directly below the test */}
      <section className="mb-20">
        <Leaderboard refreshKey={leaderboardKey} />
      </section>

      {/* Stats — typewizz-style 3 simple white cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />}
          tone="green"
          value={`${completedCount}`}
          label="lessons done"
          subtext={completedCount === 0 ? "let's go" : completedCount === LESSONS.length ? 'all done' : 'keep going'}
        />
        <StatCard
          icon={<Zap className="w-7 h-7" strokeWidth={2.5} />}
          tone="cyan"
          value={`${bestWpm}`}
          label="speed (WPM)"
          subtext={bestWpm === 0 ? 'try the test' : bestWpm < 40 ? 'keep trying' : bestWpm < 70 ? 'getting faster' : 'great pace'}
        />
        <StatCard
          icon={<Target className="w-7 h-7" strokeWidth={2.5} />}
          tone="amber"
          value={`${bestAcc}%`}
          label="accuracy"
          subtext={bestAcc === 0 ? 'no runs yet' : bestAcc < 90 ? 'keep trying' : bestAcc < 97 ? 'almost there' : 'precise'}
        />
      </section>

      {/* Course preview — pill-row lessons like typewizz */}
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
            See all 10 lessons <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      <SectionHeader>Why TypeFlow</SectionHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeatureRow title="No signup, no fluff" body="Open the page and start typing. Your runs save in your browser automatically." />
        <FeatureRow title="Real practice modes" body="Common words, classic quotes, code snippets, or punctuation drills — pick your fight." />
        <FeatureRow title="Honest stats" body="WPM, accuracy, error count, plus a per-key heatmap so you know what to work on." />
        <FeatureRow title="A short, focused course" body="Ten lessons from home row to speed drills. Beat the target and move on." />
      </div>

      <div className="mt-16 px-6 py-8 sm:px-10 sm:py-10 bg-muted/40 border border-border rounded-3xl text-center">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Ready when you are.</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Scroll back up and start typing. Or pick a structured lesson if you want to build the habit properly.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" className="font-semibold rounded-xl" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Take the test
          </Button>
          <Button size="lg" variant="outline" className="font-semibold rounded-xl" onClick={() => setLocation('/learn-typing')}>
            Start the course
          </Button>
        </div>
      </div>
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
          <div className="text-3xl font-extrabold leading-none">{value}</div>
          <div className="text-sm font-semibold text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground border-t border-border pt-3">{subtext}</div>
    </div>
  );
}

function FeatureRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="font-bold text-base mb-1.5">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}
