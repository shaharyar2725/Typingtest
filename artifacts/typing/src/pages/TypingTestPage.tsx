import { useState } from 'react';
import { motion } from 'framer-motion';
import { TypingTest } from '@/components/typing/TypingTest';
import { Controls } from '@/components/typing/Controls';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

export default function TypingTestPage() {
  useSEO({
    title: "Free Typing Test | Check Your WPM | TypeFlow",
    description: "Take our free typing test to find out your words per minute (WPM) and accuracy. Improve your typing speed with our interactive tool.",
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => loadState().settings);
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const updated = updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-8 md:py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-center">Typing Test</h1>
      
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

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-12">
        <h2>What is a Typing Test?</h2>
        <p>
          A typing test is an online assessment that measures your typing speed and accuracy. 
          By typing a given passage of text as quickly and accurately as possible within a set timeframe, 
          you can determine your Words Per Minute (WPM) score.
        </p>

        <h2>How WPM Works</h2>
        <p>
          Words Per Minute (WPM) is the standard metric for typing speed. To ensure fairness across different 
          languages and texts, a "word" is standardized as exactly 5 characters (including spaces). 
          Net WPM takes your gross speed and subtracts any uncorrected errors, giving you a true measure 
          of your productive typing speed.
        </p>

        <h2>Average WPM Benchmarks</h2>
        <ul>
          <li><strong>Average Typist:</strong> 40 WPM</li>
          <li><strong>Above Average:</strong> 60 WPM</li>
          <li><strong>Productive Professional:</strong> 70-80 WPM</li>
          <li><strong>Fast Typist:</strong> 90-100 WPM</li>
          <li><strong>Competitive Typist:</strong> 120+ WPM</li>
        </ul>

        <h2>Tips for Faster Typing</h2>
        <p>
          The secret to fast typing isn't moving your fingers faster—it's building muscle memory. 
          Start by ensuring your hands rest on the home row (ASDF JKL;). Focus entirely on accuracy first; 
          speed will naturally follow once your fingers know exactly where to go without looking at the keyboard.
        </p>
      </article>
    </div>
  );
}
