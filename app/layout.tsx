import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

export const metadata: Metadata = {
  title: "Alumbrar — UCDM",
  description: "Un espacio de lectura, reflexión y práctica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <nav className="nav">
            <div className="navlinks">
              <a className="pill" href="/">Inicio</a>
              <a className="pill" href="/gema">Gema</a>
              <a className="pill" href="/lecciones">Lecciones</a>
              <a className="pill" href="/chat">Chat</a>
              <a className="pill" href="/manual">Manual</a>
            </div>

            <ThemeToggle />
          </nav>
        </header>

        <main className="container">{children}</main>
      </body>
    </html>
  );
}
