import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";

import Home from "@/pages/Home";
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
        <Route path="/typing-speed-test" component={TypingSpeedTestPage} />
        <Route path="/1-minute-typing-test" component={OneMinuteTestPage} />
        <Route path="/5-minute-typing-test" component={FiveMinuteTestPage} />
        {/* Legacy URLs → canonical test page */}
        <Route path="/competition">{() => <Redirect to="/typing-speed-test" />}</Route>
        <Route path="/typing-test">{() => <Redirect to="/typing-speed-test" />}</Route>
        {/* Legacy practice URL → home */}
        <Route path="/typing-practice">{() => <Redirect to="/" />}</Route>
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
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
