import { useEffect, useState } from "react";
import { evaluationPrograms, type Program } from "./config";
import { Navbar, Hero, Programs, HowItWorks, Features, Rules, ProfitSplit, FAQ, CTA, Footer } from "./components/Sections";
import { CheckoutModal } from "./components/CheckoutModal";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { addAccount, signOut, useStore } from "./store";

const toDash = () => { location.hash = "#/dashboard"; window.scrollTo(0, 0); };
const toHome = () => { location.hash = ""; window.scrollTo(0, 0); };

export default function App() {
  const { user, ready } = useStore();
  const [checkout, setCheckout] = useState<Program | null>(null);
  const [pending, setPending] = useState<Program | null>(null);
  const [auth, setAuth] = useState<"login" | "signup" | null>(null);
  const [route, setRoute] = useState(location.hash);
  useEffect(() => { const f = () => setRoute(location.hash); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  const onDash = route === "#/dashboard";
  useEffect(() => { if (ready && onDash && !user) setAuth("login"); }, [ready, onDash, user]);

  const popular = evaluationPrograms.find(p => p.popular) ?? evaluationPrograms[0];
  const buy = (p: Program) => { if (user) setCheckout(p); else { setPending(p); setAuth("signup"); } };
  const authed = () => { if (pending) { setCheckout(pending); setPending(null); } else if (onDash) toDash(); };

  return (
    <>
      {onDash && !ready ? <p className="p-10 text-muted">Loading…</p> : onDash && user ? <Dashboard onHome={toHome} /> : (<>
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
      <CheckoutModal program={checkout} onClose={() => setCheckout(null)} onDone={async p => { const err = await addAccount(p); if (err) alert(err); else toDash(); }} />
      <AuthModal mode={auth} setMode={setAuth} onClose={() => setAuth(null)} onAuthed={authed} />
    </>
  );
}
