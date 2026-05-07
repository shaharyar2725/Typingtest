import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { SectionHeader } from '@/components/SectionHeader';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Play, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
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
    a: 'Yes — every typing practice mode, the full course, and your personal best stats are 100% free with no signup required.',
  },
  {
    q: 'How is WPM calculated?',
    a: 'TypeFlow uses net WPM: total correctly typed characters divided by 5, divided by the test duration in minutes, with uncorrected errors penalized.',
  },
];

export default function Home() {
  useSEO({
    title: 'Free Typing Practice — Boost Your WPM & Accuracy | TypeFlow',
    description:
      'Free online typing practice with live WPM, accuracy and error tracking. Pick time, words or quote mode and beat your personal best.',
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
  const [progress] = useState(initial.lessonProgress);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({ wpm: 0, accuracy: 100, errors: 0 });
  const [restartKey, setRestartKey] = useState(0);

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
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey(k => k + 1);
  };

  const isRunning = stats.timeLeft !== undefined && stats.timeLeft > 0 && !result;

  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">

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

      {/* Typing practice tool */}
      <section aria-label="Typing practice" className="mb-16">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
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
          <ResultCard result={result} onRestart={handleRestart} />
        )}
      </section>

      {/* CTA — typing test */}
      <section className="mt-12">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card to-card border border-border rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold mb-3">
                <Zap className="w-3.5 h-3.5" />
                Speed Test
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Ready to test your speed?</h2>
              <p className="text-muted-foreground max-w-lg">
                Try the free <Link href="/typing-speed-test" className="text-primary font-semibold underline-offset-4 hover:underline">typing speed test</Link> and
                see your official WPM score. No account needed — just start typing.
              </p>
            </div>
            <Link href="/typing-speed-test">
              <Button size="lg" className="font-semibold rounded-xl shrink-0">
                Start typing test
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
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
        {completedCount > 0 && (
          <span className="sr-only">{completedCount} lessons completed</span>
        )}
      </div>

      {/* Long-form SEO content */}
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
          consistently beating your personal best, head to the{' '}
          <Link href="/typing-speed-test" className="text-primary font-semibold">typing speed test</Link>{' '}
          to get your official score.
        </p>
      </article>

      {/* FAQ */}
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
    </div>
  );
}
