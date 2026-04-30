import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { Controls } from '@/components/typing/Controls';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LESSONS } from '@/lib/lessons';

export default function TypingPracticePage() {
  useSEO({
    title: "Typing Practice & Daily Drills | TypeFlow",
    description: "Practice your typing skills with custom drills, daily challenges, and targeted lessons. Track your progress daily.",
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => loadState().settings);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const updated = updateSettings(newSettings);
    setSettings(updated);
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey(k => k + 1);
  };

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-center">Typing Practice</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center mb-16"
      >
        {!result ? (
          <div className="w-full relative">
            <Controls 
              settings={settings} 
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
            />
            
            <div className="flex gap-8 justify-center mb-6 opacity-80 text-sm font-mono font-medium tracking-widest text-muted-foreground uppercase transition-opacity hover:opacity-100">
              <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.wpm}</span>wpm</div>
              <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.accuracy}%</span>acc</div>
              <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.errors}</span>err</div>
            </div>

            <div className="min-h-[160px] flex items-center justify-center">
              <TypingTest
                key={restartKey}
                mode={settings.mode}
                durationSec={settings.duration}
                wordCount={settings.wordCount}
                funMode={settings.funMode}
                stopOnError={settings.stopOnError}
                soundEnabled={settings.soundEnabled}
                onComplete={(res) => setResult(res)}
                onStatsUpdate={setStats}
              />
            </div>
          </div>
        ) : (
          <div className="w-full py-8">
            <ResultCard 
              result={result} 
              onRestart={() => {
                setResult(null);
                setStats({ wpm: 0, accuracy: 100, errors: 0 });
              }} 
            />
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Structured Lessons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LESSONS.slice(0, 4).map((lesson) => (
              <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
                <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors group bg-muted/10">
                  <CardHeader>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">{lesson.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">{lesson.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Daily Challenge</h2>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Today's Drill
              </CardTitle>
              <CardDescription>
                A fixed 50-word test that changes every 24 hours. Everyone gets the same words today. Check how you compare.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button 
                onClick={() => {
                  handleSettingsChange({ mode: 'daily' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto"
              >
                Start Daily Challenge
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
