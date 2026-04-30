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
  LogOut,
} from 'lucide-react';
import { AppState } from '@/lib/storage';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsPopoverProps {
  settings: AppState['settings'];
  onSettingsChange: (s: Partial<AppState['settings']>) => void;
}

const FONT_OPTIONS: Array<AppState['settings']['fontSize']> = ['xs', 'sm', 'md', 'lg', 'xl'];
const LINE_OPTIONS: Array<AppState['settings']['linesVisible']> = [1, 2, 3];

export function SettingsPopover({ settings, onSettingsChange }: SettingsPopoverProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

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
        className="w-[260px] p-0 rounded-2xl shadow-lg"
      >
        <div className="px-3 py-2 border-b border-border">
          <div className="text-xs font-bold">Settings</div>
        </div>

        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Theme */}
          <Section label="Theme">
            <Grid cols={3}>
              <Pill active={theme === 'light'} onClick={() => setTheme('light')} title="Light">
                <Sun className="w-3.5 h-3.5" />
              </Pill>
              <Pill active={theme === 'dark'} onClick={() => setTheme('dark')} title="Dark">
                <Moon className="w-3.5 h-3.5" />
              </Pill>
              <Pill active={theme === 'system'} onClick={() => setTheme('system')} title="System">
                <Monitor className="w-3.5 h-3.5" />
              </Pill>
            </Grid>
          </Section>

          {/* Font size */}
          <Section
            label={
              <span className="flex items-center gap-1">
                <Type className="w-3 h-3" />Font
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
                  <span className="text-[10px] font-bold uppercase">{f}</span>
                </Pill>
              ))}
            </Grid>
          </Section>

          {/* Lines visible */}
          <Section
            label={
              <span className="flex items-center gap-1">
                <AlignLeft className="w-3 h-3" />Lines
              </span>
            }
          >
            <Grid cols={3}>
              {LINE_OPTIONS.map((n) => (
                <Pill
                  key={n}
                  active={settings.linesVisible === n}
                  onClick={() => onSettingsChange({ linesVisible: n })}
                >
                  <span className="text-[11px] font-bold tabular-nums">{n}</span>
                </Pill>
              ))}
            </Grid>
          </Section>

          {/* Sound master */}
          <Section
            label={
              <span className="flex items-center gap-1">
                {settings.soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                Sound
              </span>
            }
          >
            <Grid cols={2}>
              <Pill active={settings.soundEnabled} onClick={() => onSettingsChange({ soundEnabled: true })}>
                <span className="text-[10px] font-semibold">On</span>
              </Pill>
              <Pill active={!settings.soundEnabled} onClick={() => onSettingsChange({ soundEnabled: false })}>
                <span className="text-[10px] font-semibold">Off</span>
              </Pill>
            </Grid>
          </Section>

          {/* Sound sub-toggles */}
          <div className={settings.soundEnabled ? '' : 'opacity-40 pointer-events-none'}>
            <Grid cols={3}>
              <SoundChip
                active={settings.soundOnError}
                onClick={() => onSettingsChange({ soundOnError: !settings.soundOnError })}
                icon={<XCircle className="w-3 h-3" />}
                label="Error"
              />
              <SoundChip
                active={settings.soundOnSuccess}
                onClick={() => onSettingsChange({ soundOnSuccess: !settings.soundOnSuccess })}
                icon={<CheckCircle2 className="w-3 h-3" />}
                label="Done"
              />
              <SoundChip
                active={settings.soundOnKey}
                onClick={() => onSettingsChange({ soundOnKey: !settings.soundOnKey })}
                icon={<Music2 className="w-3 h-3" />}
                label="Keys"
              />
            </Grid>
          </div>

          {/* Strict mode */}
          <Section
            label={
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />Strict
              </span>
            }
          >
            <Grid cols={2}>
              <Pill active={settings.stopOnError} onClick={() => onSettingsChange({ stopOnError: true })}>
                <span className="text-[10px] font-semibold">On</span>
              </Pill>
              <Pill active={!settings.stopOnError} onClick={() => onSettingsChange({ stopOnError: false })}>
                <span className="text-[10px] font-semibold">Off</span>
              </Pill>
            </Grid>
          </Section>

          {/* Account */}
          {user && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center font-bold text-[10px]">
                    {user.username[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[11px] truncate">{user.username}</div>
                  <div className="text-[9px] text-muted-foreground truncate">{user.email}</div>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={signOut}>
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">{label}</div>
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
      className={`h-7 rounded-md flex items-center justify-center transition-all ${
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
      className={`flex items-center justify-center gap-1 h-7 rounded-md text-[9px] font-bold transition-all ${
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
