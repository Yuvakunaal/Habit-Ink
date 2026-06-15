import React from "react";

const NAVY   = "#2B3A8C";
const GOLD   = "#C9A84C";
const TEXT   = "#2C2C2C";
const BORDER = "#E8E2D9";

const CAVEAT: React.CSSProperties = { fontFamily: '"Caveat", cursive' };
const INTER:  React.CSSProperties = { fontFamily: '"Inter", system-ui, sans-serif' };

function parseInline(text: string, keyBase: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let n = 0;

  while (remaining.length > 0) {
    const boldIdx   = remaining.indexOf("**");
    const italicIdx = remaining.search(/(?<![*])_(?![*])/);
    const linkIdx   = remaining.indexOf("[");

    let earliest = Infinity;
    if (boldIdx   !== -1) earliest = Math.min(earliest, boldIdx);
    if (italicIdx !== -1) earliest = Math.min(earliest, italicIdx);
    if (linkIdx   !== -1) earliest = Math.min(earliest, linkIdx);

    if (earliest === Infinity) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) {
      parts.push(remaining.slice(0, earliest));
    }

    // Bold **...**
    if (earliest === boldIdx) {
      const end = remaining.indexOf("**", boldIdx + 2);
      if (end !== -1) {
        const inner = remaining.slice(boldIdx + 2, end);
        parts.push(<strong key={`${keyBase}-b${n++}`} style={{ color: NAVY, fontWeight: 700 }}>{inner}</strong>);
        remaining = remaining.slice(end + 2);
        continue;
      }
    }

    // Italic _..._
    if (earliest === italicIdx) {
      const end = remaining.indexOf("_", italicIdx + 1);
      if (end !== -1) {
        const inner = remaining.slice(italicIdx + 1, end);
        parts.push(<em key={`${keyBase}-i${n++}`}>{inner}</em>);
        remaining = remaining.slice(end + 1);
        continue;
      }
    }

    // Link [...](...)
    if (earliest === linkIdx) {
      const closeBracket = remaining.indexOf("]", linkIdx + 1);
      if (closeBracket !== -1 && remaining[closeBracket + 1] === "(") {
        const closeParen = remaining.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const label = remaining.slice(linkIdx + 1, closeBracket);
          const href  = remaining.slice(closeBracket + 2, closeParen);
          const isExternal = href.startsWith("http");
          parts.push(
            <a
              key={`${keyBase}-l${n++}`}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              style={{ color: NAVY, fontWeight: 600, textDecoration: "underline", textDecorationColor: GOLD, textUnderlineOffset: 3 }}
            >
              {label}
            </a>
          );
          remaining = remaining.slice(closeParen + 1);
          continue;
        }
      }
    }

    // No valid match — consume one char and continue
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

interface Props {
  content: string;
}

export function MarkdownRenderer({ content }: Props) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div style={{ ...INTER, color: TEXT }}>
      {blocks.map((block, bi) => {
        const lines = block.trim().split("\n");

        // H3
        if (block.startsWith("### ")) {
          return (
            <h3 key={bi} style={{ ...CAVEAT, fontSize: 24, fontWeight: 700, color: NAVY, margin: "28px 0 8px", lineHeight: 1.2 }}>
              {parseInline(block.slice(4), `${bi}`)}
            </h3>
          );
        }

        // H2
        if (block.startsWith("## ")) {
          return (
            <h2 key={bi} style={{ ...CAVEAT, fontSize: 34, fontWeight: 700, color: NAVY, margin: "44px 0 12px", lineHeight: 1.15 }}>
              {parseInline(block.slice(3), `${bi}`)}
            </h2>
          );
        }

        // H1
        if (block.startsWith("# ")) {
          return (
            <h1 key={bi} style={{ ...CAVEAT, fontSize: 48, fontWeight: 700, color: NAVY, margin: "0 0 20px", lineHeight: 1.1 }}>
              {parseInline(block.slice(2), `${bi}`)}
            </h1>
          );
        }

        // Blockquote (possibly multi-line)
        if (lines.every(l => l.startsWith("> "))) {
          const inner = lines.map(l => l.slice(2)).join(" ");
          return (
            <blockquote key={bi} style={{
              borderLeft: `4px solid ${GOLD}`,
              marginLeft: 0,
              marginRight: 0,
              paddingLeft: 20,
              marginTop: 28,
              marginBottom: 28,
            }}>
              <p style={{ ...CAVEAT, fontSize: 22, fontStyle: "italic", color: NAVY, lineHeight: 1.55, margin: 0 }}>
                {parseInline(inner, `${bi}`)}
              </p>
            </blockquote>
          );
        }

        // Horizontal rule
        if (block.trim() === "---") {
          return <hr key={bi} style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "40px 0" }} />;
        }

        // Unordered list
        if (lines.every(l => l.startsWith("- "))) {
          return (
            <ul key={bi} style={{ paddingLeft: 22, margin: "14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((line, li) => (
                <li key={li} style={{ fontSize: 17, color: TEXT, lineHeight: 1.75, paddingLeft: 4 }}>
                  {parseInline(line.slice(2), `${bi}-${li}`)}
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (lines.every(l => /^\d+\.\s/.test(l))) {
          return (
            <ol key={bi} style={{ paddingLeft: 22, margin: "14px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((line, li) => (
                <li key={li} style={{ fontSize: 17, color: TEXT, lineHeight: 1.75, paddingLeft: 4 }}>
                  {parseInline(line.replace(/^\d+\.\s/, ""), `${bi}-${li}`)}
                </li>
              ))}
            </ol>
          );
        }

        // Regular paragraph (join multi-line runs)
        return (
          <p key={bi} style={{ fontSize: 17, color: TEXT, lineHeight: 1.85, margin: "0 0 6px" }}>
            {parseInline(lines.join(" "), `${bi}`)}
          </p>
        );
      })}
    </div>
  );
}
