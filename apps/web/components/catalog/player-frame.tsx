export function PlayerFrame({
  src,
  title
}: {
  src: string;
  title: string;
}) {
  return (
    <section
      style={{
        display: "grid",
        gap: 18,
        borderRadius: 28,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)"
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 9",
          background: "#000"
        }}
      >
        <video
          src={src}
          controls
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            display: "block"
          }}
        >
          {title}
        </video>
      </div>
    </section>
  );
}

