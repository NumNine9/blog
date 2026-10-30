import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/sponsor/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ creativeId: string }> }
) {
  const { creativeId } = await params;
  const url = new URL(req.url);
  const articleId = url.searchParams.get("a");

  const fallback = NextResponse.redirect(new URL("/", req.url));

  const { data: creative } = await supabaseAdmin
    .from("creatives")
    .select("destination_url, campaign_id, status")
    .eq("id", creativeId)
    .maybeSingle();

  if (!creative || creative.status !== "approved") return fallback;

  let destination: URL;
  try {
    destination = new URL(creative.destination_url);
  } catch {
    return fallback;
  }
  if (!["http:", "https:"].includes(destination.protocol)) return fallback;

  await supabaseAdmin.from("sponsor_events").insert({
    event: "click",
    creative_id: creativeId,
    campaign_id: creative.campaign_id,
    placement: "pre_article",
    article_id: articleId,
    user_agent: req.headers.get("user-agent") ?? "",
  });

  return NextResponse.redirect(destination.toString(), 302);
}