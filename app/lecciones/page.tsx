"use client";

import { useMemo, useState } from "react";

type LessonResponse = {
  number: number;
  quote: string;
  explanation: string;
  actionTip?: string;
  source?: string;
};

export default function LessonsPage() {
  const [num, setNum] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<LessonResponse | null>(null);

  const n = useMemo(() => {
    const v = parseInt(num, 10);
    return Number.isFinite(v) ? v : NaN;
  }, [num]);

  async function fetchLesson() {
    setErr(null);
    setData(null);

    if (!Number.isFinite(n) || n < 1 || n > 365) {
      setErr("Ingresá un número válido entre 1 y 365.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: n }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || `Error ${res.status}`);
      }

      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Lecciones</h1>
          <p className="mt-2 text-sm opacity-80">
            Elegí un número (1–365) y probamos cómo responde la IA.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm opacity-80">Número de lección</label>
              <input
                value={num}
                onChange={(e) => setNum(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-white/25"
                placeholder="Ej: 68"
              />
            </div>

            <button
              onClick={fetchLesson}
              disabled={loading}
              className="rounded-xl bg-white text-black px-4 py-3 font-medium disabled:opacity-60"
            >
              {loading ? "Generando…" : "Ver respuesta"}
            </button>
          </div>

          {err && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
              {err}
            </div>
          )}
        </section>

        {data && (
          <section className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-wide opacity-70">
                Lección {data.number}
              </div>
              <blockquote className="mt-3 text-lg leading-relaxed">
                “{data.quote}”
              </blockquote>
              {data.source && (
                <div className="mt-3 text-xs opacity-70">{data.source}</div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-sm font-semibold opacity-90">Explicación</h2>
              <p className="mt-2 leading-relaxed opacity-90">
                {data.explanation}
              </p>

              {data.actionTip && (
                <>
                  <h3 className="mt-5 text-sm font-semibold opacity-90">
                    Tip de acción (suave, no impositivo)
                  </h3>
                  <p className="mt-2 leading-relaxed opacity-90">
                    {data.actionTip}
                  </p>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
