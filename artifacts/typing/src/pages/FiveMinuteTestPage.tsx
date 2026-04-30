import { useState } from 'react';
import { motion } from 'framer-motion';
import { TypingTest } from '@/components/typing/TypingTest';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

export default function FiveMinuteTestPage() {
  useSEO({
    title: "5 Minute Typing Test | Endurance Typing | TypeFlow",
    description: "Challenge your typing endurance with our 5-minute typing test. Discover your sustained words per minute (WPM) speed.",
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({ ...loadState().settings, mode: 'time', duration: 300 }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });

  void setSettings;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-center">5 Minute Typing Test</h1>
      
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
                durationSec={300}
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
        <h2>The Endurance Challenge</h2>
        <p>
          While a 1-minute test measures your sprint speed, a 5-minute test measures your marathon pace. Maintaining high speed and accuracy for five continuous minutes requires significant focus and well-developed muscle memory.
        </p>
        <p>
          Many professional data entry and transcription jobs require candidates to pass a 5-minute typing test to prove they can sustain their speed over long working sessions without succumbing to finger fatigue.
        </p>
      </article>
    </div>
  );
}
