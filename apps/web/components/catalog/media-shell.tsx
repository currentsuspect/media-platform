import type { ReactNode } from "react";
import Link from "next/link";

export function MediaShell({
  children,
  title,
  eyebrow,
  description
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px 80px",
        background:
          "radial-gradient(circle at top left, rgba(245,158,11,0.2), transparent 28%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 32%), linear-gradient(180deg, #09111f 0%, #050914 100%)"
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "grid",
          gap: 28
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <Link
            href="/"
            style={{
              color: "#f8fafc",
              textDecoration: "none",
              fontSize: 15,
              letterSpacing: "0.08em",
              textTransform: "uppercase"
            }}
          >
            Media Platform
          </Link>
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 14
            }}
          >
            <Link href="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>
              Browse
            </Link>
          </div>
        </nav>

        <header style={{ display: "grid", gap: 12 }}>
          <span
            style={{
              width: "fit-content",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              color: "#f8fafc",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase"
            }}
          >
            {eyebrow}
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
            {title}
          </h1>
          <p style={{ maxWidth: 760, lineHeight: 1.7, color: "#cbd5e1", margin: 0 }}>
            {description}
          </p>
        </header>

        {children}
      </div>
    </main>
  );
}

