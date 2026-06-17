import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostBySlug, getRelatedPosts, type BlogPost } from "@/blog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const BG     = "#FAF8F3";
const NAVY   = "#2B3A8C";
const GOLD   = "#C9A84C";
const TEXT   = "#2C2C2C";
const MUTED  = "#888888";
const BORDER = "#E8E2D9";

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

function RelatedCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);
  const color = CATEGORY_COLORS[post.category] ?? NAVY;
  return (
    <a
      href={`/blog/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article style={{
        backgroundColor: "#fff",
        border: `1px solid ${hovered ? `${NAVY}28` : BORDER}`,
        borderRadius: 14,
        padding: "20px 20px 18px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 6px 24px rgba(43,58,140,0.07)" : "none",
      }}>
        <span style={{
          ...INTER, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase" as const, color,
          backgroundColor: `${color}14`, borderRadius: 100, padding: "2px 10px",
          alignSelf: "flex-start" as const,
        }}>
          {post.category}
        </span>
        <h4 style={{ ...CAVEAT, fontSize: 21, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.2 }}>
          {post.title}
        </h4>
        <span style={{ ...INTER, fontSize: 12, color: MUTED, marginTop: "auto" }}>
          {post.readingTime} min read
        </span>
      </article>
    </a>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <p style={{ ...CAVEAT, fontSize: 44, color: NAVY, marginBottom: 8 }}>Post not found.</p>
      <a href="/blog" style={{ ...INTER, fontSize: 15, color: NAVY, fontWeight: 600 }}>← Back to blog</a>
    </div>
  );
}

export default function BlogPostScreen() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    if (!post) return;

    document.title = `${post.title} — Habit Ink`;
    window.scrollTo(0, 0);

    // Meta description
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute("content") ?? null;
    metaDesc?.setAttribute("content", post.description);

    // Canonical
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = canonical?.getAttribute("href") ?? null;
    canonical?.setAttribute("href", `https://habitink.app/blog/${post.slug}`);

    // OG tags
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const prevOgTitle = ogTitle?.getAttribute("content") ?? null;
    ogTitle?.setAttribute("content", `${post.title} — Habit Ink`);

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const prevOgDesc = ogDesc?.getAttribute("content") ?? null;
    ogDesc?.setAttribute("content", post.description);

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    const prevOgUrl = ogUrl?.getAttribute("content") ?? null;
    ogUrl?.setAttribute("content", `https://habitink.app/blog/${post.slug}`);

    // Twitter Card tags
    const twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    const prevTwTitle = twTitle?.getAttribute("content") ?? null;
    twTitle?.setAttribute("content", `${post.title} — Habit Ink`);

    const twDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    const prevTwDesc = twDesc?.getAttribute("content") ?? null;
    twDesc?.setAttribute("content", post.description);

    // BlogPosting JSON-LD schema
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "blog-post-schema";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.date,
      "dateModified": post.date,
      "author": {
        "@type": "Organization",
        "name": "Habit Ink",
        "url": "https://habitink.app",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Habit Ink",
        "logo": { "@type": "ImageObject", "url": "https://habitink.app/logo.png" },
      },
      "url": `https://habitink.app/blog/${post.slug}`,
      "mainEntityOfPage": `https://habitink.app/blog/${post.slug}`,
      "keywords": post.keywords?.join(", "),
      "articleSection": post.category,
      "inLanguage": "en-US",
    });
    document.head.appendChild(schema);

    // BreadcrumbList
    const crumb = document.createElement("script");
    crumb.type = "application/ld+json";
    crumb.id = "blog-post-breadcrumb";
    crumb.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://habitink.app/" },
        { "@type": "ListItem", "position": 2, "name": "Blog",  "item": "https://habitink.app/blog" },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://habitink.app/blog/${post.slug}` },
      ],
    });
    document.head.appendChild(crumb);

    // Overflow unlock
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
      if (metaDesc && prevDesc)     metaDesc.setAttribute("content", prevDesc);
      if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
      if (ogTitle && prevOgTitle)   ogTitle.setAttribute("content", prevOgTitle);
      if (ogDesc && prevOgDesc)     ogDesc.setAttribute("content", prevOgDesc);
      if (ogUrl && prevOgUrl)       ogUrl.setAttribute("content", prevOgUrl);
      if (twTitle && prevTwTitle)   twTitle.setAttribute("content", prevTwTitle);
      if (twDesc && prevTwDesc)     twDesc.setAttribute("content", prevTwDesc);
      document.getElementById("blog-post-schema")?.remove();
      document.getElementById("blog-post-breadcrumb")?.remove();
      html.style.overflow = prev.htmlO; html.style.height = prev.htmlH;
      body.style.overflow = prev.bodyO; body.style.height = prev.bodyH;
      if (root) { root.style.overflow = prev.rootO; root.style.height = prev.rootH; }
    };
  }, [post]);

  if (!post) return <NotFound />;

  const related = getRelatedPosts(post, 3);
  const catColor = CATEGORY_COLORS[post.category] ?? NAVY;

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
          <a href="/" aria-label="Habit Ink home" style={{ textDecoration: "none" }}>
            <span style={{ ...CAVEAT, fontSize: 22, fontWeight: 700, color: NAVY }}>🖊 Habit Ink</span>
          </a>
          <span style={{ color: BORDER, fontSize: 16, userSelect: "none" }}>|</span>
          <a href="/blog" style={{ ...INTER, fontSize: 14, fontWeight: 500, color: MUTED, textDecoration: "none" }}>Blog</a>
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

      <main style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 100px" }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 32 }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" as const }}>
            <li><a href="/" style={{ ...INTER, fontSize: 13, color: MUTED, textDecoration: "none" }}>Home</a></li>
            <li aria-hidden="true" style={{ ...INTER, fontSize: 13, color: BORDER }}>›</li>
            <li><a href="/blog" style={{ ...INTER, fontSize: 13, color: MUTED, textDecoration: "none" }}>Blog</a></li>
            <li aria-hidden="true" style={{ ...INTER, fontSize: 13, color: BORDER }}>›</li>
            <li aria-current="page" style={{ ...INTER, fontSize: 13, color: TEXT }}>{post.title}</li>
          </ol>
        </nav>

        {/* Article header */}
        <header style={{ marginBottom: 36 }}>
          <span style={{
            ...INTER, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase" as const, color: catColor,
            backgroundColor: `${catColor}14`, borderRadius: 100,
            padding: "3px 14px", display: "inline-block", marginBottom: 18,
          }}>
            {post.category}
          </span>

          <h1 style={{ ...CAVEAT, fontSize: 52, fontWeight: 700, color: NAVY, margin: "0 0 18px", lineHeight: 1.1 }}>
            {post.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 14 }}>🖊</span>
              </div>
              <span style={{ ...INTER, fontSize: 13, color: TEXT, fontWeight: 500 }}>{post.author}</span>
            </div>
            <span style={{ color: BORDER, fontSize: 14 }}>·</span>
            <span style={{ ...INTER, fontSize: 13, color: MUTED }}>{formatDate(post.date)}</span>
            <span style={{ color: BORDER, fontSize: 14 }}>·</span>
            <span style={{ ...INTER, fontSize: 13, color: MUTED }}>{post.readingTime} min read</span>
          </div>
        </header>

        <div style={{ height: 1, backgroundColor: BORDER, marginBottom: 36 }} role="separator" />

        {/* Article body */}
        <article>
          <MarkdownRenderer content={post.content} />
        </article>

        {/* Mid-article CTA */}
        <div style={{
          marginTop: 52,
          marginBottom: 52,
          backgroundColor: `${NAVY}06`,
          border: `1px solid ${NAVY}18`,
          borderLeft: `4px solid ${GOLD}`,
          borderRadius: 12,
          padding: "24px 24px 20px",
          display: "flex",
          flexDirection: "column" as const,
          gap: 10,
        }}>
          <p style={{ ...INTER, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: GOLD, textTransform: "uppercase" as const, margin: 0 }}>
            FREE HABIT TRACKER
          </p>
          <p style={{ ...CAVEAT, fontSize: 24, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.2 }}>
            Put this into practice with Habit Ink.
          </p>
          <p style={{ ...INTER, fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            Track habits, journal daily, and see your streaks — completely free. No download, no credit card.
          </p>
          <a
            href="/"
            style={{
              ...INTER, fontSize: 14, fontWeight: 600, color: NAVY,
              backgroundColor: GOLD, borderRadius: 8, padding: "10px 20px",
              textDecoration: "none", alignSelf: "flex-start" as const, marginTop: 4,
            }}
          >
            Start tracking free →
          </a>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ marginBottom: 52, display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>
            <span style={{ ...INTER, fontSize: 12, color: MUTED, marginRight: 4 }}>Tags:</span>
            {post.tags.map(tag => (
              <span key={tag} style={{
                ...INTER, fontSize: 12, color: TEXT,
                backgroundColor: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 100, padding: "3px 12px",
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: BORDER, marginBottom: 48 }} role="separator" />

        {/* Related posts */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" style={{ ...CAVEAT, fontSize: 30, fontWeight: 700, color: NAVY, margin: "0 0 20px" }}>
              Continue reading
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}>
              {related.map(p => <RelatedCard key={p.slug} post={p} />)}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div style={{ marginTop: 48, textAlign: "center" as const }}>
          <a
            href="/blog"
            style={{
              ...INTER, fontSize: 14, fontWeight: 500, color: MUTED,
              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            ← All articles
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
