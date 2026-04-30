import { Link, useLocation } from "wouter";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadState, updateSettings } from "@/lib/storage";
import { useEffect, useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'system';
    return loadState().settings.theme;
  });

  useEffect(() => {
    setTheme(loadState().settings.theme);
  }, []);

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
    { href: "/typing-test", label: "Test" },
    { href: "/typing-practice", label: "Practice" },
    { href: "/learn-typing", label: "Course" },
    { href: "/about", label: "About" },
  ];

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  return (
    <header className="w-full border-b border-border/60 bg-background">
      <div className="container flex h-16 max-w-screen-xl items-center px-5 md:px-8 mx-auto">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight hover:opacity-70 transition-opacity">
          <span className="text-foreground">type</span>
          <span className="text-primary">flow</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors hover:text-foreground ${location === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 ml-1 rounded-lg">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
}
