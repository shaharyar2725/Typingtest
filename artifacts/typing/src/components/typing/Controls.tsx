import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Volume2, VolumeX, RotateCcw, Clock, Quote, Code, Type, Hash } from 'lucide-react';
import { AppState } from '@/lib/storage';

interface ControlsProps {
  settings: AppState['settings'];
  onSettingsChange: (settings: Partial<AppState['settings']>) => void;
  onRestart: () => void;
}

export function Controls({ settings, onSettingsChange, onRestart }: ControlsProps) {

  const handleModeChange = (val: string) => {
    if (val === 'time' || val === 'words' || val === 'quote' || val === 'daily') {
      onSettingsChange({ mode: val });
    }
  };

  const handleCustomTime = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const val = Number(formData.get('duration'));
    if (!isNaN(val) && val > 0) {
      onSettingsChange({ duration: val });
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">

        {/* Mode tabs */}
        <Tabs value={settings.mode} onValueChange={handleModeChange}>
          <TabsList className="h-9 bg-muted/50 p-1">
            <TabsTrigger value="time" className="h-7 text-xs px-2.5 sm:px-3 data-[state=active]:bg-background shadow-none">
              <Clock className="w-3 h-3 sm:mr-1.5"/><span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="words" className="h-7 text-xs px-2.5 sm:px-3 data-[state=active]:bg-background shadow-none">
              <Type className="w-3 h-3 sm:mr-1.5"/><span className="hidden sm:inline">Words</span>
            </TabsTrigger>
            <TabsTrigger value="quote" className="h-7 text-xs px-2.5 sm:px-3 data-[state=active]:bg-background shadow-none">
              <Quote className="w-3 h-3 sm:mr-1.5"/><span className="hidden sm:inline">Quote</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Duration / word count */}
        {settings.mode === 'time' && (
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
            {[15, 30, 60, 120].map(t => (
              <button
                key={t}
                onClick={() => onSettingsChange({ duration: t })}
                className={`px-2 sm:px-2.5 py-1 rounded text-xs transition-colors ${settings.duration === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`px-2 py-1 rounded text-xs transition-colors ${![15, 30, 60, 120].includes(settings.duration) ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  +
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <form onSubmit={handleCustomTime} className="flex gap-2">
                  <Input name="duration" type="number" min="1" max="3600" defaultValue={settings.duration} className="h-8 text-sm" placeholder="Seconds" />
                  <Button type="submit" size="sm" className="h-8">Set</Button>
                </form>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {settings.mode === 'words' && (
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
            {[10, 25, 50, 100].map(w => (
              <button
                key={w}
                onClick={() => onSettingsChange({ wordCount: w })}
                className={`px-2 sm:px-2.5 py-1 rounded text-xs transition-colors ${settings.wordCount === w ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {w}
              </button>
            ))}
          </div>
        )}

        {/* Right cluster — wraps under on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <Select
            value={settings.funMode}
            onValueChange={(val) => onSettingsChange({ funMode: val as AppState['settings']['funMode'] })}
          >
            <SelectTrigger className="h-8 w-[110px] sm:w-[140px] text-xs bg-muted/30 border-transparent hover:bg-muted/50 transition-colors shadow-none focus:ring-0">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="words"><div className="flex items-center"><Type className="w-3.5 h-3.5 mr-2 opacity-50"/> English</div></SelectItem>
              <SelectItem value="quotes"><div className="flex items-center"><Quote className="w-3.5 h-3.5 mr-2 opacity-50"/> Quotes</div></SelectItem>
              <SelectItem value="code"><div className="flex items-center"><Code className="w-3.5 h-3.5 mr-2 opacity-50"/> Code</div></SelectItem>
              <SelectItem value="punctuation"><div className="flex items-center"><Hash className="w-3.5 h-3.5 mr-2 opacity-50"/> Punctuation</div></SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center gap-2">
            <Switch
              id="stopOnError"
              checked={settings.stopOnError}
              onCheckedChange={(checked) => onSettingsChange({ stopOnError: checked })}
              className="scale-75 origin-right"
            />
            <Label htmlFor="stopOnError" className="text-xs text-muted-foreground whitespace-nowrap cursor-pointer">Strict</Label>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => onSettingsChange({ soundEnabled: !settings.soundEnabled })}
            aria-label="Toggle sound"
          >
            {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={onRestart}
            aria-label="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
