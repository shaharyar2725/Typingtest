import { useState } from 'react';
import { motion } from 'framer-motion';
import { TypingTest } from '@/components/typing/TypingTest';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

export default function OneMinuteTestPage() {
  useSEO({
    title: "1 Minute Typing Test | TypeFlow",
    description: "Take our free 1-minute typing test to quickly check your words per minute (WPM). The perfect quick drill to track your daily progress.",
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({ ...loadState().settings, mode: 'time', duration: 60 }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
  void setSettings;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-center">1 Minute Typing Test</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center mb-16"
      >
        {!result ? (
          <div className="w-full relative mt-8">
            <div className="flex gap-8 justify-center mb-6 opacity-80 text-sm font-mono font-medium tracking-widest text-muted-foreground uppercase transition-opacity hover:opacity-100">
              <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.wpm}</span>wpm</div>
              <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.accuracy}%</span>acc</div>
              <div className="flex flex-col items-center"><span className="text-2xl text-foreground mb-1">{stats.errors}</span>err</div>
            </div>

            <div className="min-h-[160px] flex items-center justify-center">
              <TypingTest
                mode="time"
                durationSec={60}
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

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-12">
        <h2>Why the 60-Second Test is Ideal</h2>
        <p>
          The 1-minute typing test is the gold standard for quick, reliable speed measurement. It's long enough to smooth out momentary bursts of speed or brief mistakes, but short enough that finger fatigue doesn't skew your results.
        </p>
        <p>
          For most users, testing for one minute provides the most accurate reflection of their practical, everyday typing speed—the kind used when firing off an email, responding in a chat, or writing a quick note.
        </p>
      </article>
    </div>
  );
}
