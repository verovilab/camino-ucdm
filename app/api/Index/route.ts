import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta GEMINI_API_KEY" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Body: { url: "...", displayName?: "..." }
  const body = await req.json().catch(() => null);
  const url: string | undefined = body?.url;
  const displayName: string = body?.displayName || "Documento";

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Falta url" }, { status: 400 });
  }

  // Store name (create if missing)
  let storeName: string | undefined = process.env.FILE_SEARCH_STORE_NAME;

  if (!storeName) {
    const store = await ai.fileSearchStores.create({
      config: { displayName: "camino-ucdm-store" },
    });
    storeName = store.name ?? undefined;
  }

  if (!storeName) {
    return NextResponse.json(
      { error: "No pude crear/obtener FILE_SEARCH_STORE_NAME" },
      { status: 500 }
    );
  }

  // Upload by URL (no payload limits)
  let op = await ai.fileSearchStores.uploadToFileSearchStore({
    file: url,
    fileSearchStoreName: storeName,
    config: { displayName },
  });

  while (!op.done) {
    await new Promise((r) => setTimeout(r, 2000));
    op = await ai.operations.get({ operation: op });
  }

  return NextResponse.json({
    ok: true,
    fileSearchStoreName: storeName,
    indexedUrl: url,
    displayName,
  });
}
