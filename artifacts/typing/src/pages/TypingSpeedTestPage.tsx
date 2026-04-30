import { useState } from 'react';
import { motion } from 'framer-motion';
import { TypingTest } from '@/components/typing/TypingTest';
import { Controls } from '@/components/typing/Controls';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

export default function TypingSpeedTestPage() {
  useSEO({
    title: "Typing Speed Test | Check Your Keyboard Speed | TypeFlow",
    description: "Measure your typing speed and accuracy with our advanced typing speed test. Discover your true WPM and improve your keyboard skills.",
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
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-center">Typing Speed Test</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center mb-16"
      >
        {!result ? (
          <div className="w-full relative">
            <Controls timeLeft={(stats as any).timeLeft} durationSec={settings.duration}
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
                soundOnError={settings.soundOnError}
                soundOnSuccess={settings.soundOnSuccess}
                soundOnKey={settings.soundOnKey}
                fontSize={settings.fontSize}
                linesVisible={settings.linesVisible}
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
        <h2>Speed Benchmarks by Profession</h2>
        <p>
          Different professions require different typing speeds. While casual computer users average around 40 WPM, professionals who spend most of their day at a keyboard typically hit much higher speeds:
        </p>
        <ul>
          <li><strong>Data Entry & Transcription:</strong> 60-80 WPM minimum requirement.</li>
          <li><strong>Programmers & Developers:</strong> 50-70 WPM. Accuracy is often prioritized over raw speed, but fast typing helps maintain flow state.</li>
          <li><strong>Executive Assistants & Secretaries:</strong> 65-90 WPM.</li>
          <li><strong>Writers & Journalists:</strong> 70-100 WPM to keep up with their train of thought.</li>
        </ul>

        <h2>How to Increase Your Typing Speed</h2>
        <p>
          Speed is the byproduct of accuracy and consistency. If you want to type faster, you first need to stop making mistakes. 
        </p>
        <p>
          <strong>1. Don't look at the keyboard.</strong> This is the hardest habit to break, but the most important. Looking down forces your brain to constantly shift context.
        </p>
        <p>
          <strong>2. Maintain good posture.</strong> Sit up straight, keep your wrists slightly elevated above the keyboard (not resting on the desk), and strike the keys with the pads of your fingers.
        </p>
        <p>
          <strong>3. Find your rhythm.</strong> Fast typists don't type in bursts; they type in a continuous, flowing rhythm. Try to maintain a steady pace rather than rushing easy words and pausing at hard ones.
        </p>
      </article>
    </div>
  );
}
