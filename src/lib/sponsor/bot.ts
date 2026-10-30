const BOT_UA =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterest|slackbot|discordbot|telegrambot|whatsapp|redditbot|applebot|chrome-lighthouse|google-inspectiontool|w3c_validator/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return BOT_UA.test(userAgent);
}