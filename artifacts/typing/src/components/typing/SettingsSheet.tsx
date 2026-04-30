import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor, Type, Volume2, VolumeX, ShieldAlert, BarChart3, LogOut } from 'lucide-react';
import { AppState } from '@/lib/storage';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: AppState['settings'];
  onSettingsChange: (s: Partial<AppState['settings']>) => void;
}

const FONT_OPTIONS: Array<{ value: AppState['settings']['fontSize']; label: string }> = [
  { value: 'sm', label: 'sm' },
  { value: 'md', label: 'md' },
  { value: 'lg', label: 'lg' },
  { value: 'xl', label: 'xl' },
];

export function SettingsSheet({ open, onOpenChange, settings, onSettingsChange }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Tune the test to your preferences.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Appearance */}
          <Section title="Appearance">
            <Row label="Theme">
              <div className="flex gap-1">
                <ToggleBtn active={theme === 'light'} onClick={() => setTheme('light')} title="Light">
                  <Sun className="w-3.5 h-3.5" />
                </ToggleBtn>
                <ToggleBtn active={theme === 'dark'} onClick={() => setTheme('dark')} title="Dark">
                  <Moon className="w-3.5 h-3.5" />
                </ToggleBtn>
                <ToggleBtn active={theme === 'system'} onClick={() => setTheme('system')} title="System">
                  <Monitor className="w-3.5 h-3.5" />
                </ToggleBtn>
              </div>
            </Row>
            <Row label={<><Type className="w-3.5 h-3.5 inline mr-1.5" />Font size</>}>
              <div className="flex gap-1">
                {FONT_OPTIONS.map((f) => (
                  <ToggleBtn
                    key={f.value}
                    active={settings.fontSize === f.value}
                    onClick={() => onSettingsChange({ fontSize: f.value })}
                  >
                    <span className="text-xs font-semibold uppercase">{f.label}</span>
                  </ToggleBtn>
                ))}
              </div>
            </Row>
          </Section>

          {/* Test behaviour */}
          <Section title="Test behaviour">
            <ToggleRow
              label="Sound effects"
              icon={settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              hint="Click and finish sounds"
              checked={settings.soundEnabled}
              onChange={(v) => onSettingsChange({ soundEnabled: v })}
            />
            <ToggleRow
              label="Strict mode"
              icon={<ShieldAlert className="w-4 h-4" />}
              hint="Stop the test if you make a mistake"
              checked={settings.stopOnError}
              onChange={(v) => onSettingsChange({ stopOnError: v })}
            />
            <ToggleRow
              label="Live stats"
              icon={<BarChart3 className="w-4 h-4" />}
              hint="Show WPM / accuracy / errors while typing"
              checked={settings.showLiveStats}
              onChange={(v) => onSettingsChange({ showLiveStats: v })}
            />
          </Section>

          {/* Word source */}
          <Section title="Word source">
            <Row label="Type">
              <div className="flex flex-wrap gap-1">
                {(['words', 'punctuation', 'code', 'quotes'] as const).map((m) => (
                  <ToggleBtn
                    key={m}
                    active={settings.funMode === m}
                    onClick={() => onSettingsChange({ funMode: m })}
                  >
                    <span className="text-xs font-semibold capitalize">{m}</span>
                  </ToggleBtn>
                ))}
              </div>
            </Row>
          </Section>

          {/* Account */}
          {user && (
            <Section title="Account">
              <div className="flex items-center gap-3 px-3 py-3 bg-muted/40 rounded-xl">
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{user.username}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { signOut(); onOpenChange(false); }}>
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign out
                </Button>
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function ToggleBtn({
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
      className={`px-3 py-1.5 rounded-lg transition-all ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  icon,
  hint,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
