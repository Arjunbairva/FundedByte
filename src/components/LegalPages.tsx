import { Logo } from "./Sections";

type LegalPageProps = { page: LegalPage; onHome: () => void };

export type LegalPage =
  | "terms"
  | "privacy"
  | "refund"
  | "risk"
  | "aml"
  | "cookies"
  | "complaints";

const content: Record<LegalPage, { title: string; intro: string; sections: Array<[string,string]> }> = {
  terms: {
    title: "Terms & Conditions",
    intro: "These terms govern access to and use of FundedBytes. They should be reviewed and finalized by qualified legal counsel before the platform is offered commercially.",
    sections: [
      ["1. Service", "FundedBytes provides access to its online trading-platform interface, account features, market information and related services as described on the website. The current platform uses simulated/paper trading unless a specific execution or brokerage arrangement is expressly stated."],
      ["2. Eligibility and jurisdiction", "You must be legally permitted to use the service in your jurisdiction and must provide accurate information. FundedBytes may restrict access where required by law, regulation, payment-provider rules or internal risk controls."],
      ["3. Account security", "You are responsible for protecting your login credentials and for activity conducted through your account. Contact support promptly if you believe your account has been compromised."],
      ["4. Funding and verification", "Deposits are subject to payment verification. Users must provide accurate payment references and must use only the payment method and network shown at checkout. A payment is not treated as credited until it has been reviewed and approved."],
      ["5. Trading risk", "Market prices can change rapidly and trading can result in losses. Nothing on the website is financial, investment, tax or legal advice, and no return or profit is guaranteed."],
      ["6. Prohibited use", "Do not use the service for fraud, money laundering, sanctions evasion, unauthorized payments, market manipulation, account abuse, automated attacks or any unlawful purpose."],
      ["7. Suspension and termination", "FundedBytes may suspend or terminate access where there is suspected fraud, security abuse, violation of these terms, payment irregularity, legal requirement or material risk to the platform."],
      ["8. Changes", "We may update the service and these terms from time to time. The effective date shown on this page applies to the published version."],
      ["9. Contact", "For support regarding the platform or a payment issue, email nujranbiz@gmail.com."]
    ]
  },
  privacy: {
    title: "Privacy Policy",
    intro: "This notice explains the categories of personal information FundedBytes may process and the purposes for which it is used.",
    sections: [
      ["1. Information we collect", "Depending on how you use the platform, we may process account identifiers, verified email or phone information, login/session information, transaction details, payment references, wallet addresses, support communications, device information and technical logs."],
      ["2. How we use information", "We use information to create and secure accounts, process and verify transactions, provide the platform, prevent fraud and abuse, respond to support requests, maintain security, troubleshoot problems and comply with applicable legal obligations."],
      ["3. Payment information", "UPI references and crypto transaction information may be processed to verify deposits and withdrawals. We do not ask users to send passwords, authentication codes or private wallet keys through support channels."],
      ["4. Service providers", "We may use technology, authentication, hosting, analytics, payment and infrastructure providers to operate the service. Providers receive information only as reasonably necessary for their services and applicable requirements."],
      ["5. Retention and security", "We retain information for as long as reasonably necessary for the stated purposes, security, dispute handling and applicable legal or regulatory requirements. We use technical and organizational measures intended to protect information."],
      ["6. Your choices", "You may contact us about access, correction or deletion requests where applicable. Some records may need to be retained where required for security, dispute resolution or legal obligations."],
      ["7. Contact", "Privacy requests can be sent to nujranbiz@gmail.com."]
    ]
  },
  refund: {
    title: "Refund & Cancellation Policy",
    intro: "Funding transactions and platform services are handled according to the status of the transaction and the applicable payment method.",
    sections: [
      ["1. Pending deposits", "A deposit remains pending until the payment team verifies the payment. Do not send additional funds solely because a transaction is still pending."],
      ["2. Duplicate or erroneous payment", "If you accidentally make a duplicate or incorrect payment, contact nujranbiz@gmail.com promptly with the transaction reference, amount, date and payment method. Any refund is subject to verification, payment-provider rules and applicable law."],
      ["3. Rejected deposits", "A deposit may be rejected where payment details cannot be verified, the payment does not match the submitted information, the wrong network is used, or the transaction presents a security or compliance concern. Where a refund is legally and operationally available, it will be handled through the applicable payment channel."],
      ["4. Withdrawals", "Withdrawal requests are subject to review and are not guaranteed to be completed instantly. If a withdrawal is rejected, the applicable amount may remain in the account unless another outcome is required by law or the payment provider."],
      ["5. No blanket refund promise", "Nothing on this page overrides mandatory consumer or other legal rights that apply to a user or transaction."],
      ["6. Contact", "For a refund or payment dispute, email nujranbiz@gmail.com with your transaction details."]
    ]
  },
  risk: {
    title: "Risk Disclosure",
    intro: "Trading financial markets involves substantial risk. Read this notice before using any trading-related feature.",
    sections: [
      ["1. Market risk", "Forex, commodities and other financial instruments can move quickly and unpredictably. You can lose money and, depending on the product and arrangement, losses can occur rapidly."],
      ["2. Leverage and margin", "Where leverage or margin is offered, it magnifies both gains and losses. Small market movements can have a significant effect on an account."],
      ["3. Technology risk", "Internet connections, market-data feeds, third-party providers, software defects, latency and outages can affect access, pricing or order processing."],
      ["4. No guaranteed returns", "Past performance, examples, simulated results and promotional figures are not guarantees of future performance. FundedBytes does not promise profits."],
      ["5. Independent advice", "Consider your objectives, experience and financial circumstances and obtain independent professional advice where appropriate before trading."]
    ]
  },
  aml: {
    title: "AML & Prohibited Activity Policy",
    intro: "FundedBytes does not permit the platform or its payment channels to be used for unlawful financial activity.",
    sections: [
      ["1. Prohibited activity", "Users must not use the service for money laundering, terrorist financing, sanctions evasion, fraud, stolen funds, payment abuse or other unlawful activity."],
      ["2. Payment ownership", "Payments should be made only through payment methods or wallets that the user is authorized to use. We may request information necessary to investigate a payment or suspicious activity."],
      ["3. Monitoring", "Transactions may be reviewed using internal controls and third-party information where appropriate. A transaction or account may be delayed, rejected, restricted or suspended when necessary for security, provider rules or legal obligations."],
      ["4. Legal and regulatory requirements", "Where applicable, FundedBytes may cooperate with competent authorities and maintain records required by law."],
      ["5. KYC statement", "The current onboarding flow may not request KYC information at account opening, but this does not mean identity or transaction verification can never be required. FundedBytes may introduce verification where required by law, a payment provider, risk controls or the nature of a service."]
    ]
  },
  cookies: {
    title: "Cookie Policy",
    intro: "This policy explains how cookies and similar technologies may be used on the FundedBytes website.",
    sections: [
      ["1. Essential technologies", "We may use cookies, local storage and similar technologies required for authentication, session continuity, security, preferences and core site functionality."],
      ["2. Analytics and performance", "If analytics or similar tools are enabled, they may collect technical information about how the site is used so we can diagnose issues and improve performance."],
      ["3. Third parties", "Third-party services embedded in the platform may set or access their own technologies according to their respective policies."],
      ["4. Managing cookies", "You can manage or delete cookies through your browser settings. Disabling essential technologies may prevent parts of the platform from working correctly."]
    ]
  },
  complaints: {
    title: "Complaints & Grievance Policy",
    intro: "We want payment and account issues to be reported through a clear support channel.",
    sections: [
      ["1. Contact support", "Send your complaint to nujranbiz@gmail.com. Include your account identifier, transaction reference, date, amount, payment method and a concise description of the issue. Never send passwords, OTPs, private keys or recovery phrases."],
      ["2. Review", "We will review the information available to us and may request additional evidence needed to investigate a payment, account or security issue."],
      ["3. Payment disputes", "For UPI or crypto payment disputes, retain the bank/UPI reference or blockchain transaction hash and provide it with your complaint."],
      ["4. Legal escalation", "Nothing in this policy limits rights or remedies available under applicable law."]
    ]
  }
};

