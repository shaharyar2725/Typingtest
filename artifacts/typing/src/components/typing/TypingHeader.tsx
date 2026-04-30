import { useMemo, useState } from 'react';
import { Settings, RotateCcw, Clock, Hash, Zap, ChevronDown, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGUAGES, LANGUAGE_BY_CODE } from '@/lib/languages';
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
}: TypingHeaderProps) {
  const { user, signOut } = useAuth();
  const [langOpen, setLangOpen] = useState(false);

  const lang = LANGUAGE_BY_CODE[settings.language] ?? LANGUAGE_BY_CODE.en;
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
      {/* Main bar — single elevated capsule with three segments */}
      <div className="relative bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-stretch divide-x divide-border">
          {/* Language segment */}
          <DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors min-w-0"
                data-testid="lang-trigger"
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <span className="font-semibold text-sm truncate hidden sm:inline">{lang.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-auto">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onSelect={() => onSettingsChange({ language: l.code })}
                  className={settings.language === l.code ? 'bg-primary/10 text-primary font-semibold' : ''}
                >
                  <span className="text-lg mr-2">{l.flag}</span>
                  <span className="flex-1">{l.name}</span>
                  {l.dir === 'rtl' && (
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground">RTL</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mode + count segment (center, grows) */}
          <div className="flex-1 flex items-center justify-center gap-1 px-3 py-2 min-w-0">
            <ModePill
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Time"
              active={settings.mode === 'time'}
              onClick={() => onSettingsChange({ mode: 'time' })}
            />
            <ModePill
              icon={<Hash className="w-3.5 h-3.5" />}
              label="Words"
              active={settings.mode === 'words'}
              onClick={() => onSettingsChange({ mode: 'words' })}
            />
            <ModePill
              icon={<Zap className="w-3.5 h-3.5" />}
              label="Quote"
              active={settings.mode === 'quote'}
              onClick={() => onSettingsChange({ mode: 'quote' })}
            />
          </div>

          {/* Right cluster: timer + restart + settings + auth */}
          <div className="flex items-center gap-1 px-2">
            {settings.mode === 'time' && (
              <div className="font-mono font-bold text-sm tabular-nums px-2 hidden sm:block">
                {displayTime}
              </div>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onRestart} title="Restart">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onOpenSettings} title="Settings">
              <Settings className="w-4 h-4" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors shrink-0"
                    title={user.username}
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center font-bold text-xs">
                        {user.username[0].toUpperCase()}
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
              <Button size="sm" className="ml-1 font-semibold rounded-xl" onClick={onOpenAuth}>
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar at bottom of bar — animates as test runs */}
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
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModePill({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
