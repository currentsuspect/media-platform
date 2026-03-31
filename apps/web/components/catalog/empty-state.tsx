export function EmptyState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      style={{
        border: "1px dashed rgba(255,255,255,0.16)",
        borderRadius: 24,
        padding: "28px 24px",
        color: "#cbd5e1",
        background: "rgba(255,255,255,0.03)"
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ marginBottom: 0, lineHeight: 1.7 }}>{description}</p>
    </section>
  );
}

