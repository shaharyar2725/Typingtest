import { useMemo } from 'react';
import { Settings, RotateCcw, Clock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppState } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingHeaderProps {
  settings: AppState['settings'];
  onSettingsChange: (s: Partial<AppState['settings']>) => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  timeLeft?: number;
  isRunning?: boolean;
  /** When true, hides mode switcher, settings gear, and duration chips. */
  lockSettings?: boolean;
  /** Optional label shown in place of mode pills when lockSettings is true. */
  lockedLabel?: string;
}

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];

export function TypingHeader({
  settings,
  onSettingsChange,
  onRestart,
  onOpenSettings,
  onOpenAuth,
  timeLeft,
  isRunning,
  lockSettings = false,
  lockedLabel,
}: TypingHeaderProps) {
  const { user, signOut } = useAuth();

  const isTimeMode = settings.mode === 'time' || settings.mode === 'quote' || settings.mode === 'daily';

  const displayTime = useMemo(() => {
    const sec = timeLeft !== undefined ? Math.ceil(timeLeft) : settings.duration;
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [timeLeft, settings.duration]);

  const progress = useMemo(() => {
    if (!isRunning || timeLeft === undefined) return 0;
    return Math.max(0, Math.min(1, 1 - timeLeft / settings.duration));
  }, [isRunning, timeLeft, settings.duration]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top bar: mode pills (left) + actions (right). Stacks on mobile. */}
      <div className="relative bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Locked label only — mode pills removed per design */}
          <div className="flex items-center justify-center sm:justify-start gap-1 flex-1 min-w-0 order-2 sm:order-1">
            {lockSettings && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/15 text-primary">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{lockedLabel ?? `${settings.duration}s • Competition`}</span>
              </div>
            )}
          </div>

          {/* Right cluster: timer + restart + settings + auth */}
          <div className="flex items-center justify-end gap-1 shrink-0 order-1 sm:order-2">
            {settings.mode === 'time' && (
              <div className="font-mono font-bold text-sm tabular-nums px-2 mr-auto sm:mr-0">
                {displayTime}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={onRestart}
              title="Restart"
              aria-label="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            {!lockSettings && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={onOpenSettings}
                title="Settings"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors shrink-0"
                    title={user.username}
                    aria-label="Account"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center font-bold text-xs">
                        {user.username[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs">
                    <div className="font-semibold truncate">{user.username}</div>
                    <div className="text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <DropdownMenuItem onSelect={signOut} className="text-destructive">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="ml-1 h-9 font-semibold rounded-xl px-3"
                onClick={onOpenAuth}
              >
                <LogIn className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar — animates as test runs */}
        <AnimatePresence>
          {isRunning && settings.mode === 'time' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"
            >
              <div
                className="h-full bg-primary transition-[width] duration-200 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Duration / word-count chips row */}
      {!lockSettings && (
      <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
        {(isTimeMode ? TIME_OPTIONS : WORD_OPTIONS).map((opt) => {
          const current = isTimeMode ? settings.duration : settings.wordCount;
          const active = current === opt;
          const label = isTimeMode ? (opt < 60 ? `${opt}s` : `${opt / 60}m`) : `${opt}`;
          return (
            <button
              key={opt}
              onClick={() => onSettingsChange(isTimeMode ? { duration: opt } : { wordCount: opt })}
              className={`px-3.5 py-1 rounded-full text-xs font-bold tabular-nums transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-pressed={active}
            >
              {label}
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}
