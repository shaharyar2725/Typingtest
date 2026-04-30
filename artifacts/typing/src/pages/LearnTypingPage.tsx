import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { LESSONS } from '@/lib/lessons';
import { loadState } from '@/lib/storage';
import { SectionHeader } from '@/components/SectionHeader';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Play, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function LearnTypingPage() {
  useSEO({
    title: "Learn Touch Typing | Interactive Course | TypeFlow",
    description: "Master touch typing with our free 10-lesson interactive course. Build muscle memory from the home row to advanced symbols.",
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
    </div>
  );
}
