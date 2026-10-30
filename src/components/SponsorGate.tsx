"use client";

import { useEffect, useRef, useState } from "react";
import type { SponsorDecision } from "@/lib/sponsor/types";

type Props = { sponsor: SponsorDecision; articleId: string };

export function SponsorGate({ sponsor, articleId }: Props) {
  const [visible, setVisible] = useState(true);
  const sentImpression = useRef(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (sentImpression.current) return;
    sentImpression.current = true;
    track({
      event: "impression",
      creativeId: sponsor.creativeId,
      campaignId: sponsor.campaignId,
      placement: "pre_article",
      articleId,
    }).then((r) => {
      if (r?.suppress) setVisible(false);
    });
  }, [sponsor.creativeId, sponsor.campaignId, articleId]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    continueRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close("dismiss");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  function close(event: "continue" | "dismiss") {
    track({
      event,
      creativeId: sponsor.creativeId,
      campaignId: sponsor.campaignId,
      placement: "pre_article",
      articleId,
    });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sg-headline"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-md max-h-[90vh] overflow-auto rounded-lg bg-[#f9f7f1] p-6 shadow-2xl ring-1 ring-black/10">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">
            Sponsored
          </span>
          <button
            onClick={() => close("dismiss")}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-black/5"
          >
            Skip
          </button>
        </div>

        {sponsor.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsor.imageUrl}
            alt=""
            className="mb-4 block w-full rounded grayscale"
          />
        )}

        <h2
          id="sg-headline"
          className="mb-2 font-serif text-2xl font-black uppercase tracking-tight"
        >
          {sponsor.headline}
        </h2>
        {sponsor.body && (
          <p className="mb-5 font-serif leading-relaxed text-gray-800">
            {sponsor.body}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <a
            href={`/r/${sponsor.creativeId}?a=${encodeURIComponent(articleId)}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => setVisible(false)}
            className="block rounded bg-black px-4 py-3 text-center font-semibold uppercase tracking-wide text-white hover:bg-gray-900"
          >
            {sponsor.ctaText}
          </a>
          <button
            ref={continueRef}
            onClick={() => close("continue")}
            className="rounded border border-black bg-transparent px-4 py-3 text-sm font-medium hover:bg-black/5"
          >
            Continue to article →
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Sponsored by {sponsor.sponsorName}
        </p>
      </div>
    </div>
  );
}

async function track(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; suppress?: boolean } | null> {
  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return await res.json();
  } catch {
    return null;
  }
}