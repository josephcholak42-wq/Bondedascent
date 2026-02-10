import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth";
import RitualsPage from "@/pages/rituals";
import LimitsPage from "@/pages/limits";
import SecretsPage from "@/pages/secrets";
import WagersPage from "@/pages/wagers";
import RatingsPage from "@/pages/ratings";
import ConnectionPulsePage from "@/pages/connection-pulse";
import PlaySessionsPage from "@/pages/play-sessions";
import CountdownEventsPage from "@/pages/countdown-events";
import AchievementsPage from "@/pages/achievements";
import StandingOrdersPage from "@/pages/standing-orders";
import PermissionRequestsPage from "@/pages/permission-requests";
import ConflictsPage from "@/pages/conflicts";
import DesiredChangesPage from "@/pages/desired-changes";
import DevotionsPage from "@/pages/devotions";
import IntensityLadderPage from "@/pages/intensity-ladder";
import ObedienceTrialsPage from "@/pages/obedience-trials";
import SensationRoulettePage from "@/pages/sensation-roulette";
import ProtocolLockboxPage from "@/pages/protocol-lockbox";
import EnduranceChallengesPage from "@/pages/endurance-challenges";
import SubStatusPage from "@/pages/sub-status";
import { useAuth } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function AuthRoute() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <AuthPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/rituals" component={() => <ProtectedRoute component={RitualsPage} />} />
      <Route path="/limits" component={() => <ProtectedRoute component={LimitsPage} />} />
      <Route path="/secrets" component={() => <ProtectedRoute component={SecretsPage} />} />
      <Route path="/wagers" component={() => <ProtectedRoute component={WagersPage} />} />
      <Route path="/ratings" component={() => <ProtectedRoute component={RatingsPage} />} />
      <Route path="/connection-pulse" component={() => <ProtectedRoute component={ConnectionPulsePage} />} />
      <Route path="/play-sessions" component={() => <ProtectedRoute component={PlaySessionsPage} />} />
      <Route path="/countdown-events" component={() => <ProtectedRoute component={CountdownEventsPage} />} />
      <Route path="/achievements" component={() => <ProtectedRoute component={AchievementsPage} />} />
      <Route path="/standing-orders" component={() => <ProtectedRoute component={StandingOrdersPage} />} />
      <Route path="/permission-requests" component={() => <ProtectedRoute component={PermissionRequestsPage} />} />
      <Route path="/conflicts" component={() => <ProtectedRoute component={ConflictsPage} />} />
      <Route path="/desired-changes" component={() => <ProtectedRoute component={DesiredChangesPage} />} />
      <Route path="/devotions" component={() => <ProtectedRoute component={DevotionsPage} />} />
      <Route path="/intensity-ladder" component={() => <ProtectedRoute component={IntensityLadderPage} />} />
      <Route path="/obedience-trials" component={() => <ProtectedRoute component={ObedienceTrialsPage} />} />
      <Route path="/sensation-roulette" component={() => <ProtectedRoute component={SensationRoulettePage} />} />
      <Route path="/protocol-lockbox" component={() => <ProtectedRoute component={ProtocolLockboxPage} />} />
      <Route path="/endurance-challenges" component={() => <ProtectedRoute component={EnduranceChallengesPage} />} />
      <Route path="/sub-status" component={() => <ProtectedRoute component={SubStatusPage} />} />
      <Route path="/auth" component={AuthRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
