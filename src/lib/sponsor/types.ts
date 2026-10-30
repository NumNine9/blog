export type SponsorDecision = {
  campaignId: string;
  creativeId: string;
  sponsorName: string;
  headline: string;
  body: string | null;
  imageUrl: string | null;
  ctaText: string;
  destinationUrl: string;
};