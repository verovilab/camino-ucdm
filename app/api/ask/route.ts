import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question) {
    return NextResponse.json({ error: "Falta la pregunta" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const storeName = process.env.FILE_SEARCH_STORE_NAME;

  if (!apiKey || !storeName) {
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
Respondé SIEMPRE en español (es-AR).
Usá SOLO el contenido del libro "Un Curso de Milagros" cargado.
No copies textos largos literalmente.
Si algo no está en el documento, decilo claramente.
`.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "user", parts: [{ text: question }] },
    ],
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [storeName],
          },
        },
      ],
    },
  });

  return NextResponse.json({ answer: response.text });
}
