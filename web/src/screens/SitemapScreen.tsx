import React, { useEffect } from "react";
import { ALL_POSTS } from "@/blog";

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
    label: "Main Pages",
    pages: [
      { href: "/",        title: "Home",            desc: "Free daily habit tracker and journal app" },
      { href: "/blog",    title: "Blog",             desc: "Habit science, journaling tips, and morning routines" },
      { href: "/privacy", title: "Privacy Policy",   desc: "How we handle your data" },
      { href: "/terms",   title: "Terms of Service", desc: "Terms for using Habit Ink" },
    ],
  },
];

export default function SitemapScreen() {
  useEffect(() => {
    document.title = "Sitemap — Habit Ink";
    window.scrollTo(0, 0);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prev = canonical?.getAttribute("href") ?? null;
    canonical?.setAttribute("href", `${window.location.origin}/sitemap`);

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const prevStyles = {
      htmlO: html.style.overflow, htmlH: html.style.height,
      bodyO: body.style.overflow, bodyH: body.style.height,
      rootO: root?.style.overflow ?? "", rootH: root?.style.height ?? "",
    };
    html.style.overflow = "auto"; html.style.height = "auto";
    body.style.overflow = "auto"; body.style.height = "auto";
    if (root) { root.style.overflow = "auto"; root.style.height = "auto"; }

    return () => {
      if (canonical && prev) canonical.setAttribute("href", prev);
      html.style.overflow = prevStyles.htmlO; html.style.height = prevStyles.htmlH;
      body.style.overflow = prevStyles.bodyO; body.style.height = prevStyles.bodyH;
      if (root) { root.style.overflow = prevStyles.rootO; root.style.height = prevStyles.rootH; }
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
        <a href="/" style={{ ...INTER, fontSize: 14, fontWeight: 500, color: MUTED, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          ← Back to home
        </a>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 100px" }}>

        {/* Title */}
        <div style={{ marginBottom: 52, borderBottom: `1px solid ${BORDER}`, paddingBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            backgroundColor: `${NAVY}0D`, border: `1px solid ${NAVY}22`,
            borderRadius: 100, padding: "4px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", color: NAVY, textTransform: "uppercase" as const }}>
              Navigation · Sitemap
            </span>
          </div>
          <h1 style={{ ...CAVEAT, fontSize: 56, fontWeight: 700, color: NAVY, margin: "0 0 12px", lineHeight: 1.1 }}>
            Sitemap
          </h1>
          <p style={{ fontSize: 16, color: TEXT, lineHeight: 1.75, margin: 0, maxWidth: 560 }}>
            A complete list of all pages on Habit Ink. Find what you're looking for or explore everything the app has to offer.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 48 }}>

          {/* Main pages */}
          {SECTIONS.map(section => (
            <section key={section.label}>
              <h2 style={{ ...CAVEAT, fontSize: 28, fontWeight: 700, color: NAVY, margin: "0 0 20px" }}>
                {section.label}
              </h2>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
                {section.pages.map(page => (
                  <a
                    key={page.href}
                    href={page.href}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px", borderRadius: 12,
                      border: `1px solid ${BORDER}`, backgroundColor: "#fff",
                      textDecoration: "none", gap: 12,
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = NAVY; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{page.title}</div>
                      <div style={{ fontSize: 13, color: MUTED }}>{page.desc}</div>
                    </div>
                    <span style={{ fontSize: 13, color: MUTED, flexShrink: 0 }}>
                      {window.location.origin}{page.href}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}

          {/* Blog posts */}
          <section>
            <h2 style={{ ...CAVEAT, fontSize: 28, fontWeight: 700, color: NAVY, margin: "0 0 20px" }}>
              Blog Posts
            </h2>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
              {ALL_POSTS.map(post => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px", borderRadius: 12,
                    border: `1px solid ${BORDER}`, backgroundColor: "#fff",
                    textDecoration: "none", gap: 12,
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = NAVY; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{post.title}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{post.excerpt?.slice(0, 80)}…</div>
                  </div>
                  <span style={{ fontSize: 13, color: MUTED, flexShrink: 0 }}>
                    /blog/{post.slug}
                  </span>
                </a>
              ))}
            </div>
          </section>

        </div>

        {/* CTA */}
        <div style={{
          marginTop: 64, backgroundColor: NAVY, borderRadius: 20,
          padding: "36px 32px", textAlign: "center" as const,
          position: "relative" as const, overflow: "hidden" as const,
        }}>
          <div style={{
            position: "absolute" as const, inset: 0,
            backgroundImage: `radial-gradient(circle, rgba(201,168,76,0.12) 1px, transparent 1px)`,
            backgroundSize: "28px 28px", pointerEvents: "none" as const,
          }} aria-hidden="true" />
          <p style={{ ...INTER, fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", color: GOLD, textTransform: "uppercase" as const, margin: "0 0 10px" }}>
            FREE FOREVER
          </p>
          <h2 style={{ ...CAVEAT, fontSize: 36, fontWeight: 700, color: BG, margin: "0 0 10px" }}>
            Start tracking today.
          </h2>
          <p style={{ ...INTER, fontSize: 15, color: "rgba(250,248,243,0.65)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Build better habits and journal daily — all in one free app.
          </p>
          <a
            href="/"
            style={{
              ...INTER, fontSize: 15, fontWeight: 600, color: NAVY,
              backgroundColor: GOLD, borderRadius: 10, padding: "12px 28px",
              textDecoration: "none", display: "inline-block",
            }}
          >
            Get Started Free →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "20px 24px", textAlign: "center" as const, backgroundColor: BG }}>
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
