export default function Home() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h1 style={{ margin: 0 }}>Alumbrar</h1>
        <p style={{ marginTop: 8, color: "var(--muted)" }}>
          Un espacio para una idea diaria, el Libro de Ejercicios, el Manual del Maestro
          y un chat que responde siempre basado en el texto.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <a className="card" href="/gema" style={{ textDecoration: "none" }}>
          <h2 style={{ marginTop: 0 }}>💎 Gema del día</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Una frase/idea al azar para empezar el día o reflexionar.
          </p>
        </a>

        <a className="card" href="/lecciones" style={{ textDecoration: "none" }}>
          <h2 style={{ marginTop: 0 }}>📘 Lecciones</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Elegí un número y recibí una frase + explicación del Libro de Ejercicios.
          </p>
        </a>

        <a className="card" href="/chat" style={{ textDecoration: "none" }}>
          <h2 style={{ marginTop: 0 }}>💬 Chat</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Preguntá lo que quieras (ej. “¿qué es la percepción?”) y responde basado en el libro.
          </p>
        </a>

        <a className="card" href="/manual" style={{ textDecoration: "none" }}>
          <h2 style={{ marginTop: 0 }}>🕊️ Manual del Maestro</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Ideas + guía suave, con tips concretos sin imponer.
          </p>
        </a>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>✨ Un toque místico, aterrizado</h3>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          En modo místico cambiamos la atmósfera. Pero siempre con algo accionable:
          una pregunta guía, una práctica breve, o un gesto concreto para el día.
        </p>
      </div>
    </div>
  );
}
