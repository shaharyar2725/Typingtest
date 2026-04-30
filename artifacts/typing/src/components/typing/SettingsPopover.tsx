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
const SOURCE_OPTIONS: Array<AppState['settings']['funMode']> = ['words', 'punctuation', 'code', 'quotes'];

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
        className="w-[320px] p-0 rounded-2xl shadow-lg"
      >
        <div className="px-4 py-3 border-b border-border">
          <div className="text-sm font-bold">Settings</div>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Theme */}
          <Row label="Theme">
            <Pills>
              <Pill active={theme === 'light'} onClick={() => setTheme('light')} title="Light">
                <Sun className="w-3.5 h-3.5" />
              </Pill>
              <Pill active={theme === 'dark'} onClick={() => setTheme('dark')} title="Dark">
                <Moon className="w-3.5 h-3.5" />
              </Pill>
              <Pill active={theme === 'system'} onClick={() => setTheme('system')} title="System">
                <Monitor className="w-3.5 h-3.5" />
              </Pill>
            </Pills>
          </Row>

          {/* Font size */}
          <Row label={<span className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5" />Font size</span>}>
            <Pills>
              {FONT_OPTIONS.map((f) => (
                <Pill
                  key={f}
                  active={settings.fontSize === f}
                  onClick={() => onSettingsChange({ fontSize: f })}
                >
                  <span className="text-[11px] font-bold uppercase tabular-nums">{f}</span>
                </Pill>
              ))}
            </Pills>
          </Row>

          {/* Lines visible */}
          <Row label={<span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" />Lines</span>}>
            <Pills>
              {LINE_OPTIONS.map((n) => (
                <Pill
                  key={n}
                  active={settings.linesVisible === n}
                  onClick={() => onSettingsChange({ linesVisible: n })}
                >
                  <span className="text-[11px] font-bold tabular-nums">{n}</span>
                </Pill>
              ))}
            </Pills>
          </Row>

          {/* Word source */}
          <Row label="Source">
            <Pills wrap>
              {SOURCE_OPTIONS.map((m) => (
                <Pill
                  key={m}
                  active={settings.funMode === m}
                  onClick={() => onSettingsChange({ funMode: m })}
                >
                  <span className="text-[11px] font-semibold capitalize">{m}</span>
                </Pill>
              ))}
            </Pills>
          </Row>

          {/* Sound master + sub-toggles */}
          <div>
            <Row label={<span className="flex items-center gap-1.5">{settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}Sound</span>}>
              <Pills>
                <Pill active={settings.soundEnabled} onClick={() => onSettingsChange({ soundEnabled: true })}>
                  <span className="text-[11px] font-semibold">On</span>
                </Pill>
                <Pill active={!settings.soundEnabled} onClick={() => onSettingsChange({ soundEnabled: false })}>
                  <span className="text-[11px] font-semibold">Off</span>
                </Pill>
              </Pills>
            </Row>

            <div className={`mt-2 grid grid-cols-3 gap-1.5 ${settings.soundEnabled ? '' : 'opacity-40 pointer-events-none'}`}>
              <SoundChip
                active={settings.soundOnError}
                onClick={() => onSettingsChange({ soundOnError: !settings.soundOnError })}
                icon={<XCircle className="w-3.5 h-3.5" />}
                label="Error"
              />
              <SoundChip
                active={settings.soundOnSuccess}
                onClick={() => onSettingsChange({ soundOnSuccess: !settings.soundOnSuccess })}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                label="Finish"
              />
              <SoundChip
                active={settings.soundOnKey}
                onClick={() => onSettingsChange({ soundOnKey: !settings.soundOnKey })}
                icon={<Music2 className="w-3.5 h-3.5" />}
                label="Keys"
              />
            </div>
          </div>

          {/* Strict mode */}
          <Row label={<span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" />Strict</span>}>
            <Pills>
              <Pill active={settings.stopOnError} onClick={() => onSettingsChange({ stopOnError: true })}>
                <span className="text-[11px] font-semibold">On</span>
              </Pill>
              <Pill active={!settings.stopOnError} onClick={() => onSettingsChange({ stopOnError: false })}>
                <span className="text-[11px] font-semibold">Off</span>
              </Pill>
            </Pills>
          </Row>

          {/* Account */}
          {user && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2.5">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs">
                    {user.username[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{user.username}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                </div>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={signOut}>
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Pills({ children, wrap }: { children: React.ReactNode; wrap?: boolean }) {
  return <div className={`flex gap-1 ${wrap ? 'flex-wrap justify-end' : ''}`}>{children}</div>;
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
      className={`min-w-[28px] h-7 px-2 rounded-md flex items-center justify-center transition-all ${
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
      className={`flex items-center justify-center gap-1 h-8 rounded-lg text-[10px] font-bold transition-all ${
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
