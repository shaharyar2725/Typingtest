import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { LESSONS } from '@/lib/lessons';
import { loadState } from '@/lib/storage';
import { SectionHeader } from '@/components/SectionHeader';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Play, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const SITE_ORIGIN = 'https://www.taketypingtest.com';
const PAGE_URL = `${SITE_ORIGIN}/learn-typing`;

const FAQS = [
  {
    q: 'What is touch typing?',
    a: 'Touch typing is the ability to type without looking at the keyboard, using all ten fingers from fixed home-row positions. It\'s significantly faster and less error-prone than hunt-and-peck typing because each finger learns a dedicated zone of keys through muscle memory rather than conscious decision-making.',
  },
  {
    q: 'How long does it take to learn touch typing?',
    a: 'Most people reach a functional touch-typing speed (30–40 WPM) within 2–4 weeks of 15-minute daily practice sessions. Reaching a professional speed of 60–80 WPM typically takes 2–4 months. The key is daily, deliberate practice: even 15 minutes a day compounds quickly into lasting muscle memory.',
  },
  {
    q: 'What is the home row and why does it matter?',
    a: 'The home row is the middle row of keys on a QWERTY keyboard: A S D F G H J K L ;. Your fingers rest here between every keystroke, and every other key is defined by how far it is from home row. Learning proper home-row position first is essential because it\'s the spatial anchor all other touch-typing skills build on.',
  },
  {
    q: 'Can I teach myself touch typing?',
    a: 'Yes. Touch typing is entirely self-teachable with structured practice. TakeTypingTest\'s free course takes you from home-row basics through numbers, punctuation, and speed drills in 10 lessons. The key is consistency: 15 minutes per day, every day, with no peeking at the keyboard.',
  },
  {
    q: 'Is touch typing faster than hunt and peck?',
    a: 'Yes, significantly. Hunt-and-peck typists average 27–37 WPM. Touch typists average 50–80 WPM with far fewer errors. The productivity difference compounds: over an 8-hour workday, a 60 WPM touch typist produces the same typed output in about two-thirds the time of a 40 WPM hunt-and-peck typist.',
  },
  {
    q: 'What are the benefits of touch typing?',
    a: 'Touch typing produces faster speeds (30–100% faster than hunt-and-peck), fewer errors, reduced mental fatigue (because key-finding becomes automatic), better posture, and significantly more productivity. Research suggests knowledge workers can save up to 2 hours per day by increasing from 40 to 60 WPM.',
  },
  {
    q: 'Is this typing course free?',
    a: 'Yes. All 10 TakeTypingTest lessons, your progress tracking, and your WPM history are completely free with no account required. Everything runs in your browser.',
  },
];

