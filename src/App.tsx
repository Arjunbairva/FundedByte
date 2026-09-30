import { useEffect, useState } from "react";
import { Dashboard, type DashboardTab } from "./components/Dashboard";
import { AuthModal } from "./components/AuthModal";
import { Navbar, HomePage, Footer } from "./components/Sections";
import { CheckoutPage } from "./components/CheckoutPage";
import { useStore, signOut } from "./store";

type Route = "home" | "dashboard" | "deposit" | "withdraw";

const routeFromHash = (): Route => {
  switch (location.hash) {
    case "#/dashboard": return "dashboard";
    case "#/deposit": return "deposit";
    case "#/withdraw": return "withdraw";
    default: return "home";
  }
};

const navigate = (route: Route) => {
  location.hash = route === "home" ? "" : `#/${route}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function App() {
  const { user, ready } = useStore();
  const [route, setRoute] = useState<Route>(routeFromHash());
  const [auth, setAuth] = useState<"login" | "signup" | null>(null);
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("overview");

  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (ready && route !== "home" && !user) setAuth("login");
  }, [ready, route, user]);

  const goHome = () => navigate("home");
  const goDashboard = () => navigate("dashboard");
  const goDeposit = () => navigate("deposit");
  const goWithdraw = () => navigate("withdraw");

  if (route === "dashboard" && user) {
    return <Dashboard tab={dashboardTab} onTabChange={setDashboardTab} onHome={goHome} onDeposit={goDeposit} onWithdraw={goWithdraw} onLogout={() => { signOut(); goHome(); }} />;
  }

  if (route === "deposit" && user) {
    return <CheckoutPage mode="deposit" onBack={goDashboard} onComplete={goDashboard} />;
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
