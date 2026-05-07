import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Type,
  Volume2,
  VolumeX,
  ShieldAlert,
  AlignLeft,
  Music2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AppState } from '@/lib/storage';
import { useTheme } from '@/components/ThemeProvider';

interface SettingsPopoverProps {
  settings: AppState['settings'];
  onSettingsChange: (s: Partial<AppState['settings']>) => void;
}

const FONT_OPTIONS: Array<AppState['settings']['fontSize']> = ['xs', 'sm', 'md', 'lg', 'xl'];
const LINE_OPTIONS: Array<AppState['settings']['linesVisible']> = [1, 2, 3, 4, 5, 10, 15, 20];

export function SettingsPopover({ settings, onSettingsChange }: SettingsPopoverProps) {
  const { theme, setTheme } = useTheme();

  const anySoundOn = settings.soundOnError || settings.soundOnSuccess || settings.soundOnKey;

  const toggleAllSound = () => {
    if (anySoundOn) {
      onSettingsChange({
        soundEnabled: false,
        soundOnError: false,
        soundOnSuccess: false,
        soundOnKey: false,
      });
    } else {
      onSettingsChange({
        soundEnabled: true,
        soundOnError: true,
        soundOnSuccess: true,
        soundOnKey: false,
      });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
          title="Settings"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[300px] p-0 rounded-2xl shadow-lg"
      >
        <div className="px-3 py-1.5 border-b border-border">
          <div className="text-[11px] font-bold">Settings</div>
        </div>

        <div className="p-2.5 space-y-2 max-h-[75vh] overflow-y-auto">
          {/* Theme + Strict on one row */}
          <div className="grid grid-cols-2 gap-2">
            <Section label="Theme">
              <Grid cols={3}>
                <Pill active={theme === 'light'} onClick={() => setTheme('light')} title="Light">
                  <Sun className="w-3 h-3" />
                </Pill>
                <Pill active={theme === 'dark'} onClick={() => setTheme('dark')} title="Dark">
                  <Moon className="w-3 h-3" />
                </Pill>
                <Pill active={theme === 'system'} onClick={() => setTheme('system')} title="System">
                  <Monitor className="w-3 h-3" />
                </Pill>
              </Grid>
            </Section>

            <Section
              label={
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-2.5 h-2.5" />Strict
                </span>
              }
            >
              <Grid cols={2}>
                <Pill active={settings.stopOnError} onClick={() => onSettingsChange({ stopOnError: true })}>
                  <span className="text-[9px] font-semibold">On</span>
                </Pill>
                <Pill active={!settings.stopOnError} onClick={() => onSettingsChange({ stopOnError: false })}>
                  <span className="text-[9px] font-semibold">Off</span>
                </Pill>
              </Grid>
            </Section>
          </div>

          {/* Font size */}
          <Section
            label={
              <span className="flex items-center gap-1">
                <Type className="w-2.5 h-2.5" />Font
              </span>
            }
          >
            <Grid cols={5}>
              {FONT_OPTIONS.map((f) => (
                <Pill
                  key={f}
                  active={settings.fontSize === f}
                  onClick={() => onSettingsChange({ fontSize: f })}
                >
                  <span className="text-[9px] font-bold uppercase">{f}</span>
                </Pill>
              ))}
            </Grid>
          </Section>

          {/* Lines visible */}
          <Section
            label={
              <span className="flex items-center gap-1">
                <AlignLeft className="w-2.5 h-2.5" />Lines
              </span>
            }
          >
            <Grid cols={8}>
              {LINE_OPTIONS.map((n) => (
                <Pill
                  key={n}
                  active={settings.linesVisible === n}
                  onClick={() => onSettingsChange({ linesVisible: n })}
                >
                  <span className="text-[10px] font-bold tabular-nums">{n}</span>
                </Pill>
              ))}
            </Grid>
          </Section>

          {/* Sound */}
          <Section
            label={
              <button
                type="button"
                onClick={toggleAllSound}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                title={anySoundOn ? 'Mute all sounds' : 'Unmute sounds'}
                aria-label={anySoundOn ? 'Mute all sounds' : 'Unmute sounds'}
              >
                {anySoundOn ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
                Sound
              </button>
            }
          >
            <Grid cols={3}>
              <SoundChip
                active={settings.soundOnError}
                onClick={() =>
                  onSettingsChange({
                    soundOnError: !settings.soundOnError,
                    soundEnabled: true,
                  })
                }
                icon={<XCircle className="w-2.5 h-2.5" />}
                label="Error"
              />
              <SoundChip
                active={settings.soundOnSuccess}
                onClick={() =>
                  onSettingsChange({
                    soundOnSuccess: !settings.soundOnSuccess,
                    soundEnabled: true,
                  })
                }
                icon={<CheckCircle2 className="w-2.5 h-2.5" />}
                label="Done"
              />
              <SoundChip
                active={settings.soundOnKey}
                onClick={() =>
                  onSettingsChange({
                    soundOnKey: !settings.soundOnKey,
                    soundEnabled: true,
                  })
                }
                icon={<Music2 className="w-2.5 h-2.5" />}
                label="Keys"
              />
            </Grid>
          </Section>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      {children}
    </div>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-6 rounded-md flex items-center justify-center transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function SoundChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1 h-6 rounded-md text-[9px] font-bold transition-all ${
        active
          ? 'bg-primary/15 text-primary border border-primary/30'
          : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
