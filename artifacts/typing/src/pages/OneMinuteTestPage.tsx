import { useState } from 'react';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/1-minute-typing-test`;

export default function OneMinuteTestPage() {
  useSEO({
    title: '1 Minute Typing Test — WPM Speed Check | TypeFlow',
    description:
      'Take the free 1-minute typing test and get your WPM and accuracy instantly. The quickest way to measure your typing speed — no signup needed.',
    keywords:
      '1 minute typing test, one minute typing test, 60 second typing test, wpm test, typing speed test',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow 1 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 60-second typing test. Measures words per minute (WPM) and accuracy with live feedback. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: '1 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 60,
  }));
  const [result, setResult] = useState<TypingResult | null>(null);
  const [stats, setStats] = useState<{ wpm: number; accuracy: number; errors: number; timeLeft?: number }>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
  });
  const [restartKey, setRestartKey] = useState(0);

  const handleSettingsChange = (newSettings: Partial<AppState['settings']>) => {
    const saved = updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 60 }));
    if ('fontSize' in newSettings || 'funMode' in newSettings) {
      setResult(null);
      setStats({ wpm: 0, accuracy: 100, errors: 0 });
      setRestartKey((k) => k + 1);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setStats({ wpm: 0, accuracy: 100, errors: 0 });
    setRestartKey((k) => k + 1);
  };

  const isRunning = stats.timeLeft !== undefined && stats.timeLeft > 0 && !result;

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">

      <header className="text-center mb-6 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          1 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          Type as many words as you can in 60 seconds. Your WPM and accuracy are calculated live.
          No signup needed — your score is ready the moment time runs out.
        </p>
      </header>

      <section aria-label="1 minute typing test" className="mb-16">
        {!result ? (
          <div>
            <TypingHeader
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onRestart={handleRestart}
              timeLeft={stats.timeLeft}
              isRunning={isRunning}
              lockSettings
            />

            <div className="min-h-[180px] flex items-center justify-center mt-10">
              <TypingTest
                key={restartKey}
                mode="time"
                durationSec={60}
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
          <ResultCard result={result} onRestart={handleRestart} />
        )}
      </section>

      <article className="max-w-3xl mx-auto prose dark:prose-invert mt-12">
        <h2>Why the 60-Second Test is Ideal</h2>
        <p>
          The 1-minute typing test is the gold standard for quick, reliable speed measurement.
          It's long enough to smooth out momentary bursts of speed or brief mistakes, but short enough
          that finger fatigue doesn't skew your results.
        </p>
        <p>
          For most users, testing for one minute provides the most accurate reflection of their
          practical, everyday typing speed — the kind used when firing off an email, responding in a
          chat, or writing a quick note.
        </p>
        <h3>How your WPM is calculated</h3>
        <p>
          Each group of five characters counts as one word. TypeFlow divides the total correctly-typed
          characters by five, then divides by the elapsed minutes — giving you net WPM after
          subtracting errors. Accuracy is the percentage of keystrokes that were correct.
        </p>
        <h3>Tips to improve your 1-minute score</h3>
        <p>
          Keep your fingers on the home row (ASDF · JKL;), never look at the keyboard, and focus on
          accuracy before speed. A clean, 95%+ accurate run at 50 WPM will build faster muscle memory
          than a sloppy 70 WPM run. Use the settings gear above to switch between word sources or
          adjust font size for comfort.
        </p>
      </article>
    </div>
  );
}
