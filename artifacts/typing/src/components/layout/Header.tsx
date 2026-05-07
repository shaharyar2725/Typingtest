import { Link, useLocation } from "wouter";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadState, updateSettings } from "@/lib/storage";
import { useEffect, useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'system';
    return loadState().settings.theme;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTheme(loadState().settings.theme);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  const navItems = [
    { href: "/", label: "Practice" },
    { href: "/typing-speed-test", label: "Typing Test" },
    { href: "/learn-typing", label: "Course" },
    { href: "/about", label: "About" },
  ];

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  return (
    <header className="w-full border-b border-border/60 bg-background relative z-50">
      <div className="container flex h-16 max-w-screen-xl items-center px-5 md:px-8 mx-auto">
        <Link href="/" className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight hover:opacity-70 transition-opacity">
          <span className="text-foreground">type</span>
          <span className="text-primary">flow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:text-foreground ${location === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 ml-1 rounded-lg" aria-label="Toggle theme">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </nav>

        {/* Mobile actions */}
        <div className="ml-auto flex md:hidden items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg" aria-label="Toggle theme">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(o => !o)}
            className="h-9 w-9 rounded-lg"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <nav className="md:hidden absolute left-0 right-0 top-16 bg-background border-b border-border z-50 px-5 py-4 flex flex-col gap-1 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-semibold px-4 py-3 rounded-xl transition-colors ${location === item.href ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
