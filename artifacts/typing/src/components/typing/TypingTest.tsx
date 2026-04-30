import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { generateWords } from '@/lib/words';
import { sounds } from '@/lib/sounds';
import { TypingResult } from '@/lib/storage';

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
  onStatsUpdate
}: TypingTestProps) {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [history, setHistory] = useState<{ t: number; wpm: number; errors: number }[]>([]);
  const [missedKeys, setMissedKeys] = useState<Record<string, number>>({});
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    let newText = presetText || '';
    if (!newText) {
      if (mode === 'words' || mode === 'time') {
        newText = generateWords(funMode, wordCount);
      } else if (mode === 'quote') {
        newText = generateWords('quotes');
      } else if (mode === 'daily') {
        newText = generateWords('words', 50); // Fallback if daily isn't passed via presetText
      } else {
        newText = generateWords(funMode, wordCount);
      }
    }
    setText(newText);
    setInput('');
    setStartTime(null);
    setErrors(0);
    setTimeLeft(durationSec);
    setHistory([]);
    setMissedKeys({});
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (onStatsUpdate) {
      onStatsUpdate({ wpm: 0, accuracy: 100, errors: 0 });
    }
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [presetText, mode, funMode, wordCount, durationSec, onStatsUpdate]);

  useEffect(() => {
    reset();
  }, [reset]);

  const finishTest = useCallback((finalInput: string, finalErrors: number, finalHistory: any[], finalMissedKeys: any) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundEnabled) sounds.playFinish();

    const totalTime = startTime ? (Date.now() - startTime) / 1000 : durationSec;
    const actualDuration = Math.min(totalTime, durationSec);
    const minutes = actualDuration / 60;
    
    // Calculate net WPM based on standard formula (5 chars = 1 word)
    const correctChars = finalInput.split('').filter((c, i) => c === text[i]).length;
    const grossWpm = (correctChars / 5) / minutes;
    const netWpm = Math.max(0, Math.round(grossWpm - (finalErrors / minutes)));
    const accuracy = Math.round((correctChars / Math.max(1, finalInput.length)) * 100);

    onComplete({
      id: crypto.randomUUID(),
      mode: presetText ? 'lesson' : mode,
      durationSec: Math.round(actualDuration),
      wpm: netWpm || 0,
      accuracy: accuracy || 0,
      errors: finalErrors,
      timestamp: Date.now(),
      snippet: text.slice(0, 80),
      history: finalHistory,
      missedKeys: finalMissedKeys,
    });
  }, [startTime, durationSec, text, mode, presetText, soundEnabled, onComplete]);

  useEffect(() => {
    let tabPressed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = true;
        e.preventDefault();
      } else if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        reset();
        tabPressed = false;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') tabPressed = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [reset]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
      if (soundEnabled) sounds.init();
      
      timerRef.current = setInterval(() => {
        setStartTime((prevStartTime) => {
          if (!prevStartTime) return prevStartTime;
          
          const elapsed = (Date.now() - prevStartTime) / 1000;
          setTimeLeft((prev) => {
            if (mode === 'time') {
              const newTime = Math.max(0, durationSec - elapsed);
              if (newTime === 0) {
                finishTest(input, errors, history, missedKeys);
                return 0;
              }
              return Math.ceil(newTime);
            }
            return prev; // For words mode, we don't count down time visually
          });

          setInput((currentInput) => {
            setErrors((currentErrors) => {
              setHistory((prevHistory) => {
                const mins = elapsed / 60;
                const correctChars = currentInput.split('').filter((c, i) => c === text[i]).length;
                const grossWpm = (correctChars / 5) / mins;
                const netWpm = Math.max(0, Math.round(grossWpm - (currentErrors / mins)));
                const accuracy = Math.round((correctChars / Math.max(1, currentInput.length)) * 100);
                
                if (onStatsUpdate) {
                  onStatsUpdate({ wpm: netWpm || 0, accuracy: accuracy || 100, errors: currentErrors });
                }

                return [...prevHistory, { t: Math.round(elapsed), wpm: netWpm || 0, errors: currentErrors }];
              });
              return currentErrors;
            });
            return currentInput;
          });

          return prevStartTime;
        });
      }, 1000);
    }

    const isDeletion = val.length < input.length;
    
    if (!isDeletion) {
      const charTyped = val.slice(-1);
      const targetChar = text[input.length];
      
      if (charTyped !== targetChar) {
        setErrors(e => e + 1);
        setMissedKeys(prev => ({
          ...prev,
          [targetChar]: (prev[targetChar] || 0) + 1
        }));
        if (soundEnabled) sounds.playError();
        
        if (stopOnError) {
          return; // Don't advance
        }
      } else {
        if (soundEnabled) sounds.playKey();
      }
    } else {
      if (soundEnabled) sounds.playKey();
    }

    setInput(val);

    if (val.length >= text.length) {
      finishTest(val, errors, history, missedKeys);
    }
  };

  const words = useMemo(() => text.split(' '), [text]);
  const inputWords = input.split(' ');
  const currentWordIndex = input.length === text.length ? words.length - 1 : text.slice(0, input.length).split(' ').length - 1;

  let globalCharIndex = 0;

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto"
      onClick={() => inputRef.current?.focus()}
      ref={containerRef}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 cursor-default"
        value={input}
        onChange={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Focus overlay */}
      {!isFocused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl cursor-pointer">
          <span className="text-foreground font-medium flex items-center gap-2">
            Click to focus
          </span>
        </div>
      )}

      {/* Timer */}
      {mode === 'time' && (
        <div className="text-primary font-mono text-2xl mb-4 transition-all duration-200">
          {Math.ceil(timeLeft)}s
        </div>
      )}

      {/* Typing Area */}
      <div className="text-2xl md:text-3xl leading-relaxed font-mono select-none outline-none break-words">
        {words.map((word, wordIndex) => {
          const isCurrentWord = wordIndex === currentWordIndex;
          
          return (
            <span 
              key={wordIndex} 
              className={`inline-block mr-[0.5em] rounded transition-colors duration-150 ${isCurrentWord ? 'bg-primary/5' : ''}`}
            >
              {word.split('').map((char, charIndexInWord) => {
                const charIndex = globalCharIndex++;
                const typedChar = input[charIndex];
                const isCurrentChar = charIndex === input.length;
                
                let className = 'text-muted-foreground/40 transition-colors duration-75'; // untyped
                
                if (typedChar) {
                  if (typedChar === char) {
                    className = 'text-foreground'; // correct
                  } else {
                    className = 'text-destructive bg-destructive/10 rounded-sm'; // incorrect
                  }
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
            </span>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center text-sm text-muted-foreground">
        <button onClick={reset} className="hover:text-foreground transition-colors flex items-center gap-2">
          <span>⟳ Restart</span>
          <span className="text-xs opacity-50 px-1.5 py-0.5 bg-muted rounded">Tab + Enter</span>
        </button>
      </div>
    </div>
  );
}
