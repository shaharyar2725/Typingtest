import { useState } from 'react';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { SectionHeader } from '@/components/SectionHeader';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Play, CheckCircle2, ArrowRight, Zap, TrendingUp, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LESSONS } from '@/lib/lessons';

const SITE_ORIGIN = 'https://taketypingtest.com';
const PAGE_URL = `${SITE_ORIGIN}/`;

const FAQS = [
  {
    q: 'What is typing practice?',
    a: 'Typing practice is the deliberate exercise of typing on a keyboard to improve speed (words per minute) and accuracy. TakeTypingTest gives you free, customizable typing practice in time, words and quote modes. Pick a duration, start typing, and get instant WPM and accuracy feedback.',
  },
  {
    q: 'How long should I practice typing each day?',
    a: '10 to 15 minutes of focused typing practice per day is enough to see steady gains in speed and accuracy. Short, daily sessions beat one long weekly session because muscle memory builds with repetition, not with volume.',
  },
  {
    q: 'How can I improve my typing speed?',
    a: 'Prioritize accuracy over raw speed, keep your fingers on the home row (ASDF JKL;), and never look at the keyboard. Mix timed practice with structured lessons to fix specific weak keys, and review your error patterns after each session.',
  },
  {
    q: 'What is a good typing speed?',
    a: 'The global average is 41.6 WPM across 10.4 million measured tests. Typing at 60 WPM puts you above average; 70–80 WPM meets most professional job requirements; 100+ WPM is elite. For context, the average professional typist hits 65–75 WPM.',
  },
  {
    q: 'Is TakeTypingTest typing practice free?',
    a: 'Yes. Every typing practice mode, the full 10-lesson course, and your personal best stats are 100% free with no signup required. Everything runs in your browser.',
  },
  {
    q: 'How is WPM calculated?',
    a: 'TakeTypingTest uses net WPM: total correctly typed characters divided by 5 (the standard "word" length), divided by the test duration in minutes. Uncorrected errors are penalized. This is the same formula used by most professional typing benchmarks and employer tests.',
  },
  {
    q: 'How can I improve my typing accuracy?',
    a: 'Slow down until you can type without errors, then gradually increase pace. Use strict mode in TakeTypingTest settings to force correction of every error. Drilling your personal weak keys in the lesson course also directly raises accuracy on common letter combinations.',
  },
  {
    q: 'What are the benefits of touch typing?',
    a: 'Touch typists type 30–40% faster on average and make fewer errors than hunt-and-peck typists. The productivity difference compounds over time: research suggests knowledge workers can save up to 2 hours per day by moving from 40 to 60 WPM. Touch typing also reduces fatigue because your hands stay in a neutral position.',
  },
];

