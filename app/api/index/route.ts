import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/index" });
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    return NextResponse.json({
      ok: true,
      gotUrl: body?.url ?? null,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasStoreName: Boolean(process.env.FILE_SEARCH_STORE_NAME),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Crash en /api/index",
        message: e?.message ?? String(e),
        name: e?.name,
      },
      { status: 500 }
    );
  }
}
