import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { AppState } from '@/lib/storage';

interface ControlsProps {
  settings: AppState['settings'];
  onSettingsChange: (settings: Partial<AppState['settings']>) => void;
  onRestart: () => void;
  timeLeft?: number;
  durationSec?: number;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function Controls({ settings, onSettingsChange, onRestart, timeLeft, durationSec }: ControlsProps) {
  const displaySec = timeLeft !== undefined ? Math.ceil(timeLeft) : (durationSec ?? settings.duration);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 px-1 py-2">
        {/* Left: language / mode */}
        <Select
          value={settings.funMode}
          onValueChange={(val) => onSettingsChange({ funMode: val as AppState['settings']['funMode'] })}
        >
          <SelectTrigger className="h-9 w-auto min-w-[110px] border-0 bg-transparent shadow-none px-2 text-sm font-medium hover:bg-muted/50 focus:ring-0">
            <SelectValue placeholder="English" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="words">English</SelectItem>
            <SelectItem value="quotes">Quotes</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="punctuation">Punctuation</SelectItem>
          </SelectContent>
        </Select>

        {/* Center: timer */}
        <div className="font-mono text-base sm:text-lg font-semibold text-foreground tabular-nums">
          {formatTime(Math.max(0, displaySec))}
        </div>

        {/* Right: restart + settings */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={onRestart}
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Test mode</Label>
                  <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-md">
                    {(['time', 'words', 'quote'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => onSettingsChange({ mode: m })}
                        className={`px-2 py-1.5 rounded text-xs capitalize transition-colors ${settings.mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {settings.mode === 'time' && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Duration</Label>
                    <div className="grid grid-cols-4 gap-1 bg-muted/50 p-1 rounded-md">
                      {[15, 30, 60, 120].map(t => (
                        <button
                          key={t}
                          onClick={() => onSettingsChange({ duration: t })}
                          className={`px-2 py-1.5 rounded text-xs transition-colors ${settings.duration === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {settings.mode === 'words' && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Word count</Label>
                    <div className="grid grid-cols-4 gap-1 bg-muted/50 p-1 rounded-md">
                      {[10, 25, 50, 100].map(w => (
                        <button
                          key={w}
                          onClick={() => onSettingsChange({ wordCount: w })}
                          className={`px-2 py-1.5 rounded text-xs transition-colors ${settings.wordCount === w ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="strict" className="text-sm cursor-pointer">Strict mode</Label>
                  <Switch
                    id="strict"
                    checked={settings.stopOnError}
                    onCheckedChange={(checked) => onSettingsChange({ stopOnError: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sound" className="text-sm cursor-pointer flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Sound
                  </Label>
                  <Switch
                    id="sound"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => onSettingsChange({ soundEnabled: checked })}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Subtle gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
