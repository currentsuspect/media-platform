import Link from "next/link";

export function MediaCard({
  href,
  title,
  subtitle,
  description,
  posterUrl
}: {
  href?: string;
  title: string;
  subtitle: string;
  description: string | null;
  posterUrl: string | null;
}) {
  const content = (
    <article
      style={{
        display: "grid",
        gap: 14,
        borderRadius: 22,
        overflow: "hidden",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        minHeight: "100%"
      }}
    >
      <div
        style={{
          aspectRatio: "4 / 5",
          background: posterUrl
            ? `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url(${posterUrl}) center / cover`
            : "linear-gradient(135deg, #1e3a8a, #0f172a)",
          display: "flex",
          alignItems: "flex-end",
          padding: 18
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "7px 10px",
            borderRadius: 999,
            background: "rgba(15,23,42,0.72)",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#e2e8f0"
          }}
        >
          {subtitle}
        </span>
      </div>

      <div style={{ padding: "0 18px 18px", display: "grid", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            lineHeight: 1.6,
            fontSize: 14
          }}
        >
          {description || "Metadata is still local-first. Provider overview will appear after enrichment."}
        </p>
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      style={{
        color: "inherit",
        textDecoration: "none"
      }}
    >
      {content}
    </Link>
  );
}

