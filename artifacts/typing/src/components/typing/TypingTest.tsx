import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { generateWords } from '@/lib/words';
import { sounds } from '@/lib/sounds';
import { TypingResult, addResult } from '@/lib/storage';

interface TypingTestProps {
  mode: 'time' | 'words' | 'quote' | 'daily' | 'paragraph';
  durationSec?: number;
  wordCount?: number;
  funMode: 'words' | 'quotes' | 'code' | 'punctuation';
  stopOnError: boolean;
  soundEnabled: boolean;
  soundOnError?: boolean;
  soundOnSuccess?: boolean;
  soundOnKey?: boolean;
  onComplete: (result: TypingResult) => void;
  presetText?: string;
  onStatsUpdate?: (stats: { wpm: number; accuracy: number; errors: number; timeLeft?: number }) => void;
  saveToHistory?: boolean;
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  linesVisible?: 1 | 2 | 3 | 4 | 5 | 10 | 15 | 20;
}

const FONT_SIZE_CLASSES: Record<string, string> = {
  xs: 'text-base sm:text-lg md:text-xl leading-[1.5em]',
  sm: 'text-lg sm:text-xl md:text-2xl leading-[1.5em]',
  md: 'text-2xl sm:text-3xl md:text-4xl leading-[1.5em]',
  lg: 'text-3xl sm:text-4xl md:text-5xl leading-[1.5em]',
  xl: 'text-4xl sm:text-5xl md:text-6xl leading-[1.5em]',
};

