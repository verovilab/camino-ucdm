import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const number = Number(body?.number);

    if (!Number.isFinite(number) || number < 1 || number > 365) {
      return NextResponse.json(
        { error: "number debe ser un entero entre 1 y 365" },
        { status: 400 }
      );
    }

    // ✅ Placeholder: acá después lo conectamos a tu “base del libro” (PDF/index)
    // Por ahora devolvemos algo controlado para testear la UI.
    return NextResponse.json({
      number,
      quote: `Lección ${number}: (frase de prueba)`,
      explanation:
        "Esta es una explicación de prueba para validar el flujo. Luego la reemplazamos por la respuesta basada en el Libro de Ejercicios.",
      actionTip:
        "Si te sirve, hoy podés pausar 30 segundos y observar un pensamiento sin pelearte con él. Solo mirarlo, y seguir.",
      source: "UCDM — Libro de Ejercicios (modo prueba)",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
