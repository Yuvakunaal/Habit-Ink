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
    title: "1. Acceptance of Terms",
    content: [
      {
        subtitle: "By using Habit Ink, you agree to these Terms:",
        items: [
          "By accessing or using Habit Ink, you agree to be bound by these Terms of Service",
          "If you do not agree to these Terms, please do not use the app",
          "We may update these Terms from time to time — continued use after changes means acceptance",
          "These Terms apply to all users of Habit Ink, including visitors and registered users",
        ],
      },
    ],
  },
  {
    title: "2. Your Account",
    content: [
      {
        subtitle: "Account responsibilities:",
        items: [
          "You must sign in with a valid Google account to use Habit Ink's core features",
          "You are responsible for maintaining the security of your Google account",
          "You must not use another person's account or share your account with others",
          "You must be at least 13 years old to create an account",
          "You are responsible for all activity that occurs under your account",
        ],
      },
    ],
  },
  {
    title: "3. Acceptable Use",
    content: [
      {
        subtitle: "You agree to use Habit Ink only for lawful purposes:",
        items: [
          "Do not attempt to gain unauthorized access to any part of the service or its infrastructure",
          "Do not use the service to transmit harmful, offensive, or illegal content",
          "Do not attempt to reverse-engineer, scrape, or copy the service",
          "Do not use automated tools to access or interact with the service without permission",
          "Do not abuse the Groups feature to spam, harass, or harm other users",
        ],
      },
      {
        subtitle: "Content you create:",
        items: [
          "Your habit names, journal entries, and group messages are your own content",
          "You retain ownership of content you create — we do not claim any rights to it",
          "You are responsible for ensuring the content you create does not violate any laws",
          "We do not monitor or moderate personal journal entries — they are private to you",
        ],
      },
    ],
  },
  {
    title: "4. The Service",
    content: [
      {
        subtitle: "What Habit Ink provides:",
        items: [
          "A free personal habit tracking and journaling application",
          "Optional social features including Groups, Challenges, Chat, and Nudges",
          "Data synced securely across your devices via your Google account",
          "The service is provided 'as-is' — we do not guarantee uninterrupted availability",
        ],
      },
      {
        subtitle: "Service changes:",
        items: [
          "We reserve the right to modify, suspend, or discontinue any part of the service",
          "We will make reasonable efforts to notify users of significant changes",
          "We are not liable to you or any third party for any modification or discontinuation",
        ],
      },
    ],
  },
  {
    title: "5. Free Forever Policy",
    content: [
      {
        subtitle: "Habit Ink is and will remain free to use:",
        items: [
          "There are no paid plans, premium tiers, or subscription fees",
          "We will never charge for features that are currently free",
          "If we ever introduce optional paid features in the future, all current features will remain free",
          "We do not monetize your data — your information is never sold or shared for profit",
        ],
      },
    ],
  },
  {
    title: "6. Groups & Social Features",
    content: [
      {
        subtitle: "When using Groups, Challenges, and Chat:",
        items: [
          "You are responsible for the content you post in group chats and feeds",
          "Group admins have the right to remove members and manage group settings",
          "Do not use group features to harass, bully, or intimidate other members",
          "We reserve the right to remove groups or users that violate these Terms",
          "Group chat history may be limited — older messages may be automatically removed",
        ],
      },
    ],
  },
  {
    title: "7. Intellectual Property",
    content: [
      {
        subtitle: "Ownership of Habit Ink:",
        items: [
          "Habit Ink, its design, code, branding, and content are owned by the developer",
          "The Habit Ink name, logo, and visual design are not licensed for external use",
          "You may not copy, reproduce, or redistribute any part of the service without permission",
          "Feedback and suggestions you provide may be used to improve the service without obligation",
        ],
      },
    ],
  },
  {
    title: "8. Disclaimers & Limitation of Liability",
    content: [
      {
        subtitle: "Important limitations:",
        items: [
          "Habit Ink is provided 'as-is' without warranties of any kind, express or implied",
          "We are not responsible for any loss of data, missed habits, or personal harm arising from use",
          "We are not liable for any indirect, incidental, or consequential damages",
          "Habit Ink is a personal productivity tool — it is not a medical or therapeutic service",
          "Our total liability to you for any claims is limited to the amount you paid us (which is zero)",
        ],
      },
    ],
  },
  {
    title: "9. Termination",
    content: [
      {
        subtitle: "Account termination:",
        items: [
          "You may stop using Habit Ink at any time by signing out and revoking Google access",
          "You may request full account and data deletion by emailing us",
          "We reserve the right to suspend or terminate accounts that violate these Terms",
          "Upon termination, your data will be deleted in accordance with our Privacy Policy",
        ],
      },
    ],
  },
  {
    title: "10. Contact Us",
    content: [
      {
        subtitle: "Questions about these Terms:",
        items: [
          "Email: yuvakunaal@gmail.com",
          "We aim to respond to all inquiries within 48 hours",
          "For account deletion requests, we will confirm and complete deletion within 30 days",
        ],
      },
    ],
  },
];

export default function TermsScreen() {
  useEffect(() => {
    document.title = "Terms of Service — Habit Ink";
    window.scrollTo(0, 0);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") ?? null;
    canonical?.setAttribute("href", "https://habitink.app/terms");

    const crumb = document.createElement("script");
    crumb.type = "application/ld+json";
    crumb.id = "terms-breadcrumb-schema";
    crumb.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",             "item": "https://habitink.app/" },
        { "@type": "ListItem", "position": 2, "name": "Terms of Service", "item": "https://habitink.app/terms" },
      ],
    });
    document.head.appendChild(crumb);

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
      document.getElementById("terms-breadcrumb-schema")?.remove();
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
              Legal · Terms
            </span>
          </div>

          <h1 style={{ ...CAVEAT, fontSize: 56, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.1 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: MUTED, margin: "0 0 8px" }}>
            <strong style={{ color: TEXT }}>Last updated:</strong> June 19, 2026
          </p>
          <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, margin: 0, maxWidth: 640 }}>
            These Terms of Service govern your use of Habit Ink. By signing in and using the app,
            you agree to these terms. We've written them to be clear and human-readable — not
            legalese. If something isn't clear, just email us.
          </p>
        </div>

        {/* Quick summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 52 }}>
          {[
            { emoji: "🆓", title: "Free Forever",    desc: "No paid plans, no hidden fees — ever" },
            { emoji: "📝", title: "Your Content",    desc: "You own everything you write in the app" },
            { emoji: "🤝", title: "Be Respectful",   desc: "Use Groups and Chat kindly and honestly" },
            { emoji: "✉️", title: "Easy to Leave",   desc: "Delete your account and data any time" },
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

        {/* Terms sections */}
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
            Reach out with any questions about these Terms or your account.
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
            { href: "/",        label: "Home" },
            { href: "/blog",    label: "Blog" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms",   label: "Terms of Service" },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ ...INTER, fontSize: 12, color: MUTED, textDecoration: "none" }}>
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ ...INTER, fontSize: 12, color: "#2d2a25", margin: 0 }}>
          © 2026 Habit Ink · Made by Kunaal
        </p>
      </footer>
    </div>
  );
}
