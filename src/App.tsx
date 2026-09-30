import { useEffect, useState } from "react";
import { evaluationPrograms, type Program } from "./config";
import { Navbar, Hero, Programs, HowItWorks, Features, Rules, ProfitSplit, FAQ, CTA, Footer } from "./components/Sections";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { CheckoutPage } from "./components/CheckoutPage";
import { signOut, useStore } from "./store";

const toDash = () => { location.hash = "#/dashboard"; window.scrollTo(0, 0); };
const toHome = () => { location.hash = ""; window.scrollTo(0, 0); };
const toCheckout = (p: Program) => { location.hash = `#/checkout/${encodeURIComponent(p.id)}`; window.scrollTo(0, 0); };

export default function App() {
  const { user, ready } = useStore();
  const [checkout, setCheckout] = useState<Program | null>(null);
  const [pending, setPending] = useState<Program | null>(null);
  const [auth, setAuth] = useState<"login" | "signup" | null>(null);
  const [route, setRoute] = useState(location.hash);
  useEffect(() => { const f = () => setRoute(location.hash); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  const onDash = route === "#/dashboard";
  const onCheckout = route.startsWith("#/checkout/");
  const checkoutId = onCheckout ? decodeURIComponent(route.slice("#/checkout/".length)) : "";
  const checkoutProgram = evaluationPrograms.find(p => p.id === checkoutId) ?? null;
  useEffect(() => { if (ready && (onDash || onCheckout) && !user) setAuth("login"); }, [ready, onDash, onCheckout, user]);

  const popular = evaluationPrograms.find(p => p.popular) ?? evaluationPrograms[0];
  const buy = (p: Program) => { if (user) toCheckout(p); else { setPending(p); setAuth("signup"); } };
  const authed = () => { if (pending) { const p = pending; setPending(null); toCheckout(p); } else if (onDash) toDash(); };

  return (
    <>
      {((onDash || onCheckout) && !ready) ? <p className="p-10 text-muted">Loading…</p> : onDash && user ? <Dashboard onHome={toHome} /> : onCheckout && user && checkoutProgram ? <CheckoutPage program={checkoutProgram} onBack={toHome} /> : (<>
        <Navbar user={user} onLogin={() => setAuth("login")} onStart={() => buy(popular)} onDash={toDash} onLogout={signOut} />
        <main id="main">
          <Hero onStart={() => buy(popular)} />
          <Programs onBuy={buy} />
          <HowItWorks />
          <Features />
          <Rules />
          <ProfitSplit />
          <FAQ />
          <CTA onStart={() => buy(popular)} />
        </main>
        <Footer />
      </>)}
      <AuthModal mode={auth} setMode={setAuth} onClose={() => setAuth(null)} onAuthed={authed} />
    </>
  );
}
