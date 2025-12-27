import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  const storeName = process.env.FILE_SEARCH_STORE_NAME;

  if (!apiKey || !storeName) {
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const lessonNumber = Math.min(365, Math.max(1, dayOfYear()));

  const prompt = `
Buscá la Lección ${lessonNumber} en el PDF.
1) Resumila brevemente.
2) Explicala para la vida diaria.
3) Proponé una práctica simple para hoy.
Reglas: español, sin copiar texto largo.
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ fileSearch: { fileSearchStoreNames: [storeName] } }],
    },
  });

  return NextResponse.json({
    lessonNumber,
    lesson: response.text,
  });
}
