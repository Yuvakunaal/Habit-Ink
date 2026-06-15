import React, { useEffect } from "react";

const BG     = "#FAF8F3";
const NAVY   = "#2B3A8C";
const GOLD   = "#C9A84C";
const TEXT   = "#2C2C2C";
const MUTED  = "#888888";
const BORDER = "#E8E2D9";

const CAVEAT: React.CSSProperties = { fontFamily: '"Caveat", cursive' };
const INTER:  React.CSSProperties = { fontFamily: '"Inter", system-ui, sans-serif' };

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "When you sign in with Google, we receive:",
        items: [
          "Your name and email address from your Google account",
          "A unique identifier (Google user ID) to link your account",
        ],
      },
      {
        subtitle: "Within the app, you create and we store:",
        items: [
          "Your habits — names, emojis, schedules, targets, and completion history",
          "Your daily journal entries — intentions, notes, wins, and challenges",
          "Your app preferences — theme, font, notification settings",
          "Your habit order and any custom settings you configure",
          "Wake-up times, if you choose to log them",
        ],
      },
      {
        subtitle: "We do not collect:",
        items: [
          "Payment information of any kind",
          "Device identifiers, IP addresses, or location data",
          "Any data you do not explicitly provide inside the app",
        ],
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Your data is used solely to:",
        items: [
          "Identify your account and securely sync your data across devices",
          "Display your habits, journal entries, streaks, and progress",
          "Calculate statistics like completion rates and streak lengths",
          "Restore your preferences when you return to the app",
        ],
      },
      {
        subtitle: "We never:",
        items: [
          "Use your data for advertising or marketing",
          "Sell, rent, or share your data with third parties",
          "Use your journal entries to train AI or machine learning models",
          "Read your personal journal entries — they belong to you",
        ],
      },
    ],
  },
  {
    title: "3. Data Storage & Security",
    content: [
      {
        subtitle: "Your data is stored securely using industry-standard practices:",
        items: [
          "All data is stored in a PostgreSQL database hosted by Supabase",
          "Row-Level Security (RLS) ensures each user can only access their own data",
          "All data is transmitted over HTTPS — never in plain text",
          "Authentication tokens are stored in your browser's secure session storage",
          "We do not store passwords — authentication is handled entirely by Google",
        ],
      },
    ],
  },
  {
    title: "4. Third-Party Services",
    content: [
      {
        subtitle: "Google Sign-In (OAuth 2.0)",
        items: [
          "We use Google Sign-In for authentication only",
          "We receive your name and email — nothing else",
          "Google's Privacy Policy governs the sign-in process",
          "You can revoke Habit Ink's access at any time in your Google account settings",
        ],
      },
      {
        subtitle: "Supabase",
        items: [
          "We use Supabase for secure database storage and session management",
          "Your habit and journal data is stored on Supabase infrastructure",
          "Supabase is SOC 2 compliant and uses AES-256 encryption at rest",
          "Supabase's Privacy Policy applies to data storage",
        ],
      },
      {
        subtitle: "We do not use:",
        items: [
          "Google Analytics, Meta Pixel, or any advertising trackers",
          "Third-party cookie services",
          "Any data brokers or data sharing platforms",
        ],
      },
    ],
  },
  {
    title: "5. Your Rights & Data Control",
    content: [
      {
        subtitle: "You are in full control of your data:",
        items: [
          "View all your data at any time inside the app",
          "Delete individual habits, journal entries, or history entries in-app",
          "Request a full export or complete deletion of your account and all data by emailing us",
          "Revoke Google access at any time through your Google Account settings — this signs you out of Habit Ink",
        ],
      },
    ],
  },
  {
    title: "6. Cookies & Local Storage",
    content: [
      {
        subtitle: "We use minimal browser storage:",
        items: [
          "Browser localStorage/sessionStorage to maintain your sign-in session",
          "No tracking cookies, advertising cookies, or third-party cookies",
          "No fingerprinting or cross-site tracking of any kind",
        ],
      },
    ],
  },
  {
    title: "7. Children's Privacy",
    content: [
      {
        subtitle: "Age requirements:",
        items: [
          "Habit Ink is not directed at children under the age of 13",
          "We do not knowingly collect data from children under 13",
          "If you believe a child has provided us data, please contact us for immediate deletion",
        ],
      },
    ],
  },
  {
    title: "8. Changes to This Policy",
    content: [
      {
        subtitle: "Policy updates:",
        items: [
          "We may update this Privacy Policy from time to time",
          "Significant changes will be reflected in the 'Last updated' date at the top of this page",
          "Continued use of Habit Ink after changes constitutes acceptance of the updated policy",
          "We will never make changes that reduce your privacy rights without clear notice",
        ],
      },
    ],
  },
  {
    title: "9. Contact Us",
    content: [
      {
        subtitle: "Questions, data requests, or deletion requests:",
        items: [
          "Email: yuvakunaal@gmail.com",
          "We aim to respond within 48 hours",
          "For data deletion requests, we will confirm and complete deletion within 30 days",
        ],
      },
    ],
  },
];

