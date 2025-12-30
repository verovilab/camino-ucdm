import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import os from "os";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.url) {
      return NextResponse.json({ error: "Falta url en JSON" }, { status: 400 });
    }

    // 👇 ACÁ va tu lógica real de fetch + indexado
    // Si falla algo, el catch de abajo te lo devuelve en JSON.

    return NextResponse.json({ ok: true, receivedUrl: body.url });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Crash en /api/index",
        message: e?.message ?? String(e),
        name: e?.name,
        stack: e?.stack?.split("\n").slice(0, 8).join("\n"),
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/index" });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Falta GEMINI_API_KEY" }, { status: 500 });
  }

  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) return NextResponse.json({ error: "Falta url" }, { status: 400 });

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "No pude descargar el PDF", status: res.status }, { status: 400 });
  }

  const arrayBuffer = await res.arrayBuffer();
  const tmpDir = os.tmpdir();
  const filenameFromUrl = decodeURIComponent(url.split("/").pop() || "documento.pdf");
  const uploadedPath = path.join(tmpDir, `${Date.now()}_${filenameFromUrl}`);
  fs.writeFileSync(uploadedPath, Buffer.from(arrayBuffer));

  const ai = new GoogleGenAI({ apiKey });

  let storeName: string | undefined = process.env.FILE_SEARCH_STORE_NAME;
  if (!storeName) {
    const store = await ai.fileSearchStores.create({ config: { displayName: "camino-ucdm-store" } });
    storeName = store.name ?? undefined;
  }
  if (!storeName) {
    return NextResponse.json({ error: "No pude crear/obtener FILE_SEARCH_STORE_NAME" }, { status: 500 });
  }

  let op = await ai.fileSearchStores.uploadToFileSearchStore({
    file: uploadedPath,
    fileSearchStoreName: storeName,
    config: { displayName: filenameFromUrl },
  });

  while (!op.done) {
    await new Promise((r) => setTimeout(r, 3000));
    op = await ai.operations.get({ operation: op });
  }

  try { fs.unlinkSync(uploadedPath); } catch {}

  return NextResponse.json({ ok: true, fileSearchStoreName: storeName, message: "PDF indexado correctamente", url });
}
