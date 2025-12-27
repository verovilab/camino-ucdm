import { NextRequest, NextResponse } from "next/server";
import Busboy from "busboy";
import fs from "fs";
import os from "os";
import path from "path";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/upload" });
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

  const ai = new GoogleGenAI({ apiKey });
  const tmpDir = os.tmpdir();

  let uploadedPath: string | null = null;
  let originalName = "documento.pdf";

  const bb = Busboy({ headers: Object.fromEntries(req.headers) });

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const done = (err?: any) => {
      if (settled) return;
      settled = true;
      err ? reject(err) : resolve();
    };

    bb.on("file", (_name: string, file: any, info: any) => {
      originalName = info?.filename || originalName;
      uploadedPath = path.join(tmpDir, `${Date.now()}_${originalName}`);

      const stream = fs.createWriteStream(uploadedPath);
      file.pipe(stream);

      // finish = terminó de escribir
      stream.on("finish", () => done());
      stream.on("error", (err: any) => done(err));
      file.on("error", (err: any) => done(err));
    });

    bb.on("error", (err: any) => done(err));

    req.body?.pipeTo(
      new WritableStream({
        write(chunk: any) {
          bb.write(chunk);
        },
        close() {
          bb.end();
        },
        abort(reason: any) {
          done(reason);
        },
      })
    ).catch((err: any) => done(err));
  });

  if (!uploadedPath) {
    return NextResponse.json({ error: "No llegó el PDF" }, { status: 400 });
  }

  // --- StoreName prolijo (sin !) ---
  let storeName: string | undefined = process.env.FILE_SEARCH_STORE_NAME;

  if (!storeName) {
    const store = await ai.fileSearchStores.create({
      config: { displayName: "camino-ucdm-store" },
    });
    storeName = store.name ?? undefined;
  }

  if (!storeName) {
    try { fs.unlinkSync(uploadedPath); } catch {}
    return NextResponse.json(
      { error: "No pude crear/obtener FILE_SEARCH_STORE_NAME" },
      { status: 500 }
    );
  }

  // Ahora TS sabe que storeName es string
  let op = await ai.fileSearchStores.uploadToFileSearchStore({
    file: uploadedPath,
    fileSearchStoreName: storeName,
    config: { displayName: originalName },
  });

  while (!op.done) {
    await new Promise((r) => setTimeout(r, 3000));
    op = await ai.operations.get({ operation: op });
  }

  try { fs.unlinkSync(uploadedPath); } catch {}

  return NextResponse.json({
    ok: true,
    fileSearchStoreName: storeName,
    message: "PDF indexado correctamente",
  });
}
