import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { generateWords } from '@/lib/words';
import { sounds } from '@/lib/sounds';
import { TypingResult, addResult } from '@/lib/storage';
import { RotateCcw } from 'lucide-react';

interface TypingTestProps {
  mode: 'time' | 'words' | 'quote' | 'daily' | 'paragraph';
  durationSec?: number;
  wordCount?: number;
  funMode: 'words' | 'quotes' | 'code' | 'punctuation';
  stopOnError: boolean;
  soundEnabled: boolean;
  onComplete: (result: TypingResult) => void;
  presetText?: string;
  onStatsUpdate?: (stats: { wpm: number; accuracy: number; errors: number }) => void;
  saveToHistory?: boolean;
}

export function TypingTest({
  mode,
  durationSec = 30,
  wordCount = 50,
  funMode,
  stopOnError,
  soundEnabled,
  onComplete,
  presetText,
  onStatsUpdate,
  saveToHistory = true,
}: TypingTestProps) {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [isFocused, setIsFocused] = useState(true);

  // Refs for hot-path values (avoid stale closures in interval / handlers)
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef('');
  const inputValueRef = useRef('');
  const errorsRef = useRef(0);
  const historyRef = useRef<{ t: number; wpm: number; errors: number }[]>([]);
  const missedKeysRef = useRef<Record<string, number>>({});
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  const computeStats = useCallback((nowMs: number) => {
    const startedAt = startTimeRef.current;
    if (!startedAt) return { wpm: 0, accuracy: 100, errors: 0, elapsed: 0 };
    const elapsed = Math.max(0.001, (nowMs - startedAt) / 1000);
    const minutes = elapsed / 60;
    const typed = inputValueRef.current;
    let correctChars = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === textRef.current[i]) correctChars++;
    }
    const grossWpm = (correctChars / 5) / minutes;
    const netWpm = Math.max(0, Math.round(grossWpm - errorsRef.current / minutes));
    const accuracy = typed.length === 0 ? 100 : Math.round((correctChars / typed.length) * 100);
    return { wpm: netWpm || 0, accuracy: accuracy || 0, errors: errorsRef.current, elapsed };
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (soundEnabled) sounds.playFinish();

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
    };

    if (saveToHistory) addResult(result);
    onComplete(result);
  }, [computeStats, mode, presetText, soundEnabled, onComplete, saveToHistory]);

  const reset = useCallback(() => {
    let newText = presetText || '';
    if (!newText) {
      if (mode === 'quote') {
        newText = generateWords('quotes');
      } else if (mode === 'daily') {
        newText = generateWords('words', 50);
      } else {
        newText = generateWords(funMode, wordCount);
      }
    }
    textRef.current = newText;
    inputValueRef.current = '';
    errorsRef.current = 0;
    historyRef.current = [];
    missedKeysRef.current = {};
    startTimeRef.current = null;
    finishedRef.current = false;
    setText(newText);
    setInput('');
    setTimeLeft(durationSec);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onStatsUpdate?.({ wpm: 0, accuracy: 100, errors: 0 });
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [presetText, mode, funMode, wordCount, durationSec, onStatsUpdate]);

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
      onStatsUpdate?.({ wpm: stats.wpm, accuracy: stats.accuracy, errors: stats.errors });
      historyRef.current.push({ t: Math.round(stats.elapsed), wpm: stats.wpm, errors: stats.errors });

      if (mode === 'time') {
        const remaining = Math.max(0, durationSec - stats.elapsed);
        setTimeLeft(Math.ceil(remaining));
        if (remaining <= 0) finish();
      }
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
        if (soundEnabled) sounds.playError();
        if (stopOnError) {
          // refresh stats so error count goes up immediately
          const stats = computeStats(Date.now());
          onStatsUpdate?.({ wpm: stats.wpm, accuracy: stats.accuracy, errors: stats.errors });
          return;
        }
      } else {
        if (soundEnabled) sounds.playKey();
      }
    } else if (isDeletion) {
      if (soundEnabled) sounds.playKey();
    }

    inputValueRef.current = val;
    setInput(val);

    // refresh stats immediately on each keystroke
    const stats = computeStats(Date.now());
    onStatsUpdate?.({ wpm: stats.wpm, accuracy: stats.accuracy, errors: stats.errors });

    if (val.length >= textRef.current.length) {
      finish();
    }
  };

  const words = useMemo(() => text.split(' '), [text]);
  let globalCharIndex = 0;
  const currentWordIndex = input.length === text.length
    ? words.length - 1
    : text.slice(0, input.length).split(' ').length - 1;

  const focusInput = () => inputRef.current?.focus();

  return (
    <div
      className="relative w-full max-w-full mx-auto"
      onClick={focusInput}
      onTouchStart={focusInput}
    >
      {/* Hidden but reachable input — font-size 16px+ prevents iOS zoom */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-default text-base"
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

      {/* Focus overlay */}
      {!isFocused && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl cursor-pointer"
          onClick={focusInput}
          onTouchStart={focusInput}
        >
          <span className="text-foreground font-semibold text-sm sm:text-base px-4 py-2 rounded-lg bg-card border border-border shadow-sm">
            Tap to focus
          </span>
        </div>
      )}

      {/* Timer */}
      {mode === 'time' && (
        <div className="text-primary font-mono text-xl sm:text-2xl mb-3 sm:mb-4">
          {Math.ceil(timeLeft)}s
        </div>
      )}

      {/* Typing Area */}
      <div className="text-xl sm:text-2xl md:text-3xl leading-relaxed font-mono select-none outline-none break-words overflow-hidden">
        {words.map((word, wordIndex) => {
          const isCurrentWord = wordIndex === currentWordIndex;
          return (
            <span
              key={wordIndex}
              className={`inline-block mr-[0.5em] rounded ${isCurrentWord ? 'bg-primary/5' : ''}`}
            >
              {word.split('').map((char, charIndexInWord) => {
                const charIndex = globalCharIndex++;
                const typedChar = input[charIndex];
                const isCurrentChar = charIndex === input.length;
                let className = 'text-muted-foreground/40';
                if (typedChar !== undefined) {
                  className = typedChar === char
                    ? 'text-foreground'
                    : 'text-destructive bg-destructive/10 rounded-sm';
                }
                return (
                  <span key={charIndexInWord} className="relative">
                    <span className={className}>{char}</span>
                    {isCurrentChar && isFocused && (
                      <span className="absolute left-0 bottom-0 w-full h-[3px] bg-primary animate-pulse rounded-full" />
                    )}
                  </span>
                );
              })}
              {/* trailing space cursor */}
              {wordIndex < words.length - 1 && (() => {
                const spaceIndex = globalCharIndex++;
                const isCurrentChar = spaceIndex === input.length;
                return isCurrentChar && isFocused ? (
                  <span className="relative inline-block w-[0.4em]">
                    <span className="absolute left-0 bottom-0 w-full h-[3px] bg-primary animate-pulse rounded-full" />
                  </span>
                ) : null;
              })()}
            </span>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8 flex justify-center text-sm text-muted-foreground">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); reset(); }}
          className="hover:text-foreground transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
}
