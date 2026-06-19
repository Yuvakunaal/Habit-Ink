import React, { useEffect, useState } from "react";
import { ALL_POSTS, ALL_CATEGORIES, type BlogPost } from "@/blog";

const BG     = "#FAF8F3";
const NAVY   = "#2B3A8C";
const GOLD   = "#C9A84C";
const TEXT   = "#2C2C2C";
const MUTED  = "#888888";
const BORDER = "#E8E2D9";
const CARD   = "#FFFFFF";

const CAVEAT: React.CSSProperties = { fontFamily: '"Caveat", cursive' };
const INTER:  React.CSSProperties = { fontFamily: '"Inter", system-ui, sans-serif' };

const CATEGORY_COLORS: Record<string, string> = {
  "Habit Science":    "#2B3A8C",
  "Challenges":       "#7C3AED",
  "Journaling":       "#0E7490",
  "Morning Routines": "#B45309",
  "Reviews":          "#166534",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function CategoryPill({ category, small }: { category: string; small?: boolean }) {
  const color = CATEGORY_COLORS[category] ?? NAVY;
  return (
    <span style={{
      ...INTER,
      display: "inline-block",
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      color,
      backgroundColor: `${color}14`,
      border: `1px solid ${color}30`,
      borderRadius: 100,
      padding: small ? "2px 10px" : "3px 12px",
    }}>
      {category}
    </span>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article style={{
        backgroundColor: NAVY,
        borderRadius: 20,
        padding: "40px 40px 36px",
        position: "relative" as const,
        overflow: "hidden" as const,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered
          ? "0 20px 60px rgba(43,58,140,0.25)"
          : "0 4px 20px rgba(43,58,140,0.12)",
      }}>
        {/* Dot-grid texture */}
        <div style={{
          position: "absolute" as const, inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(201,168,76,0.15) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          pointerEvents: "none" as const,
        }} aria-hidden="true" />

        {/* Tag row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, position: "relative" as const }}>
          <span style={{
            ...INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase" as const, color: GOLD,
            backgroundColor: `${GOLD}20`, borderRadius: 100, padding: "3px 12px",
          }}>
            {post.category}
          </span>
          <span style={{ ...INTER, fontSize: 12, color: "rgba(250,248,243,0.45)" }}>
            {post.readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h2 style={{ ...CAVEAT, fontSize: 38, fontWeight: 700, color: BG, margin: "0 0 14px", lineHeight: 1.15, maxWidth: 600, position: "relative" as const }}>
          {post.title}
        </h2>

        {/* Excerpt */}
        <p style={{ ...INTER, fontSize: 16, color: "rgba(250,248,243,0.65)", lineHeight: 1.65, maxWidth: 540, margin: "0 0 28px", position: "relative" as const }}>
          {post.excerpt}
        </p>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" as const, flexWrap: "wrap" as const, gap: 12 }}>
          <span style={{ ...INTER, fontSize: 13, color: "rgba(250,248,243,0.40)" }}>
            {formatDate(post.date)}
          </span>
          <span style={{
            ...INTER, fontSize: 14, fontWeight: 600, color: NAVY,
            backgroundColor: GOLD, borderRadius: 8, padding: "8px 20px",
          }}>
            Read article →
          </span>
        </div>
      </article>
    </a>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
      <article style={{
        backgroundColor: CARD,
        border: `1px solid ${hovered ? `${NAVY}30` : BORDER}`,
        borderRadius: 16,
        padding: "28px 28px 24px",
        height: "100%",
        boxSizing: "border-box" as const,
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(43,58,140,0.08)" : "none",
      }}>
        <CategoryPill category={post.category} small />

        <h3 style={{ ...CAVEAT, fontSize: 24, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.2, flex: 1 }}>
          {post.title}
        </h3>

        <p style={{ ...INTER, fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>
          {post.excerpt}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8, borderTop: `1px solid ${BORDER}` }}>
          <span style={{ ...INTER, fontSize: 12, color: MUTED }}>{formatDate(post.date)}</span>
          <span style={{ ...INTER, fontSize: 12, color: MUTED }}>{post.readingTime} min read</span>
        </div>
      </article>
    </a>
  );
}

export default function BlogListScreen() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    document.title = "Blog — Habit Ink | Habit Science, Journaling & Morning Routines";
    window.scrollTo(0, 0);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prev = canonical?.getAttribute("href") ?? null;
    canonical?.setAttribute("href", "https://habitink.app/blog");

    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "blog-list-schema";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": "https://habitink.app/blog",
      "name": "The Habit Ink Journal",
      "description": "Habit science, journaling tips, morning routines, and guides for building better habits.",
      "url": "https://habitink.app/blog",
      "publisher": {
        "@type": "Organization",
        "name": "Habit Ink",
        "url": "https://habitink.app",
      },
    });
    document.head.appendChild(schema);

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
      document.getElementById("blog-list-schema")?.remove();
      html.style.overflow = prevStyles.htmlO; html.style.height = prevStyles.htmlH;
      body.style.overflow = prevStyles.bodyO; body.style.height = prevStyles.bodyH;
      if (root) { root.style.overflow = prevStyles.rootO; root.style.height = prevStyles.rootH; }
    };
  }, []);

  const filtered = activeCategory === "All"
    ? ALL_POSTS
    : ALL_POSTS.filter(p => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, ...INTER }}>

      {/* Sticky header */}
      <header style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(250,248,243,0.95)",
        position: "sticky" as const,
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="/" aria-label="Back to Habit Ink home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...CAVEAT, fontSize: 22, fontWeight: 700, color: NAVY }}>🖊 Habit Ink</span>
          </a>
          <span style={{ color: BORDER, fontSize: 16, userSelect: "none" }}>|</span>
          <span style={{ ...INTER, fontSize: 14, fontWeight: 600, color: MUTED }}>Blog</span>
        </div>
        <a
          href="/"
          style={{
            ...INTER, fontSize: 13, fontWeight: 600, color: NAVY,
            backgroundColor: `${NAVY}0D`, border: `1px solid ${NAVY}22`,
            borderRadius: 8, padding: "7px 16px", textDecoration: "none",
          }}
        >
          Start Free →
        </a>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px 100px" }}>

        {/* Hero */}
        <section aria-labelledby="blog-heading" style={{ marginBottom: 52 }}>
          <p style={{ ...INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase" as const, margin: "0 0 14px" }}>
            THE HABIT INK JOURNAL
          </p>
          <h1 id="blog-heading" style={{ ...CAVEAT, fontSize: 54, fontWeight: 700, color: NAVY, margin: "0 0 14px", lineHeight: 1.1 }}>
            Ideas for building<br />better habits.
          </h1>
          <p style={{ ...INTER, fontSize: 16, color: MUTED, lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
            Habit science, journaling guides, morning routines, and honest advice — all free, no signup required.
          </p>
        </section>

        {/* Category filter */}
        <nav aria-label="Filter by category" style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 40 }}>
          {["All", ...ALL_CATEGORIES].map(cat => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...INTER, fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? NAVY : MUTED,
                  backgroundColor: active ? `${NAVY}10` : "transparent",
                  border: `1px solid ${active ? `${NAVY}30` : BORDER}`,
                  borderRadius: 100, padding: "6px 16px",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Featured post */}
        {featured && (
          <section aria-label="Featured article" style={{ marginBottom: 32 }}>
            <FeaturedCard post={featured} />
          </section>
        )}

        {/* Post grid */}
        {rest.length > 0 && (
          <section aria-label="All articles">
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}>
              {rest.map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center" as const, padding: "60px 0", color: MUTED }}>
            <p style={{ ...CAVEAT, fontSize: 28, color: NAVY, marginBottom: 8 }}>No posts yet in this category.</p>
            <p style={{ ...INTER, fontSize: 15 }}>More coming soon.</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 72,
          backgroundColor: NAVY,
          borderRadius: 20,
          padding: "40px 36px",
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
          <p style={{ ...INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase" as const, margin: "0 0 10px", position: "relative" as const }}>
            FREE FOREVER
          </p>
          <h2 style={{ ...CAVEAT, fontSize: 40, fontWeight: 700, color: BG, margin: "0 0 12px", position: "relative" as const }}>
            Put these ideas into practice.
          </h2>
          <p style={{ ...INTER, fontSize: 15, color: "rgba(250,248,243,0.6)", margin: "0 0 28px", lineHeight: 1.65, position: "relative" as const }}>
            Track habits, journal daily, and see your progress — all in one free app.
          </p>
          <a
            href="/"
            style={{
              ...INTER, fontSize: 15, fontWeight: 600, color: NAVY,
              backgroundColor: GOLD, borderRadius: 10, padding: "12px 32px",
              textDecoration: "none", display: "inline-block", position: "relative" as const,
            }}
          >
            Start with Habit Ink →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "20px 24px", textAlign: "center" as const, backgroundColor: BG }}>
        <nav aria-label="Footer links" style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 8, flexWrap: "wrap" as const }}>
          {[
            { href: "/",        label: "Home" },
            { href: "/blog",    label: "Blog" },
            { href: "/privacy", label: "Privacy" },
            { href: "/sitemap", label: "Sitemap" },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ ...INTER, fontSize: 12, color: MUTED, textDecoration: "none" }}>
              {link.label}
            </a>
          ))}
        </nav>
        <p style={{ ...INTER, fontSize: 12, color: "#2d2a25", margin: 0 }}>© 2026 Habit Ink · Made by Kunaal</p>
      </footer>
    </div>
  );
}
