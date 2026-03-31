import type { ReactNode } from "react";

export const metadata = {
  title: "Media Platform",
  description: "Local-first streaming platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#0b1020",
          color: "#f5f7fb"
        }}
      >
        {children}
      </body>
    </html>
  );
}

