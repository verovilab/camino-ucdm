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

// Helper: descarga una URL a /tmp y devuelve path local
async function downloadToTmp(url: string, filenameHint = "documento.pdf") {
const tmpDir = os.tmpdir();
const safeName = filenameHint.replace(/[^\w.\-]+/g, "_");
const filePath = path.join(tmpDir, `${Date.now()}_${safeName}`);

const res = await fetch(url);
if (!res.ok) throw new Error(`No pude descargar el PDF. HTTP ${res.status}`);

const arrayBuffer = await res.arrayBuffer();
fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
return filePath;
}

export async function POST(req: NextRequest) {
// Auth
const auth = req.headers.get("authorization") || "";
if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

// API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
return NextResponse.json({ error: "Falta GEMINI_API_KEY" }, { status: 500 });
}
const ai = new GoogleGenAI({ apiKey });

// Store name (aseguramos string)
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

const contentType = req.headers.get("content-type") || "";

let uploadedPath: string | null = null;
let originalName = "documento.pdf";

// ✅ MODO URL (JSON)
if (contentType.includes("application/json")) {
const body = await req.json().catch(() => null);
const url = body?.url as string | undefined;
if (!url) {
return NextResponse.json({ error: "Falta 'url' en JSON" }, { status: 400 });
}

// nombre para mostrar
originalName = body?.name ? String(body.name) : "ucdm.pdf";

try {
uploadedPath = await downloadToTmp(url, originalName);
} catch (e: any) {
return NextResponse.json({ error: e?.message || "Error descargando PDF" }, { status: 500 });
}
}
// ✅ MODO ARCHIVO (multipart) — para PDFs chicos
else if (contentType.includes("multipart/form-data")) {
const tmpDir = os.tmpdir();
const bb = Busboy({ headers: Object.fromEntries(req.headers) });

await new Promise<void>((resolve, reject) => {
bb.on("file", (_name: string, file: any, info: any) => {
originalName = info.filename || originalName;
uploadedPath = path.join(tmpDir, `${Date.now()}_${originalName}`);
const stream = fs.createWriteStream(uploadedPath);
file.pipe(stream);
stream.on("close", resolve);
stream.on("error", reject);
});

bb.on("error", (err: any) => reject(err));

req.body?.pipeTo(
new WritableStream({
write(chunk) { bb.write(chunk); },
close() { bb.end(); },
})
);
});
} else {
return NextResponse.json(
{ error: "Content-Type inválido. Usá JSON con {url} o multipart con file" },
{ status: 415 }
);
}

if (!uploadedPath) {
return NextResponse.json({ error: "No llegó el PDF" }, { status: 400 });
}

// Subir e indexar en File Search Store
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
