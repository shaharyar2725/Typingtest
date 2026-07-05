import { Link } from "wouter";
import { LESSONS } from "@/lib/lessons";
import logo from "@/assets/logo.webp";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 py-12 md:py-16 mt-20">
      <div className="container max-w-screen-xl px-5 md:px-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit hover:opacity-75 transition-opacity">
              <img src={logo} alt="TakeTypingTest logo" className="w-5 h-5 shrink-0" />
              <span className="font-extrabold text-base tracking-tight leading-none">
                <span className="text-foreground">take</span>
                <span className="text-primary">typing</span>
                <span className="text-foreground">test</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Free online typing practice and typing tests with live WPM, accuracy tracking, and structured courses. Built for fast fingers.
            </p>
            <div className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} TakeTypingTest.com. All rights reserved.
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Practice & Test</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Typing Practice</Link></li>
              <li><Link href="/typing-speed-test" className="hover:text-primary transition-colors">Typing Speed Test</Link></li>
              <li><Link href="/1-minute-typing-test" className="hover:text-primary transition-colors">1 Minute Typing Test</Link></li>
              <li><Link href="/3-minute-typing-test" className="hover:text-primary transition-colors">3 Minute Typing Test</Link></li>
              <li><Link href="/5-minute-typing-test" className="hover:text-primary transition-colors">5 Minute Typing Test</Link></li>
              <li><Link href="/10-minute-typing-test" className="hover:text-primary transition-colors">10 Minute Typing Test</Link></li>
              <li><Link href="/20-minute-typing-test" className="hover:text-primary transition-colors">20 Minute Typing Test</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Learn</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/learn-typing" className="hover:text-primary transition-colors">Course Overview</Link></li>
              {LESSONS.slice(0, 4).map(lesson => (
                <li key={lesson.slug}>
                  <Link href={`/lessons/${lesson.slug}`} className="hover:text-primary transition-colors">
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/learn-typing" className="hover:text-primary transition-colors">Touch Typing Guide</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