export default function PrivacyScreen() {
  useEffect(() => {
    document.title = "Privacy Policy — Habit Ink";
    window.scrollTo(0, 0);

    // Point canonical at /privacy (index.html defaults to /)
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") ?? null;
    canonical?.setAttribute("href", "https://habitink.app/privacy");

    // Inject BreadcrumbList schema
    const crumb = document.createElement("script");
    crumb.type = "application/ld+json";
    crumb.id   = "privacy-breadcrumb-schema";
    crumb.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",           "item": "https://habitink.app/" },
        { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://habitink.app/privacy" },
      ],
    });
    document.head.appendChild(crumb);

    // Unlock scroll for this page
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const prev = {
      htmlO: html.style.overflow, htmlH: html.style.height,
      bodyO: body.style.overflow, bodyH: body.style.height,
      rootO: root?.style.overflow ?? "", rootH: root?.style.height ?? "",
    };
    html.style.overflow = "auto"; html.style.height = "auto";
    body.style.overflow = "auto"; body.style.height = "auto";
    if (root) { root.style.overflow = "auto"; root.style.height = "auto"; }

    return () => {
      if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
      document.getElementById("privacy-breadcrumb-schema")?.remove();
      html.style.overflow = prev.htmlO; html.style.height = prev.htmlH;
      body.style.overflow = prev.bodyO; body.style.height = prev.bodyH;
      if (root) { root.style.overflow = prev.rootO; root.style.height = prev.rootH; }
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, ...INTER }}>

      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(250,248,243,0.95)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <a href="/" aria-label="Back to Habit Ink home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...CAVEAT, fontSize: 22, fontWeight: 700, color: NAVY }}>🖊 Habit Ink</span>
        </a>
        <a
          href="/"
          style={{
            ...INTER, fontSize: 14, fontWeight: 500, color: MUTED,
            textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
          }}
          aria-label="Back to home page"
        >
          ← Back to home
        </a>
      </header>

      {/* Page content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 100px" }}>

        {/* Title block */}
        <div style={{ marginBottom: 52, borderBottom: `1px solid ${BORDER}`, paddingBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            backgroundColor: `${NAVY}0D`, border: `1px solid ${NAVY}22`,
            borderRadius: 100, padding: "4px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", color: NAVY, textTransform: "uppercase" as const }}>
              Legal · Privacy
            </span>
          </div>

          <h1 style={{ ...CAVEAT, fontSize: 56, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: "0 0 8px" }}>
            <strong style={{ color: TEXT }}>Last updated:</strong> June 15, 2026
          </p>
          <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, margin: 0, maxWidth: 640 }}>
            Habit Ink is built on a simple principle: <strong>your data is yours</strong>. We
            collect only what's needed to run the app, we never sell it, and we never use it
            for advertising. This policy explains exactly what we collect, how it's stored,
            and how you can control it.
          </p>
        </div>

        {/* Quick summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 52 }}>
          {[
            { emoji: "🔒", title: "100% Private", desc: "Your journal entries are never read or shared" },
            { emoji: "🚫", title: "No Ads Ever",  desc: "We don't run ads or use advertising trackers" },
            { emoji: "🆓", title: "Free Forever", desc: "No payments, no credit card, no hidden costs" },
            { emoji: "✉️", title: "You're in Control", desc: "Request full data export or deletion anytime" },
          ].map((card, i) => (
            <div key={i} style={{
              backgroundColor: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: "18px 16px",
              display: "flex",
              flexDirection: "column" as const,
              gap: 6,
            }}>
              <span style={{ fontSize: 22 }}>{card.emoji}</span>
              <strong style={{ fontSize: 14, color: NAVY }}>{card.title}</strong>
              <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Policy sections */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 44 }}>
          {SECTIONS.map((section, si) => (
            <section
              key={si}
              id={`section-${si + 1}`}
              style={{ borderBottom: si < SECTIONS.length - 1 ? `1px solid ${BORDER}` : "none", paddingBottom: si < SECTIONS.length - 1 ? 44 : 0 }}
            >
              <h2 style={{ ...CAVEAT, fontSize: 30, fontWeight: 700, color: NAVY, margin: "0 0 20px" }}>
                {section.title}
              </h2>
              {section.content.map((block, bi) => (
                <div key={bi} style={{ marginBottom: bi < section.content.length - 1 ? 20 : 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: "0 0 10px" }}>
                    {block.subtitle}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column" as const, gap: 7 }}>
                    {block.items.map((item, ii) => (
                      <li key={ii} style={{ fontSize: 15, color: TEXT, lineHeight: 1.65 }}>
                        {item.startsWith("Email:") ? (
                          <>Email:{" "}
                            <a
                              href="mailto:yuvakunaal@gmail.com"
                              style={{ color: NAVY, fontWeight: 600, textDecoration: "none" }}
                            >
                              yuvakunaal@gmail.com
                            </a>
                          </>
                        ) : item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: 64,
          backgroundColor: NAVY,
          borderRadius: 20,
          padding: "36px 32px",
          textAlign: "center" as const,
          position: "relative" as const,
          overflow: "hidden" as const,
        }}>
          <div style={{
            position: "absolute" as const, inset: 0,
            backgroundImage: `radial-gradient(circle, rgba(201,168,76,0.12) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            pointerEvents: "none" as const,
          }} aria-hidden="true" />
          <p style={{ ...INTER, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" as const, margin: "0 0 10px" }}>
            QUESTIONS?
          </p>
          <h2 style={{ ...CAVEAT, fontSize: 36, fontWeight: 700, color: BG, margin: "0 0 10px" }}>
            We're here to help.
          </h2>
          <p style={{ ...INTER, fontSize: 15, color: "rgba(250,248,243,0.65)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Email us about your data, request a deletion, or just say hello.
          </p>
          <a
            href="mailto:yuvakunaal@gmail.com"
            style={{
              ...INTER, fontSize: 15, fontWeight: 600, color: NAVY,
              backgroundColor: GOLD, borderRadius: 10, padding: "12px 28px",
              textDecoration: "none", display: "inline-block",
            }}
          >
            yuvakunaal@gmail.com
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "20px 24px",
        textAlign: "center" as const,
        backgroundColor: BG,
      }}>
        <nav aria-label="Footer links" style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 8, flexWrap: "wrap" as const }}>
          {[
            { href: "/",              label: "Home" },
            { href: "/#how-it-works", label: "How It Works" },
            { href: "/#features",     label: "Features" },
            { href: "/#get-started",  label: "Get Started" },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ ...INTER, fontSize: 12, color: MUTED, textDecoration: "none" }}>
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ ...INTER, fontSize: 12, color: BORDER, margin: 0 }}>
          © 2026 Habit Ink · Made by Kunaal
        </p>
      </footer>
    </div>
  );
}
