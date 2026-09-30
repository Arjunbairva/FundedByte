import { useEffect, useState } from "react";
import { Dashboard, type DashboardTab } from "./components/Dashboard";
import { AuthModal } from "./components/AuthModal";
import { Navbar, HomePage, Footer } from "./components/Sections";
import { CheckoutPage } from "./components/CheckoutPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { useStore, signOut } from "./store";

type Route = "home" | "dashboard" | "deposit" | "withdraw" | "admin";

const routeFromHash = (): Route => {
  switch (location.hash) {
    case "#/dashboard": return "dashboard";
    case "#/deposit": return "deposit";
    case "#/withdraw": return "withdraw";
    case "#/admin": return "admin";
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

  const hasStartedFunding = deposits.length > 0;

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!ready || !user || route === "home") return;

    if (route === "dashboard" && !hasStartedFunding) {
      navigate("deposit");
    }
  }, [ready, user, route, hasStartedFunding]);

  const goHome = () => navigate("home");
  const goDashboard = () => navigate("dashboard");
  const goDeposit = () => navigate("deposit");
  const goWithdraw = () => navigate("withdraw");
  const goAdmin = () => navigate("admin");

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
