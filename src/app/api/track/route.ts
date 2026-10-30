import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/sponsor/supabase";
import { MAX_PER_DAY, SKIP_MS, parseGateCookie } from "@/lib/sponsor/cookie";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.event) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ua = (await headers()).get("user-agent") ?? "";

  await supabaseAdmin.from("sponsor_events").insert({
    event: body.event,
    campaign_id: body.campaignId ?? null,
    creative_id: body.creativeId ?? null,
    placement: body.placement ?? null,
    article_id: body.articleId ?? null,
    user_agent: ua,
  });

  const res = NextResponse.json({ ok: true });
  const cookieStore = await cookies();
  const today = new Date().toISOString().slice(0, 10);

  if (body.event === "impression") {
    const existing = parseGateCookie(cookieStore.get("sg")?.value);
    const count = existing?.day === today ? existing.count + 1 : 1;
    const gate = { count, day: today, lastShown: Date.now() };

    res.cookies.set("sg", JSON.stringify(gate), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    if (count > MAX_PER_DAY) {
      return NextResponse.json({ ok: true, suppress: true });
    }
  }

  if (body.event === "dismiss") {
    res.cookies.set("sg_skip", String(Date.now() + SKIP_MS), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return res;
}