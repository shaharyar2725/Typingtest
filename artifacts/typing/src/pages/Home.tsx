import { useMemo, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { SectionHeader } from '@/components/SectionHeader';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Play, CheckCircle2, Zap, Target, ArrowRight, Trophy, Sliders, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LESSONS } from '@/lib/lessons';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/`;

const FAQS = [
  {
    q: 'What is typing practice?',
    a: 'Typing practice is the deliberate exercise of typing on a keyboard to improve speed (words per minute) and accuracy. TypeFlow gives you free, customizable typing practice in time, words and quote modes — pick a duration, start typing, and get instant WPM and accuracy feedback.',
  },
  {
    q: 'How long should I practice typing each day?',
    a: '10 to 15 minutes of focused typing practice per day is enough to see steady gains in speed and accuracy. Short, daily sessions beat one long weekly session because muscle memory builds with repetition.',
  },
  {
    q: 'How can I improve my typing speed?',
    a: 'Prioritize accuracy over raw speed, keep your fingers on the home row (ASDF JKL;), and never look at the keyboard. Mix timed practice with structured lessons to fix specific weak keys, and review your error heatmap after each session.',
  },
  {
    q: 'Is TypeFlow typing practice free?',
    a: 'Yes — every typing practice mode, the full course, and your personal best stats are 100% free with no signup required. Sign up only if you want to submit your scores to the public Competition leaderboard.',
  },
  {
    q: 'Does my score on the practice page count for the leaderboard?',
    a: 'No. The home practice page is for personal training only — your best WPM is saved in your browser. The official Competition page (60 seconds, fixed rules) is what counts for the global leaderboard.',
  },
];

export default function Home() {
  useSEO({
    title: 'Free Typing Practice — Boost Your WPM & Accuracy | TypeFlow',
    description:
      'Free online typing practice with live WPM, accuracy and error tracking. Pick time, words or quote mode, beat your personal best, and prep for the global leaderboard.',
    keywords:
      'typing practice, online typing practice, free typing practice, typing exercises, improve typing speed, wpm practice, daily typing drills',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow Typing Practice',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free online typing practice tool. Customize time, word count and source. Live WPM, accuracy and error feedback with personal best tracking.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Time, words and quote practice modes',
          'Live WPM and accuracy stats',
          'Personal best tracking (no signup)',
          'Common words, code snippets, punctuation and quotes',
          'Light and dark themes',
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: 'Typing Practice', item: PAGE_URL },
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

  const initial = loadState();
  const [settings, setSettings] = useState<AppState['settings']>(initial.settings);
  const [history, setHistory] = useState<TypingResult[]>(initial.history);
  const [progress] = useState(initial.lessonProgress);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({ wpm: 0, accuracy: 100, errors: 0 });
  const [restartKey, setRestartKey] = useState(0);
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

      {/* SEO H1 + intro — visible content with primary keyword in first 100 words. */}
      <header className="text-center mb-6 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          Free Typing Practice
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          Sharpen your typing speed and accuracy with free online typing practice.
          Pick a time, word count or quote, then watch your live WPM as you type.
          Your personal best is saved in your browser — no signup needed.
        </p>
      </header>

      {/* Personal best banner */}
      {totalRuns > 0 && (
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-sm font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Your personal best: <span className="tabular-nums font-extrabold">{bestWpm}</span> WPM · {bestAcc}% acc</span>
          </div>
        </div>
      )}

      {/* Typing practice tool */}
      <section aria-label="Typing practice" className="mb-16">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
              onOpenAuth={() => setAuthOpen(true)}
              timeLeft={stats.timeLeft}
              isRunning={isRunning}
            />

            <div className="min-h-[180px] flex items-center justify-center mt-10">
              <TypingTest
                key={`${restartKey}-${settings.funMode}`}
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
                Take the official typing test
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Personal stats */}
      <section aria-label="Your personal best" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Internal-link CTA — keyword-rich anchor "typing test" pointing to canonical */}
      <section className="mt-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card border border-border rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                Leaderboard
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Ready for the typing test?</h2>
              <p className="text-muted-foreground max-w-lg">
                Sign up and take the official <Link href="/competition" className="text-primary font-semibold underline-offset-4 hover:underline">60-second typing test</Link>.
                Your WPM goes straight to the global leaderboard alongside every other signed-up typist.
              </p>
            </div>
            <Button
              size="lg"
              className="font-semibold rounded-xl shrink-0"
              onClick={() => setLocation('/competition')}
            >
              Start typing test
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
        {/* Tiny hint about lesson completion */}
        {completedCount > 0 && (
          <span className="sr-only">{completedCount} lessons completed</span>
        )}
      </div>

      <SectionHeader>Why TypeFlow Typing Practice</SectionHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FeatureRow icon={<Sliders className="w-5 h-5" />} title="Practice your way" body="Pick Time, Words or Quote mode. Switch durations on the fly. Drill code, punctuation, or classic prose — all in one tool." />
        <FeatureRow icon={<Target className="w-5 h-5" />} title="Honest typing stats" body="Net WPM, accuracy, and live error count. Your personal best is saved locally — no account needed to track your typing practice progress." />
        <FeatureRow icon={<Trophy className="w-5 h-5" />} title="Compete fairly" body="The Competition page locks everyone to the same fixed 60s typing test, so the leaderboard is a level playing field." />
        <FeatureRow icon={<CheckCircle2 className="w-5 h-5" />} title="Structured course" body="Ten focused lessons take you from home row to full keyboard mastery, one drill at a time." />
      </div>

      {/* Long-form SEO content — body answers search intent for "typing practice" */}
      <SectionHeader>How to get the most out of typing practice</SectionHeader>

      <article className="max-w-3xl mx-auto prose dark:prose-invert prose-headings:font-bold prose-h3:text-xl prose-h3:mt-8">
        <p>
          Consistent typing practice is the single fastest way to raise your words-per-minute (WPM) and cut down on errors.
          A few focused minutes per day will outperform a marathon weekly session every time, because typing speed is built
          on muscle memory — and muscle memory rewards repetition.
        </p>

        <h3>Practice with the right grip</h3>
        <p>
          Keep your fingers on the home row (ASDF for the left hand, JKL; for the right hand) and let each finger reach
          for the keys it owns. The little bumps on F and J help you find the position without looking. Resist the urge to
          glance at the keyboard — looking down is the habit that caps most people&apos;s typing speed.
        </p>

        <h3>Prioritize accuracy over speed</h3>
        <p>
          Slow, accurate typing builds the right neural pathways. Speed comes naturally as accuracy improves, and trying
          to type faster than your fingers can reliably go just trains in errors. Aim for 97%+ accuracy first, then push
          the duration or word count.
        </p>

        <h3>Mix the modes</h3>
        <p>
          TypeFlow gives you four word sources — common words, classic quotes, code snippets and punctuation/numbers.
          Rotate between them so you don&apos;t over-train on one type of text. Programmers especially benefit from regular
          code-snippet practice because of all the symbols and case changes.
        </p>

        <h3>Track your personal best</h3>
        <p>
          Every run is saved locally in your browser, so you always know your best WPM and best accuracy. Once you&apos;re
          consistently beating your personal best, head to the <Link href="/competition" className="text-primary font-semibold">typing test competition</Link> and
          put your score on the public leaderboard.
        </p>
      </article>

      {/* FAQ — visible content + JSON-LD twin in <head> for AI Overviews & rich results */}
      <SectionHeader>Typing practice FAQ</SectionHeader>

      <div className="max-w-3xl mx-auto space-y-3">
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

      <div className="mt-16 px-6 py-8 sm:px-10 sm:py-10 bg-muted/40 border border-border rounded-3xl text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">Ready when you are.</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Scroll back up for free typing practice, jump into the typing test, or pick a structured lesson.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" className="font-semibold rounded-xl" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Start typing practice
          </Button>
          <Button size="lg" variant="outline" className="font-semibold rounded-xl" onClick={() => setLocation('/competition')}>
            Take the typing test
          </Button>
          <Button size="lg" variant="ghost" className="font-semibold rounded-xl" onClick={() => setLocation('/learn-typing')}>
            Start the course
          </Button>
        </div>
      </div>

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
