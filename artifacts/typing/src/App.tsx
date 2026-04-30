import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

import Home from "@/pages/Home";
import CompetitionPage from "@/pages/CompetitionPage";
import TypingSpeedTestPage from "@/pages/TypingSpeedTestPage";
import OneMinuteTestPage from "@/pages/OneMinuteTestPage";
import FiveMinuteTestPage from "@/pages/FiveMinuteTestPage";
import LearnTypingPage from "@/pages/LearnTypingPage";
import LessonPage from "@/pages/LessonPage";
import ResultsPage from "@/pages/ResultsPage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "@/pages/not-found";
import { Redirect } from "@/components/Redirect";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/competition" component={CompetitionPage} />
        {/* SEO consolidation: legacy "typing test" URL → /competition (the canonical test page). */}
        <Route path="/typing-test">{() => <Redirect to="/competition" />}</Route>
        {/* SEO consolidation: legacy "typing practice" URL → / (the canonical practice page). */}
        <Route path="/typing-practice">{() => <Redirect to="/" />}</Route>
        {/* Long-tail variants kept as their own SEO landing pages. */}
        <Route path="/typing-speed-test" component={TypingSpeedTestPage} />
        <Route path="/1-minute-typing-test" component={OneMinuteTestPage} />
        <Route path="/5-minute-typing-test" component={FiveMinuteTestPage} />
        <Route path="/learn-typing" component={LearnTypingPage} />
        <Route path="/lessons/:slug" component={LessonPage} />
        <Route path="/results/:id" component={ResultsPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
