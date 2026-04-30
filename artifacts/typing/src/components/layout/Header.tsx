import { Link, useLocation } from "wouter";
import { Sun, Moon, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadState, updateSettings } from "@/lib/storage";
import { useEffect, useState } from "react";

export function Header() {
  const [location] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const state = loadState();
    setTheme(state.settings.theme);
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
    { href: "/learn-typing", label: "Lessons" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <Link href="/" className="mr-6 flex items-center space-x-2 font-bold hover:opacity-80 transition-opacity">
          <Keyboard className="h-5 w-5 text-primary" />
          <span className="text-lg tracking-tight">
            type<span className="text-primary animate-pulse inline-block w-[2px] h-[18px] bg-primary translate-y-[2px] mx-[1px]"></span>flow
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-1 md:space-x-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`transition-colors hover:text-foreground/80 px-3 py-2 rounded-md ${location === item.href ? 'bg-muted text-foreground' : 'text-foreground/60'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-2 pl-4 border-l border-border/40">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