export function LegalPageView({ page, onHome }: LegalPageProps) {
  const item = content[page];
  return <div className="min-h-screen bg-ink text-fg">
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <button onClick={onHome}><Logo /></button>
        <button onClick={onHome} className="text-sm text-muted hover:text-fg">Back to home</button>
      </div>
    </header>
    <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <p className="text-sm font-semibold text-brand">LEGAL</p>
      <h1 className="mt-2 text-4xl font-bold">{item.title}</h1>
      <p className="mt-4 text-sm text-muted">Effective date: 2 October 2026</p>
      <p className="mt-6 rounded-2xl border border-line bg-panel p-5 leading-7 text-muted">{item.intro}</p>
      <div className="mt-8 space-y-5">
        {item.sections.map(([heading, body]) => <section key={heading} className="rounded-2xl border border-line bg-card p-6"><h2 className="text-lg font-semibold">{heading}</h2><p className="mt-2 leading-7 text-muted">{body}</p></section>)}
      </div>
      <p className="mt-8 text-xs leading-6 text-muted">Important: This website text is general product-policy content, not legal advice. Before commercial launch, have these policies reviewed for the exact entity, jurisdiction, financial permissions, payment arrangements and consumer-law obligations applicable to FundedBytes.</p>
    </main>
  </div>;
}
