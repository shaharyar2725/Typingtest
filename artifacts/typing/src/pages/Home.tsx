import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import { TypingTest } from '@/components/typing/TypingTest';
import { Controls } from '@/components/typing/Controls';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Zap, Target, ArrowRight, Activity, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LESSONS } from '@/lib/lessons';

export default function Home() {
  useSEO({
    title: "TypeFlow | Free Typing Test & Course",
    description: "Improve your typing speed and accuracy with TypeFlow's free typing test and interactive courses. No signup required.",
  });

  const [settings, setSettings] = useState<AppState['settings'] | null>(null);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
  const [history, setHistory] = useState<TypingResult[]>([]);

  useEffect(() => {
    const state = loadState();
    setSettings(state.settings);
    setHistory(state.history);
  }, [result]); // Re-load when result changes

  if (!settings) return null;

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const updated = updateSettings(newSettings);
    setSettings(updated);
  };

  const topRuns = [...history]
    .filter(h => h.mode !== 'lesson')
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 5);

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8 flex flex-col gap-16">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl flex flex-col items-center"
        >
          {!result ? (
            <div className="w-full relative">
              <Controls 
                settings={settings} 
                onSettingsChange={handleSettingsChange}
                onRestart={() => setResult(null)}
              />
              
              <div className="flex gap-8 justify-center mb-6 opacity-80 text-sm font-mono font-medium tracking-widest text-muted-foreground uppercase transition-opacity hover:opacity-100">
                <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.wpm}</span>wpm</div>
                <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.accuracy}%</span>acc</div>
                <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.errors}</span>err</div>
              </div>

              <div className="min-h-[160px] flex items-center justify-center">
                <TypingTest
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
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="h-full border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Improve Speed</CardTitle>
              <CardDescription>Take timed and word-count tests to push your WPM to new heights.</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <Card className="h-full border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Improve Accuracy</CardTitle>
              <CardDescription>Strict modes and detailed error heatmaps help eliminate bad habits.</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
            <CardHeader>
              <Activity className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Learn Touch Typing</CardTitle>
              <CardDescription>Follow our structured 10-lesson course to master the keyboard layout.</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <Card className="h-full border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
            <CardHeader>
              <Trophy className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Practice Daily</CardTitle>
              <CardDescription>Come back for the daily challenge and track your progress over time.</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Course Preview */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Learn to type</h2>
              <Link href="/learn-typing">
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  View all lessons <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LESSONS.slice(0, 4).map((lesson, i) => (
                <Link key={lesson.slug} href={`/lessons/${lesson.slug}`}>
                  <Card className="h-full cursor-pointer hover:border-primary/50 transition-colors group">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{lesson.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Start typing now — no signup needed</h3>
              <p className="text-muted-foreground max-w-md">Your progress is saved automatically in your browser. Jump right in and start improving.</p>
            </div>
            <Button size="lg" className="mt-6 sm:mt-0 px-8" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Start Test
            </Button>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-border/50 shadow-sm bg-gradient-to-b from-card to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Today's Top Runs
              </CardTitle>
              <CardDescription>Your best performances</CardDescription>
            </CardHeader>
            <CardContent>
              {topRuns.length > 0 ? (
                <div className="space-y-4">
                  {topRuns.map((run, i) => (
                    <div key={run.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{run.wpm} WPM</div>
                          <div className="text-xs text-muted-foreground">{run.accuracy}% Acc • {run.mode}</div>
                        </div>
                      </div>
                      <Link href={`/results/${run.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Complete a test to see your top runs here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
