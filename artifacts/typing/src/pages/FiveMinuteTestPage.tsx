import { useState } from 'react';
import { TypingTest } from '@/components/typing/TypingTest';
import { TypingHeader } from '@/components/typing/TypingHeader';
import { ResultCard } from '@/components/typing/ResultCard';
import { loadState, updateSettings, AppState, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/5-minute-typing-test`;

export default function FiveMinuteTestPage() {
  useSEO({
    title: '5 Minute Typing Test — Endurance WPM | TypeFlow',
    description:
      'Take the free 5-minute typing test and discover your sustained WPM speed. The ultimate endurance challenge to prove you can maintain your pace over time.',
    keywords:
      '5 minute typing test, five minute typing test, endurance typing test, sustained wpm, typing speed endurance',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'TypeFlow 5 Minute Typing Test',
        url: PAGE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any (web browser)',
        description:
          'Free 5-minute typing endurance test. Measures sustained words per minute (WPM) and accuracy with live feedback. No signup required.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: '5 Minute Typing Test', item: PAGE_URL },
        ],
      },
    ],
  });

  const [settings, setSettings] = useState<AppState['settings']>(() => ({
    ...loadState().settings,
    mode: 'time',
    duration: 300,
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
    setSettings((prev) => ({ ...prev, ...saved, mode: 'time', duration: 300 }));
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
          5 Minute Typing Test
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-snug">
          The endurance challenge: type for a full five minutes and find out your sustained WPM.
          Live feedback, no signup, free forever.
        </p>
      </header>

      <section aria-label="5 minute typing test" className="mb-16">
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
                durationSec={300}
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
        <h2>The Endurance Challenge</h2>
        <p>
          While a 1-minute test measures your sprint speed, a 5-minute test measures your marathon
          pace. Maintaining high speed and accuracy for five continuous minutes requires significant
          focus and well-developed muscle memory.
        </p>
        <p>
          Many professional data-entry and transcription jobs require candidates to pass a 5-minute
          typing test to prove they can sustain their speed over long working sessions without
          succumbing to finger fatigue.
        </p>
        <h3>How to pace yourself over 5 minutes</h3>
        <p>
          The most common mistake is sprinting through the first minute and slowing down sharply
          afterwards. Aim for a steady rhythm — choose a comfortable WPM target and hold it rather
          than burning out. Watch your live WPM in the header to stay on track.
        </p>
        <h3>Who should use the 5-minute test?</h3>
        <p>
          Anyone preparing for a job that requires sustained typing — transcriptionists, writers,
          legal secretaries, data-entry clerks — should practice with 5-minute sessions regularly.
          Use the settings gear above to adjust word source, font size, and visible lines to match
          your preferred working setup.
        </p>
      </article>
    </div>
  );
}
