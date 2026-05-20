import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { ResultCard } from '@/components/typing/ResultCard';
import { Keyboard } from '@/components/typing/Keyboard';
import { loadState, updateLessonProgress, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { LESSONS } from '@/lib/lessons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Target, Info, CheckCircle2 } from 'lucide-react';

export default function LessonPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const lessonIndex = LESSONS.findIndex(l => l.slug === slug);
  const lesson = LESSONS[lessonIndex];

  useSEO({
    title: lesson ? `${lesson.title} | Typing Lesson | TakeTypingTest` : "Lesson Not Found | TakeTypingTest",
    description: lesson ? lesson.description : "Interactive touch typing lesson.",
  });

  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
  const [drillIndex, setDrillIndex] = useState(0);
  const [passed, setPassed] = useState(false);
  const [soundEnabled] = useState(() => loadState().settings.soundEnabled);
  const [pressedKey, setPressedKey] = useState<string>('');

  useEffect(() => {
    if (!lesson) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' && e.key !== 'Enter') setPressedKey(e.key);
    };
    const handleKeyUp = () => setPressedKey('');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="container max-w-screen-md mx-auto px-5 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Lesson Not Found</h1>
        <p className="text-muted-foreground mb-8">We couldn't find the lesson you were looking for.</p>
        <Link href="/learn-typing">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  const drillText = lesson.drills[drillIndex];

  const handleComplete = (res: TypingResult) => {
    setResult(res);
    const isPassed = res.wpm >= lesson.targetWpm && res.accuracy >= lesson.targetAccuracy;
    setPassed(isPassed);
    updateLessonProgress(lesson.slug, res.wpm, res.accuracy, isPassed);
  };

  const nextLesson = LESSONS[lessonIndex + 1];

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-8 md:py-10">
      <Link href="/learn-typing">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to course
        </Button>
      </Link>

      <header className="mb-8">
        <div className="text-xs sm:text-sm font-mono text-primary mb-2 uppercase tracking-widest">Lesson {lessonIndex + 1} of {LESSONS.length}</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">{lesson.title}</h1>
        <p className="text-base sm:text-lg text-muted-foreground">{lesson.description}</p>
      </header>

      {/* Goals row */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-semibold">{lesson.targetWpm} WPM</span>
          <span className="text-muted-foreground">target</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="font-semibold">{lesson.targetAccuracy}%</span>
          <span className="text-muted-foreground">accuracy</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">{lesson.fingerFocus}</span>
        </div>
      </div>

      {!result ? (
        <div>
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="font-semibold text-muted-foreground">
              Drill {drillIndex + 1} <span className="opacity-60">/ {lesson.drills.length}</span>
            </div>
            <div className="flex gap-5 sm:gap-6 font-mono font-semibold tracking-wider text-muted-foreground uppercase text-xs">
              <div className="flex flex-col items-center"><span className="text-xl text-foreground">{stats.wpm}</span>wpm</div>
              <div className="flex flex-col items-center"><span className="text-xl text-foreground">{stats.accuracy}%</span>acc</div>
              <div className="flex flex-col items-center"><span className="text-xl text-foreground">{stats.errors}</span>err</div>
            </div>
          </div>

          <div className="min-h-[120px] flex items-center justify-center bg-card border border-border rounded-2xl p-5 sm:p-8 mb-6">
            <TypingTest
              mode="paragraph"
              presetText={drillText}
              funMode="words"
              stopOnError={true}
              soundEnabled={soundEnabled}
              onComplete={handleComplete}
              onStatsUpdate={setStats}
            />
          </div>

          <div className="hidden md:block">
            <Keyboard pressedKey={pressedKey} />
          </div>
        </div>
      ) : (
        <div>
          <ResultCard
            result={result}
            onRestart={() => {
              setResult(null);
              setStats({ wpm: 0, accuracy: 100, errors: 0 });
            }}
          />

          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            {passed ? (
              <>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Target reached!</h3>
                <p className="text-muted-foreground">You hit the goals for this drill.</p>

                <div className="flex flex-wrap gap-3 justify-center">
                  {drillIndex < lesson.drills.length - 1 ? (
                    <Button size="lg" onClick={() => {
                      setDrillIndex(i => i + 1);
                      setResult(null);
                      setStats({ wpm: 0, accuracy: 100, errors: 0 });
                    }}>
                      Next drill <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : nextLesson ? (
                    <Button size="lg" onClick={() => setLocation(`/lessons/${nextLesson.slug}`)}>
                      Next lesson <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button size="lg" onClick={() => setLocation('/learn-typing')}>Finish course</Button>
                  )}
                  <Button size="lg" variant="outline" onClick={() => {
                    setResult(null);
                    setStats({ wpm: 0, accuracy: 100, errors: 0 });
                  }}>
                    Replay drill
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold">Keep trying</h3>
                <p className="text-muted-foreground">You need {lesson.targetWpm} WPM and {lesson.targetAccuracy}% accuracy to pass.</p>
                <Button size="lg" onClick={() => {
                  setResult(null);
                  setStats({ wpm: 0, accuracy: 100, errors: 0 });
                }}>
                  Try again
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
