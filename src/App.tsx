import { useEffect, useState } from "react";
import { Dashboard, type DashboardTab } from "./components/Dashboard";
import { AuthModal } from "./components/AuthModal";
import { Navbar, HomePage, Footer } from "./components/Sections";
import { CheckoutPage } from "./components/CheckoutPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { LegalPageView, type LegalPage } from "./components/LegalPages";
import { useStore, signOut } from "./store";

type Route = "home" | "dashboard" | "deposit" | "withdraw" | "admin" | LegalPage;

const routeFromHash = (): Route => {
  switch (location.hash) {
    case "#/dashboard": return "dashboard";
    case "#/deposit": return "deposit";
    case "#/withdraw": return "withdraw";
    case "#/admin": return "admin";
    case "#/terms": return "terms";
    case "#/privacy": return "privacy";
    case "#/refund": return "refund";
    case "#/risk": return "risk";
    case "#/aml": return "aml";
    case "#/cookies": return "cookies";
    case "#/complaints": return "complaints";
    default: return "home";
  }
};

const navigate = (route: Route) => {
  location.hash = route === "home" ? "" : `#/${route}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function App() {
  const { user, deposits, ready } = useStore();
  const [route, setRoute] = useState<Route>(routeFromHash());
  const [auth, setAuth] = useState<"login" | "signup" | null>(null);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");
  const [pendingRoute, setPendingRoute] = useState<Route | null>(null);

  const hasStartedFunding = deposits.length > 0;

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!ready || !user) return;

    if (pendingRoute) {
      const destination = pendingRoute;
      setPendingRoute(null);
      navigate(destination);
      return;
    }

    // Google OAuth returns to the normal URL so Supabase can consume its
    // access-token fragment without colliding with our hash router.
    if (new URLSearchParams(location.search).get("oauth") === "google") {
      history.replaceState(null, "", location.pathname);
      navigate("deposit");
      return;
    }

    if (route === "dashboard" && !hasStartedFunding) {
      navigate("deposit");
    }
  }, [ready, user, route, hasStartedFunding, pendingRoute]);

  const goHome = () => navigate("home");
  const goDashboard = () => {
    if (user) {
      navigate("dashboard");
      return;
    }
    setPendingRoute("dashboard");
    setAuth("signup");
  };
  const goDeposit = () => {
    if (user) {
      navigate("deposit");
      return;
    }
    setPendingRoute("deposit");
    setAuth("signup");
  };
  const goWithdraw = () => navigate("withdraw");
  const goAdmin = () => navigate("admin");

  if (["terms","privacy","refund","risk","aml","cookies","complaints"].includes(route)) {
    return <LegalPageView page={route as LegalPage} onHome={goHome} />;
  }

  if (route === "admin" && user) {
    return <AdminDashboard onHome={goHome} onLogout={() => { signOut(); goHome(); }} />;
  }

  if (route === "dashboard" && user && hasStartedFunding) {
    return <Dashboard tab={dashboardTab} onTabChange={setDashboardTab} onHome={goHome} onDeposit={goDeposit} onWithdraw={goWithdraw} onLogout={() => { signOut(); goHome(); }} />;
  }

  if (route === "deposit" && user) {
    return <CheckoutPage mode="deposit" onBack={goHome} onComplete={goDashboard} />;
  }

  if (route === "withdraw" && user) {
    return <CheckoutPage mode="withdraw" onBack={goDashboard} onComplete={goDashboard} />;
  }

  return (
    <>
      <Navbar user={user} onLogin={() => setAuth("login")} onSignup={() => setAuth("signup")} onDashboard={goDashboard} onLogout={() => { signOut(); goHome(); }} />
      <HomePage onOpenDashboard={goDashboard} onDeposit={goDeposit} />
      <Footer />
      <AuthModal mode={auth} setMode={setAuth} onClose={() => setAuth(null)} />
    </>
  );
}
