import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumbrar — UCDM",
  description: "Un espacio de lectura, reflexión y práctica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <header
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            padding: "14px 18px",
          }}
        >
          <nav
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              maxWidth: 980,
              margin: "0 auto",
            }}
          >
            <a href="/" style={{ textDecoration: "none" }}>Inicio</a>
            <a href="/gema" style={{ textDecoration: "none" }}>Gema</a>
            <a href="/lecciones" style={{ textDecoration: "none" }}>Lecciones</a>
            <a href="/chat" style={{ textDecoration: "none" }}>Chat</a>
            <a href="/manual" style={{ textDecoration: "none" }}>Manual</a>
          </nav>
        </header>

        <div style={{ maxWidth: 980, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