export default function Home() {
  useSEO({
    title: 'Free Typing Practice — Improve Your WPM & Accuracy | TakeTypingTest',
    description:
      'Free online typing practice with live WPM, accuracy and error tracking. Pick time, words or quote mode. No signup needed, so practice as much as you want and track your personal best.',
    keywords:
      'typing practice, online typing practice, free typing practice, typing exercises, improve typing speed, wpm practice, daily typing drills, keyboarding practice',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TakeTypingTest Typing Practice',
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

  const handleComplete = (res: TypingResult) => setResult(res);
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
          Your personal best is saved in your browser, no signup needed.
        </p>
      </header>

      {/* Typing practice tool */}
      <section aria-label="Typing practice" className="mb-16">
        {!result ? (
          <div className="sticky top-16 z-30 bg-background -mx-5 px-5 md:-mx-8 md:px-8 lg:mx-0 lg:px-0 pb-4 md:pb-0 md:static md:top-auto md:z-auto border-b border-border/30 md:border-transparent">
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

      {/* Unique: Global Typing Speed Stats */}
      <section className="mb-4">
        <SectionHeader>Global typing speed statistics</SectionHeader>
        <p className="text-sm text-muted-foreground max-w-2xl mb-8">
          Based on 10.4 million typing tests measured worldwide, here's where real typists actually stand.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          {[
            { stat: '41.6 WPM', label: 'Global average', sub: 'across all adults', icon: TrendingUp, color: 'text-primary' },
            { stat: '65–75 WPM', label: 'Professional', sub: 'most office roles', icon: Target, color: 'text-emerald-500' },
            { stat: '15 min/day', label: 'To improve', sub: 'focused practice beats marathon sessions', icon: Clock, color: 'text-cyan-500' },
            { stat: '2–4 weeks', label: 'To see gains', sub: 'with daily deliberate practice', icon: Zap, color: 'text-amber-500' },
          ].map(({ stat, label, sub, icon: Icon, color }) => (
            <div key={label}>
              <Icon className={`w-4 h-4 mb-2.5 ${color}`} />
              <div className={`text-2xl sm:text-3xl font-extrabold leading-none mb-1.5 ${color}`}>{stat}</div>
              <div className="font-semibold text-sm text-foreground mb-0.5">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          ))}
        </div>

        {/* Speed tier table */}
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Speed tier</th>
                <th className="text-center pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">WPM range</th>
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">What it means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {[
                { tier: 'Beginner', range: '< 30 WPM', desc: 'Still looking at keys. Home-row practice will unlock the biggest gains.' },
                { tier: 'Average', range: '30–50 WPM', desc: 'Global average (~41.6 WPM). Enough for everyday tasks with room to double your speed.' },
                { tier: 'Above average', range: '50–65 WPM', desc: 'Typing without much conscious thought. A few weeks of drills can push you professional.' },
                { tier: 'Professional', range: '65–80 WPM', desc: 'Threshold for most data entry, admin, and office roles. Accuracy is the real test here.' },
                { tier: 'Fast', range: '80–100 WPM', desc: 'Deep muscle memory. Used by journalists, legal assistants, and experienced typists.' },
                { tier: 'Elite', range: '100+ WPM', desc: 'Top 2% globally. Where competitive typists operate. Accuracy is what separates them.' },
              ].map(({ tier, range, desc }) => (
                <tr key={tier}>
                  <td className="py-3 font-bold">{tier}</td>
                  <td className="py-3 text-center font-mono font-semibold text-muted-foreground whitespace-nowrap">{range}</td>
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA: typing test */}
      <section className="mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-10 border-y border-border">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              Speed Test
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Ready to test your speed?</h2>
            <p className="text-muted-foreground max-w-lg">
              Try the free <Link href="/typing-speed-test" className="text-primary font-semibold underline-offset-4 hover:underline">typing speed test</Link> and
              see your official WPM score with a global percentile ranking. No account needed, just start typing.
            </p>
          </div>
          <Link href="/typing-speed-test">
            <Button size="lg" className="font-semibold rounded-xl shrink-0">
              Start typing test
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Course preview */}
      <SectionHeader>Touch typing course</SectionHeader>

      <div className="divide-y divide-border mb-8">
        {LESSONS.slice(0, 5).map((lesson, i) => {
          const lp = (progress as any)[lesson.slug];
          const done = lp?.completed;
          return (
            <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
              <div className="group flex items-center gap-4 py-4 hover:bg-muted/40 -mx-3 px-3 rounded-xl transition-smooth cursor-pointer">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors ${done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background'}`}>
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

      <div className="flex justify-center mb-16">
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
          Consistent typing practice is the single fastest way to raise your words-per-minute (WPM) and cut
          down on errors. A few focused minutes per day will outperform a marathon weekly session every time,
          because typing speed is built on muscle memory, and muscle memory rewards repetition over duration.
          The global average sits at 41.6 WPM. With 15 minutes of daily deliberate practice, most people can
          reach 60 WPM within 4 to 8 weeks.
        </p>

        <h3>Practice with the right finger position</h3>
        <p>
          Keep your fingers resting on the home row (ASDF for the left hand, JKL; for the right hand) and
          let each finger reach for the keys it owns. The small raised bumps on F and J let you find your
          position without looking. Resist the urge to glance at the keyboard, since looking down is the
          habit that caps most people's typing speed. It forces a mental context switch that breaks your
          rhythm every single time.
        </p>

        <h3>Accuracy first, speed second</h3>
        <p>
          Slow, accurate typing builds the correct neural pathways. Speed comes naturally as accuracy
          improves. Research shows a single error costs approximately 2.5 seconds of cognitive reset, which
          means typing at 90% accuracy can reduce your effective output by nearly 30% compared to 99%
          accuracy at the same WPM. Aim for 97%+ accuracy first, then push the duration or word count.
          TakeTypingTest's strict mode forces error correction, which accelerates this process.
        </p>

        <h3>Mix the practice modes</h3>
        <p>
          TakeTypingTest gives you four word sources: common English words, classic quotes, code snippets, and
          punctuation and numbers. Rotate between them so you don't over-train on one type of text. Programmers
          especially benefit from regular code-snippet practice because of all the symbols, brackets, and
          case changes. Quotes force you to keep pace with punctuation rhythm.
        </p>

        <h3>Track your improvement, not just your best</h3>
        <p>
          Every run is saved locally in your browser, so you always know your best WPM and best accuracy.
          Rather than chasing your personal best every session, track your <em>average</em> WPM across
          multiple runs. Consistency is what separates a genuine 60 WPM typist from someone who hit 60 once.
          Once you're consistently beating your average, head to the{' '}
          <Link href="/typing-speed-test" className="text-primary font-semibold">typing speed test</Link>{' '}
          for your official benchmark score with a global percentile ranking.
        </p>
      </article>

      {/* FAQ */}
      <SectionHeader>Typing practice FAQ</SectionHeader>

      <div className="max-w-3xl mx-auto divide-y divide-border mb-8">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-base [&::-webkit-details-marker]:hidden">
              <span>{f.q}</span>
              <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
            </summary>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
