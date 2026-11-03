import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/sponsor/supabase";

type SponsorStatus = "active" | "paused" | "archived";
type CreativeStatus = "pending" | "approved" | "rejected";

type Payload =
  | { action: "create-sponsor"; payload: { name: string; contact_email?: string | null } }
  | { action: "update-sponsor"; payload: { id: string; name?: string; contact_email?: string | null; status?: SponsorStatus } }
  | { action: "delete-sponsor"; payload: { id: string } }
  | { action: "create-campaign"; payload: { sponsor_id: string; name: string; placement?: string; starts_at?: string | null; ends_at?: string | null; weight?: number } }
  | { action: "update-campaign"; payload: { id: string; name?: string; status?: SponsorStatus; starts_at?: string | null; ends_at?: string | null; weight?: number } }
  | { action: "delete-campaign"; payload: { id: string } }
  | { action: "create-creative"; payload: { campaign_id: string; headline: string; body?: string | null; image_url?: string | null; cta_text?: string | null; destination_url: string } }
  | { action: "update-creative"; payload: { id: string; headline?: string; body?: string | null; image_url?: string | null; cta_text?: string | null; destination_url?: string; status?: CreativeStatus } }
  | { action: "delete-creative"; payload: { id: string } };

export async function GET(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [sponsors, campaigns, creatives] = await Promise.all([
    supabaseAdmin.from("sponsors").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("campaigns").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("creatives").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    sponsors: sponsors.data ?? [],
    campaigns: campaigns.data ?? [],
    creatives: creatives.data ?? [],
  });
}

export async function POST(req: Request) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sb = supabaseAdmin;
  let result: { error: { message: string } | null; data: unknown } = { error: null, data: null };

  switch (body.action) {
    case "create-sponsor":
      result = await sb.from("sponsors").insert(body.payload).select().single();
      break;

    case "update-sponsor": {
      const { id, ...rest } = body.payload;
      result = await sb.from("sponsors").update(rest).eq("id", id).select().single();
      break;
    }

    case "delete-sponsor":
      result = await sb.from("sponsors").delete().eq("id", body.payload.id);
      break;

    case "create-campaign":
      result = await sb.from("campaigns").insert(body.payload).select().single();
      break;

    case "update-campaign": {
      const { id, ...rest } = body.payload;
      result = await sb.from("campaigns").update(rest).eq("id", id).select().single();
      break;
    }

    case "delete-campaign":
      result = await sb.from("campaigns").delete().eq("id", body.payload.id);
      break;

    case "create-creative":
      result = await sb.from("creatives").insert(body.payload).select().single();
      break;

    case "update-creative": {
      const { id, ...rest } = body.payload;
      result = await sb.from("creatives").update(rest).eq("id", id).select().single();
      break;
    }

    case "delete-creative":
      result = await sb.from("creatives").delete().eq("id", body.payload.id);
      break;

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json({ data: result.data ?? null });
}