import { useState } from "react";
import { evaluationPrograms, type Program } from "./config";
import { Navbar, Hero, Programs, HowItWorks, Features, Rules, ProfitSplit, FAQ, CTA, Footer } from "./components/Sections";
import { CheckoutModal } from "./components/CheckoutModal";
import { AuthModal } from "./components/AuthModal";
import { SuccessPage } from "./components/SuccessPage";

export default function App() {
  const [checkout, setCheckout] = useState<Program | null>(null);
  const [auth, setAuth] = useState<"login" | "signup" | null>(null);
  const [purchased, setPurchased] = useState<Program | null>(null);
  const popular = evaluationPrograms.find(p => p.popular) ?? evaluationPrograms[0];
  const toRules = () => { setPurchased(null); setTimeout(() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" }), 50); };

  if (purchased) return <SuccessPage program={purchased} onHome={toRules} />;
  return (
    <>
      <Navbar onLogin={() => setAuth("login")} onStart={() => setCheckout(popular)} />
      <main>
        <Hero onStart={() => setCheckout(popular)} />
        <Programs onBuy={setCheckout} />
        <HowItWorks />
        <Features />
        <Rules onViewRules={() => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" })} />
        <ProfitSplit />
        <FAQ />
        <CTA onStart={() => setCheckout(popular)} />
      </main>
      <Footer onStart={() => setCheckout(popular)} />
      <CheckoutModal program={checkout} onClose={() => setCheckout(null)} onDone={setPurchased} />
      <AuthModal mode={auth} setMode={setAuth} onClose={() => setAuth(null)} />
    </>
  );
}