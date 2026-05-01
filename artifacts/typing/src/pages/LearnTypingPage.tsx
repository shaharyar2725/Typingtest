import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { LESSONS } from '@/lib/lessons';
import { loadState } from '@/lib/storage';
import { SectionHeader } from '@/components/SectionHeader';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Play, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/learn-typing`;

const FAQS = [
  {
    q: 'What is touch typing?',
    a: 'Touch typing is the ability to type without looking at the keyboard, using all ten fingers from fixed home-row positions. It\'s significantly faster and less error-prone than hunt-and-peck typing because each finger learns a dedicated zone of keys through muscle memory.',
  },
  {
    q: 'How long does it take to learn touch typing?',
    a: 'Most people reach a functional touch-typing speed (30–40 WPM) in 2–4 weeks of daily practice. Reaching a professional speed of 60–80 WPM typically takes 2–4 months. The key is daily, deliberate practice — even 15 minutes a day compounds quickly.',
  },
  {
    q: 'What is the home row and why does it matter?',
    a: 'The home row is the middle row of keys on a QWERTY keyboard: ASDFGHJKL;. Your fingers rest here between every keystroke. Every other key on the keyboard is defined by how far it is from the home row. Learning proper home-row position first is essential because it\'s the foundation all other touch-typing skills build on.',
  },
  {
    q: 'Can I learn to type faster without looking at the keyboard?',
    a: 'Yes — and that\'s exactly what touch typing teaches. The key is to break the habit of looking down, which most people find painful at first but natural within a week or two. Start with the home-row lesson, go slowly, and never let yourself look down even when you make mistakes.',
  },
  {
    q: 'Is this typing course free?',
    a: 'Yes — all 10 TypeFlow lessons, your progress tracking, and your WPM history are completely free with no account required.',
  },
];

export default function LearnTypingPage() {
  useSEO({
    title: 'Learn Touch Typing — Free Interactive Course | TypeFlow',
    description:
      'Learn touch typing with TypeFlow\'s free 10-lesson course. Build muscle memory from the home row through numbers, punctuation, symbols, and speed drills. No signup needed.',
    keywords:
      'learn touch typing, typing lessons, learn to type, touch typing course, free typing lessons, typing for beginners, home row typing, improve typing',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'TypeFlow Touch Typing Course',
        description:
          'A free 10-lesson touch-typing course that builds muscle memory from the home row through numbers, punctuation, symbols, and speed drills.',
        provider: {
          '@type': 'Organization',
          name: 'TypeFlow',
          sameAs: SITE_ORIGIN,
        },
        url: PAGE_URL,
        educationalLevel: 'Beginner',
        teaches: 'Touch typing — home row, all keyboard rows, numbers, punctuation, symbols, speed',
        courseMode: 'online',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
          { '@type': 'ListItem', position: 2, name: 'Learn Touch Typing', item: PAGE_URL },
        ],
      },
    ],
  });

  const [progress] = useState<Record<string, any>>(() => loadState().lessonProgress);

  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;
  const overallProgress = (completedCount / LESSONS.length) * 100;
  const bestWpm = Math.max(...Object.values(progress).map((p: any) => p.bestWpm || 0), 0);
  const bestAcc = Math.max(...Object.values(progress).map((p: any) => p.bestAccuracy || 0), 0);

  // Group lessons into rows by category
  const groups = [
    { title: 'Foundations', lessons: LESSONS.slice(0, 3) },
    { title: 'Numbers & punctuation', lessons: LESSONS.slice(3, 7) },
    { title: 'Speed & fluency', lessons: LESSONS.slice(7) },
  ];

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">

      <header className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Touch typing course</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Ten focused lessons. Start at the home row, finish typing in your sleep.
        </p>
      </header>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">{Math.round(overallProgress)}%</div>
              <div className="text-sm font-semibold text-muted-foreground mt-1">completed</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
          <div className="text-xs text-muted-foreground">{completedCount} of {LESSONS.length} lessons</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
              <Trophy className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">{bestWpm}</div>
              <div className="text-sm font-semibold text-muted-foreground mt-1">speed (WPM)</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground border-t border-border pt-3">
            {bestWpm === 0 ? 'no runs yet' : 'best across lessons'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <Target className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">{bestAcc}%</div>
              <div className="text-sm font-semibold text-muted-foreground mt-1">accuracy</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground border-t border-border pt-3">
            {bestAcc === 0 ? 'no runs yet' : 'highest run accuracy'}
          </div>
        </div>
      </div>

      {groups.map((group, gi) => (
        <div key={group.title}>
          <SectionHeader>{group.title}</SectionHeader>
          <div className="space-y-3">
            {group.lessons.map((lesson) => {
              const lp = progress[lesson.slug];
              const done = lp?.completed;
              const idx = LESSONS.indexOf(lesson) + 1;
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
                    <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-muted-foreground shrink-0">
                      <span className="px-2 py-1 rounded-md bg-muted">{lesson.targetWpm} WPM</span>
                      <span className="px-2 py-1 rounded-md bg-muted">{lesson.targetAccuracy}% acc</span>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 hidden sm:block">
                      {String(idx).padStart(2, '0')}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {gi === groups.length - 1 ? null : null}
        </div>
      ))}

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-16">
        <h2>How to Learn Touch Typing</h2>
        <p>
          Touch typing is the skill of typing without looking at the keyboard, using all ten fingers
          from fixed home-row positions. Once you've built it, it becomes invisible — your fingers
          find the keys while your eyes stay on the screen. Here's how to build it systematically.
        </p>

        <h3>Start with the home row</h3>
        <p>
          The home row (ASDF for the left hand, JKL; for the right) is the anchor for every other
          key on the keyboard. Feel the bumps on F and J — those are your tactile guides. Every
          lesson in this course starts here and expands outward one row at a time.
        </p>

        <h3>Go slowly and accurately before going fast</h3>
        <p>
          Speed is a byproduct of accuracy and repetition. If you type slowly but correctly, your
          brain is building the right neural pathways. Typing quickly with errors just trains in
          mistakes. Aim for 97%+ accuracy at whatever pace feels comfortable, then let speed develop
          naturally.
        </p>

        <h3>Never look at your hands</h3>
        <p>
          This is the hardest discipline in touch-typing. Cover your hands with a cloth or use a
          blank keyboard if it helps. Looking down breaks the cycle of muscle memory. Stick with it
          through the discomfort of the first week — most people break through into a new rhythm by
          day 7–10.
        </p>

        <h3>Practice every day, not for long</h3>
        <p>
          15–20 minutes of daily, focused practice beats one long weekly session because muscle
          memory consolidates during sleep. Work through the lessons in order, and when you pass the
          WPM target for one lesson, move on — don't over-drill what you already know.
        </p>

        <h3>Mix lessons with free typing practice</h3>
        <p>
          After each lesson, switch over to the <a href="/">typing practice</a> page and type freely
          with your new keys active. Applying what you've just drilled to natural text is how you
          move from "knowing" a key position to having it in your fingers.
        </p>

        <h2>Frequently Asked Questions</h2>
        <dl>
          {FAQS.map(({ q, a }) => (
            <div key={q} className="mb-4">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-1 text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}
