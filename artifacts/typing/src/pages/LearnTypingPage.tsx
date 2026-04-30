import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { LESSONS } from '@/lib/lessons';
import { loadState } from '@/lib/storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LearnTypingPage() {
  useSEO({
    title: "Learn Touch Typing | Interactive Course | TypeFlow",
    description: "Master touch typing with our free 10-lesson interactive course. Build muscle memory from the home row to advanced symbols.",
  });

  const [progress, setProgress] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const state = loadState();
    setProgress(state.lessonProgress);
  }, []);

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const overallProgress = (completedCount / LESSONS.length) * 100;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      
      <section className="max-w-3xl mx-auto text-center mb-16 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Learn Touch Typing</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Master the keyboard without looking down. Our 10-lesson course builds muscle memory from the ground up, starting with the home row and finishing with high-speed endurance drills.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <h3 className="font-semibold mb-2 opacity-90">Course Progress</h3>
            <div className="text-4xl font-bold mb-4 font-mono">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="bg-primary-foreground/20 h-2" />
            <div className="mt-2 text-sm opacity-80">{completedCount} of {LESSONS.length} lessons completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-semibold">
              <Trophy className="w-4 h-4" />
              Best WPM
            </div>
            <div className="text-4xl font-bold font-mono">
              {Math.max(...Object.values(progress).map((p: any) => p.bestWpm || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground font-semibold">
              <Target className="w-4 h-4" />
              Best Accuracy
            </div>
            <div className="text-4xl font-bold font-mono">
              {Math.max(...Object.values(progress).map((p: any) => p.bestAccuracy || 0), 0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        {LESSONS.map((lesson, i) => {
          const lessonProgress = progress[lesson.slug];
          const isCompleted = lessonProgress?.completed;

          return (
            <motion.div
              key={lesson.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/lessons/${lesson.slug}`}>
                <Card className={`h-full cursor-pointer transition-all hover:border-primary/50 group ${isCompleted ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-mono text-primary mb-1">Lesson {i + 1}</div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{lesson.title}</CardTitle>
                      </div>
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          <Target className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      )}
                    </div>
                    <CardDescription className="mt-2">{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <div className="px-2 py-1 rounded bg-muted/50">Target: {lesson.targetWpm} WPM</div>
                      <div className="px-2 py-1 rounded bg-muted/50">{lesson.targetAccuracy}% Acc</div>
                    </div>
                    {lessonProgress && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex gap-4 text-xs">
                        <span className="font-mono text-foreground">{lessonProgress.bestWpm} WPM</span>
                        <span className="font-mono text-foreground">{lessonProgress.bestAccuracy}% Acc</span>
                        <span className="text-muted-foreground ml-auto">{lessonProgress.attempts} attempts</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