export function TypingTest({
  mode,
  durationSec = 60,
  wordCount = 50,
  funMode,
  stopOnError,
  soundEnabled,
  soundOnError = true,
  soundOnSuccess = true,
  soundOnKey = false,
  onComplete,
  presetText,
  onStatsUpdate,
  saveToHistory = true,
  fontSize = 'md',
  linesVisible = 2,
}: TypingTestProps) {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [activeBadge, setActiveBadge] = useState<{ left: number; top: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  const textRef = useRef('');
  const inputValueRef = useRef('');
  const errorsRef = useRef(0);
  const modificationsRef = useRef(0);
  const historyRef = useRef<{ t: number; wpm: number; errors: number }[]>([]);
  const missedKeysRef = useRef<Record<string, number>>({});
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const lastSecondRef = useRef(0);

  const computeStats = useCallback((nowMs: number) => {
    const startedAt = startTimeRef.current;
    if (!startedAt) return { wpm: 0, accuracy: 100, errors: 0, elapsed: 0 };
    const elapsed = Math.max(0.001, (nowMs - startedAt) / 1000);
    const minutes = elapsed / 60;
    const typed = inputValueRef.current;
    const target = textRef.current;

    // Count correct characters at each position
    let correctChars = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correctChars++;
    }

    // Standard formula:
    // Gross WPM = all characters typed (right or wrong) / 5 / minutes
    // Uncorrected errors = wrong chars still present in the typed text (NOT cumulative keystroke errors)
    // Net WPM = Gross WPM - (uncorrected errors / minutes)
    // Accuracy = correct chars / total chars typed
    const totalTyped = typed.length;
    const uncorrectedErrors = totalTyped - correctChars;
    const grossWpm = (totalTyped / 5) / minutes;
    const netWpm = Math.max(0, Math.round(grossWpm - uncorrectedErrors / minutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);

    return { wpm: netWpm, accuracy, errors: uncorrectedErrors, elapsed };
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (soundEnabled && soundOnSuccess) sounds.playFinish();

    const { wpm, accuracy, errors, elapsed } = computeStats(Date.now());

    const result: TypingResult = {
      id: crypto.randomUUID(),
      mode: presetText ? 'lesson' : mode,
      durationSec: Math.round(elapsed),
      wpm,
      accuracy,
      errors,
      timestamp: Date.now(),
      snippet: textRef.current.slice(0, 80),
      history: historyRef.current,
      missedKeys: missedKeysRef.current,
      modifications: modificationsRef.current,
    };

    if (saveToHistory) addResult(result);
    onComplete(result);
  }, [computeStats, mode, presetText, soundEnabled, soundOnSuccess, onComplete, saveToHistory]);

  const reset = useCallback(() => {
    let newText = presetText || '';
    if (!newText) {
      if (mode === 'quote') {
        newText = generateWords('quotes', 50);
      } else if (mode === 'daily') {
        newText = generateWords('words', 50);
      } else if (mode === 'time') {
        // Generate plenty of words for time-based tests
        newText = generateWords(funMode, 200);
      } else {
        newText = generateWords(funMode, wordCount);
      }
    }
    textRef.current = newText;
    inputValueRef.current = '';
    errorsRef.current = 0;
    modificationsRef.current = 0;
    historyRef.current = [];
    missedKeysRef.current = {};
    startTimeRef.current = null;
    finishedRef.current = false;
    lastSecondRef.current = 0;
    setText(newText);
    setInput('');
    setScrollY(0);
    setLiveWpm(0);
    setActiveBadge(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onStatsUpdate?.({ wpm: 0, accuracy: 100, errors: 0 });
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [presetText, mode, funMode, wordCount, onStatsUpdate]);

  useEffect(() => {
    reset();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reset]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    startTimeRef.current = Date.now();
    if (soundEnabled) sounds.init();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const stats = computeStats(now);
      const remaining = mode === 'time' ? Math.max(0, durationSec - stats.elapsed) : undefined;
      setLiveWpm(stats.wpm);
      onStatsUpdate?.({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        timeLeft: remaining,
      });

      const sec = Math.round(stats.elapsed);
      if (sec > lastSecondRef.current) {
        lastSecondRef.current = sec;
        historyRef.current.push({ t: sec, wpm: stats.wpm, errors: stats.errors });
      }

      if (mode === 'time' && remaining !== undefined && remaining <= 0) finish();
    }, 250);
  }, [computeStats, durationSec, finish, mode, onStatsUpdate, soundEnabled]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finishedRef.current) return;
    const val = e.target.value;
    const prev = inputValueRef.current;

    if (val.length === 0 && prev.length === 0) return;
    if (!startTimeRef.current && val.length > 0) startTimer();

    const isDeletion = val.length < prev.length;

    if (!isDeletion && val.length > prev.length) {
      const charTyped = val[val.length - 1];
      const targetChar = textRef.current[val.length - 1];

      if (charTyped !== targetChar) {
        errorsRef.current += 1;
        missedKeysRef.current[targetChar] = (missedKeysRef.current[targetChar] || 0) + 1;
        if (soundEnabled && soundOnError) sounds.playError();
        if (stopOnError) {
          const stats = computeStats(Date.now());
          onStatsUpdate?.({ wpm: stats.wpm, accuracy: stats.accuracy, errors: stats.errors });
          return;
        }
      } else {
        if (soundEnabled && soundOnKey) sounds.playKey();
      }
    } else if (isDeletion) {
      modificationsRef.current += 1;
      if (soundEnabled && soundOnKey) sounds.playKey();
    }

    inputValueRef.current = val;
    setInput(val);

    const stats = computeStats(Date.now());
    setLiveWpm(stats.wpm);
    onStatsUpdate?.({ wpm: stats.wpm, accuracy: stats.accuracy, errors: stats.errors });

    if (val.length >= textRef.current.length) {
      finish();
    }
  };

  const words = useMemo(() => text.split(' '), [text]);

  // Keep the active character aligned to the top visible line.
  // getBoundingClientRect returns post-transform positions — because the transform
  // on the flow div shifts both rects equally, the difference is always the
  // untransformed offset, so scrollY does NOT need to be in the dependency array.
  useLayoutEffect(() => {
    if (!activeCharRef.current || !flowRef.current || !viewportRef.current) return;
    const active = activeCharRef.current;
    const flow = flowRef.current;
    const viewport = viewportRef.current;

    // Measure real line height from computed style — inline span.offsetHeight is 0.
    const computedLH = parseFloat(getComputedStyle(flow).lineHeight);
    const parentH = (active.parentElement as HTMLElement | null)?.offsetHeight ?? 0;
    const lineH =
      Number.isFinite(computedLH) && computedLH > 4
        ? computedLH
        : parentH > 0
        ? parentH
        : 40;

    // Natural offset of active char from flow's top (transform cancels in both rects).
    const offset = active.getBoundingClientRect().top - flow.getBoundingClientRect().top;
    const targetLine = Math.max(0, Math.floor(offset / lineH));
    const target = Math.round(targetLine * lineH);

    setScrollY(prev => (prev === target ? prev : target));

    // Position the live-WPM badge above the active character
    const activeRect = active.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const left = activeRect.left - viewportRect.left + activeRect.width / 2;
    const top = activeRect.top - viewportRect.top;
    setActiveBadge({ left, top });
  // scrollY intentionally excluded — transforms cancel out in getBoundingClientRect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, text]);

  const focusInput = () => inputRef.current?.focus();

  let charCounter = 0;

  return (
    <div
      className="relative w-full max-w-full mx-auto"
      onClick={focusInput}
      onTouchStart={focusInput}
    >
      {/* Hidden input — font-size 16px+ prevents iOS zoom */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default"
        style={{ fontSize: '16px' }}
        value={input}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {!isFocused && (
        <div
          className="absolute inset-0 z-10 flex items-end justify-center pb-2 cursor-pointer"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, hsl(var(--background) / 0.25) 100%)' }}
          onClick={focusInput}
          onTouchStart={focusInput}
        >
          <span className="text-muted-foreground/60 text-[11px] tracking-wide">
            click to focus
          </span>
        </div>
      )}

      {/* N-line viewport with sliding flow inside (height = lines × 1.5em line-height) */}
      <div
        ref={viewportRef}
        className={`relative overflow-visible font-serif ${FONT_SIZE_CLASSES[fontSize]}`}
        style={{ height: `${linesVisible * 1.5}em` }}
      >
        {/* Live WPM badge anchored above the active character */}
        {activeBadge && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full text-primary font-bold tabular-nums leading-none"
            style={{
              left: `${activeBadge.left}px`,
              top: `${activeBadge.top}px`,
              fontSize: '0.5em',
              marginTop: '-0.25em',
            }}
            aria-hidden="true"
          >
            {liveWpm}
          </div>
        )}
        <div className="overflow-hidden" style={{ height: `${linesVisible * 1.5}em` }}>
        <div
          ref={flowRef}
          className="select-none break-words transition-transform duration-200 ease-in-out"
          style={{ transform: `translateY(-${scrollY}px)` }}
        >
          {words.map((word, wi) => {
            const wordChars = word.split('');
            const isLast = wi === words.length - 1;

            return (
              <span key={wi} className="inline-block whitespace-nowrap mr-[0.4em]">
                {wordChars.map((ch, ci) => {
                  const idx = charCounter++;
                  const typed = input[idx];
                  const isActive = idx === input.length;
                  let cls = 'text-muted-foreground/50';
                  if (typed !== undefined) {
                    cls = typed === ch
                      ? 'text-foreground'
                      : 'text-destructive bg-destructive/15 rounded';
                  }
                  if (isActive) cls += ' bg-primary/25 rounded';
                  return (
                    <span
                      key={ci}
                      ref={isActive ? activeCharRef : null}
                      className={cls}
                    >
                      {ch}
                    </span>
                  );
                })}
                {!isLast && (() => {
                  const idx = charCounter++;
                  const isActive = idx === input.length;
                  return (
                    <span
                      ref={isActive ? activeCharRef : null}
                      className={isActive ? 'bg-primary/25 rounded' : ''}
                    >
                      {' '}
                    </span>
                  );
                })()}
              </span>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
