import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isBot } from "@/lib/sponsor/bot";
import { canShowGate, parseGateCookie } from "@/lib/sponsor/cookie";
import { pickSponsor } from "@/lib/sponsor/pick";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const placement = url.searchParams.get("placement") ?? "pre_article";

  const ua = (await headers()).get("user-agent");
  if (isBot(ua)) return NextResponse.json({ sponsor: null });

  const cookieStore = await cookies();
  const skipRaw = cookieStore.get("sg_skip")?.value;
  const skipUntil = skipRaw ? Number(skipRaw) : null;

  if (!canShowGate(parseGateCookie(cookieStore.get("sg")?.value), skipUntil)) {
    return NextResponse.json({ sponsor: null });
  }

  try {
    const sponsor = await pickSponsor(placement);
    return NextResponse.json({ sponsor });
  } catch (err) {
    console.error("[api/sponsor] error:", err);
    return NextResponse.json({ sponsor: null });
  }
}