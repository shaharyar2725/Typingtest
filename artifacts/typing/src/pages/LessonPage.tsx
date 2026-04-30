import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams, Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { ResultCard } from '@/components/typing/ResultCard';
import { Keyboard } from '@/components/typing/Keyboard';
import { loadState, updateLessonProgress, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { LESSONS } from '@/lib/lessons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Target, Info } from 'lucide-react';

export default function LessonPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  
  const lessonIndex = LESSONS.findIndex(l => l.slug === slug);
  const lesson = LESSONS[lessonIndex];
  
  useSEO({
    title: lesson ? `${lesson.title} | Typing Lesson | TypeFlow` : "Lesson Not Found | TypeFlow",
    description: lesson ? lesson.description : "Interactive touch typing lesson.",
  });

  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
  const [drillIndex, setDrillIndex] = useState(0);
  const [passed, setPassed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keyboard state
  const [nextKey, setNextKey] = useState<string>('');
  const [pressedKey, setPressedKey] = useState<string>('');

  useEffect(() => {
    const state = loadState();
    setSoundEnabled(state.settings.soundEnabled);
  }, []);

  useEffect(() => {
    if (!lesson) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' && e.key !== 'Enter') {
        setPressedKey(e.key);
      }
    };
    
    const handleKeyUp = () => {
      setPressedKey('');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="container max-w-screen-md mx-auto px-4 py-20 text-center">
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
    <div className="container max-w-screen-xl mx-auto px-4 py-8 flex flex-col min-h-[80vh]">
      <Link href="/learn-typing">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
        </Button>
      </Link>

      <div className="mb-8 max-w-3xl">
        <div className="text-sm font-mono text-primary mb-2 uppercase tracking-widest">Lesson {lessonIndex + 1} of {LESSONS.length}</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{lesson.title}</h1>
        <p className="text-lg text-muted-foreground">{lesson.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center"
          >
            {!result ? (
              <div className="w-full relative">
                <div className="flex gap-4 justify-between items-center mb-6">
                  <div className="text-sm font-medium text-muted-foreground">
                    Drill {drillIndex + 1} of {lesson.drills.length}
                  </div>
                  <div className="flex gap-6 opacity-80 text-sm font-mono font-medium tracking-widest text-muted-foreground uppercase">
                    <div className="flex flex-col items-center"><span className="text-xl text-foreground mb-1">{stats.wpm}</span>wpm</div>
                    <div className="flex flex-col items-center"><span className="text-xl text-foreground mb-1">{stats.accuracy}%</span>acc</div>
                  </div>
                </div>

                <div className="min-h-[120px] flex items-center justify-center bg-card border border-border/50 rounded-xl p-8 mb-8 shadow-sm">
                  <TypingTest
                    mode="paragraph"
                    presetText={drillText}
                    funMode="words"
                    stopOnError={true} // Always strict for lessons
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
              <div className="w-full py-4">
                <ResultCard 
                  result={result} 
                  onRestart={() => {
                    setResult(null);
                    setStats({ wpm: 0, accuracy: 100, errors: 0 });
                  }} 
                />
                
                <div className="mt-8 flex flex-col items-center gap-6">
                  {passed ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 mb-4">
                        <Target className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Target reached!</h3>
                      <p className="text-muted-foreground mb-6">You hit the goals for this drill.</p>
                      
                      <div className="flex gap-4">
                        {drillIndex < lesson.drills.length - 1 ? (
                          <Button size="lg" onClick={() => {
                            setDrillIndex(i => i + 1);
                            setResult(null);
                            setStats({ wpm: 0, accuracy: 100, errors: 0 });
                          }}>
                            Next Drill <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : nextLesson ? (
                          <Link href={`/lessons/${nextLesson.slug}`}>
                            <Button size="lg">
                              Next Lesson <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/learn-typing">
                            <Button size="lg">Finish Course</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-foreground mb-2">Keep trying</h3>
                      <p className="text-muted-foreground mb-6">You need {lesson.targetWpm} WPM and {lesson.targetAccuracy}% accuracy to pass.</p>
                      <Button size="lg" onClick={() => {
                        setResult(null);
                        setStats({ wpm: 0, accuracy: 100, errors: 0 });
                      }}>
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-primary" />
                Goals
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground">Speed Target</span>
                  <span className="font-mono font-medium">{lesson.targetWpm} WPM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-muted-foreground">Accuracy Target</span>
                  <span className="font-mono font-medium">{lesson.targetAccuracy}%</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-primary">
                <Info className="w-4 h-4" />
                Focus Area
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {lesson.fingerFocus}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