export default function LearnTypingPage() {
  useSEO({
    title: 'Learn Touch Typing Free — 10-Lesson Interactive Course | TakeTypingTest',
    description:
      'Learn touch typing with TakeTypingTest\'s free 10-lesson course. Start at home row, build muscle memory through every key, number, and symbol. Track your WPM progress. No signup.',
    keywords:
      'learn touch typing, typing lessons, learn to type, touch typing course, free typing lessons, typing for beginners, home row typing, improve typing, touch typing tutorial, keyboarding',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'TakeTypingTest Touch Typing Course',
        description:
          'A free 10-lesson touch-typing course that builds muscle memory from the home row through numbers, punctuation, symbols, and speed drills. No signup required.',
        provider: {
          '@type': 'Organization',
          name: 'TakeTypingTest',
          sameAs: SITE_ORIGIN,
        },
        url: PAGE_URL,
        educationalLevel: 'Beginner',
        teaches: 'Touch typing: home row, all keyboard rows, numbers, punctuation, symbols, speed drills',
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 py-8 mb-4 border-y border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">{Math.round(overallProgress)}%</div>
              <div className="text-sm font-semibold text-muted-foreground mt-1">completed</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-1.5" />
          <div className="text-xs text-muted-foreground">{completedCount} of {LESSONS.length} lessons</div>
        </div>

        <div className="flex flex-col gap-3 sm:pl-8 sm:border-l sm:border-border">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
              <Trophy className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">{bestWpm}</div>
              <div className="text-sm font-semibold text-muted-foreground mt-1">speed (WPM)</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {bestWpm === 0 ? 'no runs yet' : 'best across lessons'}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:pl-8 sm:border-l sm:border-border">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
              <Target className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold leading-none">{bestAcc}%</div>
              <div className="text-sm font-semibold text-muted-foreground mt-1">accuracy</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {bestAcc === 0 ? 'no runs yet' : 'highest run accuracy'}
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <SectionHeader>{group.title}</SectionHeader>
          <div className="divide-y divide-border">
            {group.lessons.map((lesson) => {
              const lp = progress[lesson.slug];
              const done = lp?.completed;
              const idx = LESSONS.indexOf(lesson) + 1;
              return (
                <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
                  <div className="group flex items-center gap-4 py-4 -mx-3 px-3 rounded-xl hover:bg-muted/40 transition-smooth cursor-pointer">
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
        </div>
      ))}

      {/* Unique: Touch Typing vs Hunt & Peck, data-driven comparison */}
      <section className="mt-16 mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight mb-2">Touch typing vs hunt & peck: the real difference</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
          The choice of typing method has a measurable impact on speed, accuracy, and daily productivity. Here's what the data shows.
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Metric</th>
                <th className="text-center pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Hunt & Peck</th>
                <th className="text-center pb-3 font-semibold text-primary text-xs uppercase tracking-wider">Touch Typing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {[
                { metric: 'Average WPM', huntPeck: '27–37 WPM', touchTyping: '50–80 WPM' },
                { metric: 'Error rate', huntPeck: 'Higher (visual distraction)', touchTyping: 'Lower (tactile feedback)' },
                { metric: 'Cognitive load', huntPeck: 'High (find key + type)', touchTyping: 'Low (automatic)' },
                { metric: 'Wrist position', huntPeck: 'Variable, often strained', touchTyping: 'Neutral, consistent' },
                { metric: 'Mental fatigue', huntPeck: 'Higher over long sessions', touchTyping: 'Lower, fingers work while the brain thinks' },
                { metric: 'Hours to learn', huntPeck: 'Innate (most people self-taught)', touchTyping: '20–40 hrs of practice' },
                { metric: 'Productivity (8 hr day)', huntPeck: 'Baseline', touchTyping: 'Up to 2 hrs/day extra output' },
              ].map(({ metric, huntPeck, touchTyping }) => (
                <tr key={metric}>
                  <td className="py-3 font-medium">{metric}</td>
                  <td className="py-3 text-center text-muted-foreground">{huntPeck}</td>
                  <td className="py-3 text-center font-semibold text-primary">{touchTyping}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Learning timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6 py-8 border-y border-border">
          {[
            { title: '2–4 weeks to functional touch typing', desc: '30–40 WPM with all ten fingers. This is your first major milestone. It feels uncomfortable, then suddenly clicks.' },
            { title: '4–8 weeks to above average', desc: 'Past 50 WPM. You\'re faster than most adults, and your fingers are finding keys without looking. The habit is set.' },
            { title: '2–4 months to professional speed', desc: '65–80 WPM. Deep muscle memory across the full keyboard. This is the speed range most professional roles require.' },
          ].map(({ title, desc }) => (
            <div key={title}>
              <h3 className="text-base font-bold mb-1.5">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-16">
        <h2>How to Learn Touch Typing</h2>
        <p>
          Touch typing is the skill of typing without looking at the keyboard, using all ten fingers from
          fixed home-row positions. Once you've built it, it becomes invisible: your fingers find the keys
          while your eyes stay on the screen and your brain focuses on what you're writing, not on how to
          type it.
        </p>

        <h3>Start with the home row</h3>
        <p>
          The home row (ASDF for the left hand, JKL; for the right) is the anchor for every other key on
          the keyboard. Feel the bumps on F and J: those are your tactile guides. Every lesson in this
          course starts here and expands outward one row at a time. Don't rush past the home row. It's
          not just your starting point, it's your orientation system for every other key.
        </p>

        <h3>Go slowly and accurately before going fast</h3>
        <p>
          Speed is a byproduct of accuracy and repetition. If you type slowly but correctly, your brain is
          building the right neural pathways. Typing quickly with errors trains in mistakes that become very
          hard to unlearn. Aim for 97%+ accuracy at whatever pace feels manageable, then let speed develop
          naturally. This is uncomfortable to accept at first, but it's by far the fastest path to 60+ WPM.
        </p>

        <h3>Never look at your hands</h3>
        <p>
          This is the hardest discipline in touch-typing and the most important. Cover your hands with a
          cloth or use a blank keyboard if the temptation is too strong. Looking down breaks the cycle of
          muscle memory. Stick with it through the discomfort of the first week. Most people break through
          into a new rhythm by day 7 to 10, and at that point, looking down actually feels unnatural.
        </p>

        <h3>Practice every day, not for long</h3>
        <p>
          15–20 minutes of daily, focused practice beats one long weekly session because muscle memory
          consolidates during sleep. Work through the lessons in order, and when you pass the WPM target for
          one lesson, move on instead of over-drilling what you already know. Apply each new key set to free
          typing on the <Link href="/">practice page</Link> between lessons to reinforce it.
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
