import { supabaseAdmin } from "./supabase";
import type { SponsorDecision } from "./types";

// Shape returned by: select("... sponsor:sponsors(name, status)")
// Supabase types to-one relations as object OR array depending on
// generated types, so we accept both and normalize.
type SponsorRel = { name: string; status: string };

type CampaignRow = {
  id: string;
  weight: number | null;
  starts_at: string | null;
  ends_at: string | null;
  sponsor: SponsorRel | SponsorRel[] | null;
};

type CreativeRow = {
  id: string;
  headline: string;
  body: string | null;
  image_url: string | null;
  cta_text: string;
  destination_url: string;
};

function normalizeSponsor(raw: CampaignRow["sponsor"]): SponsorRel | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

export async function pickSponsor(
  placement = "pre_article"
): Promise<SponsorDecision | null> {
  const now = Date.now();

  const { data: campaigns, error } = await supabaseAdmin
    .from("campaigns")
    .select("id, weight, starts_at, ends_at, sponsor:sponsors(name, status)")
    .eq("status", "active")
    .eq("placement", placement);

  if (error || !campaigns?.length) return null;

  const rows = campaigns as unknown as CampaignRow[];

  const eligible = rows.filter((c) => {
    const sponsor = normalizeSponsor(c.sponsor);
    const sponsorActive = sponsor?.status === "active";
    const started = !c.starts_at || new Date(c.starts_at).getTime() <= now;
    const notEnded = !c.ends_at || new Date(c.ends_at).getTime() >= now;
    return sponsorActive && started && notEnded;
  });
  if (eligible.length === 0) return null;

  // Weighted random
  const totalWeight = eligible.reduce((s, c) => s + (c.weight ?? 1), 0);
  let r = Math.random() * totalWeight;
  let chosen = eligible[0];
  for (const c of eligible) {
    r -= c.weight ?? 1;
    if (r <= 0) {
      chosen = c;
      break;
    }
  }

  const chosenSponsor = normalizeSponsor(chosen.sponsor);
  if (!chosenSponsor) return null;

  const { data: creatives } = await supabaseAdmin
    .from("creatives")
    .select("id, headline, body, image_url, cta_text, destination_url")
    .eq("campaign_id", chosen.id)
    .eq("status", "approved")
    .limit(10);

  if (!creatives?.length) return null;
  const creativeRows = creatives as unknown as CreativeRow[];
  const creative =
    creativeRows[Math.floor(Math.random() * creativeRows.length)];

  return {
    campaignId: chosen.id,
    creativeId: creative.id,
    sponsorName: chosenSponsor.name,
    headline: creative.headline,
    body: creative.body,
    imageUrl: creative.image_url,
    ctaText: creative.cta_text,
    destinationUrl: creative.destination_url,
  };
}