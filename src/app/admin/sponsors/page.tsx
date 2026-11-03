"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/loader";
import toast, { Toaster } from "react-hot-toast";

type SponsorStatus = "active" | "paused" | "archived";
type CreativeStatus = "pending" | "approved" | "rejected";

type Sponsor = {
  id: string;
  name: string;
  contact_email: string | null;
  status: SponsorStatus;
  created_at: string;
};

type Campaign = {
  id: string;
  sponsor_id: string;
  name: string;
  placement: string;
  starts_at: string | null;
  ends_at: string | null;
  status: SponsorStatus;
  weight: number;
  created_at: string;
};

type Creative = {
  id: string;
  campaign_id: string;
  headline: string;
  body: string | null;
  image_url: string | null;
  cta_text: string;
  destination_url: string;
  status: CreativeStatus;
  created_at: string;
};

type Data = { sponsors: Sponsor[]; campaigns: Campaign[]; creatives: Creative[] };
type Tab = "sponsors" | "campaigns" | "creatives";

export default function SponsorAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<Data>({ sponsors: [], campaigns: [], creatives: [] });
  const [tab, setTab] = useState<Tab>("sponsors");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setToken(session.access_token);
      await load(session.access_token);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function load(t: string) {
    const res = await fetch("/api/admin", {
      headers: { authorization: `Bearer ${t}` },
    });
    if (!res.ok) {
      toast.error("Failed to load admin data");
      return;
    }
    const json: Data = await res.json();
    setData(json);
  }

  async function mutate(action: string, payload: unknown) {
    if (!token) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Failed");
      return;
    }
    await load(token);
    toast.success("Saved");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl bg-[#f9f7f1] px-4 py-8 font-serif">
      <div className="mb-6 flex items-center justify-between border-b-2 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Sponsor Admin
        </h1>
        <Button
          variant="outline"
          onClick={signOut}
          className="rounded-none border-black"
        >
          Sign out
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        {(["sponsors", "campaigns", "creatives"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-2 px-4 py-2 text-sm font-bold uppercase tracking-wider ${
              tab === t
                ? "border-black bg-black text-white"
                : "border-black bg-transparent hover:bg-black/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "sponsors" && <SponsorsPanel data={data} mutate={mutate} />}
      {tab === "campaigns" && <CampaignsPanel data={data} mutate={mutate} />}
      {tab === "creatives" && <CreativesPanel data={data} mutate={mutate} />}

      <Toaster />
    </main>
  );
}

/* ------------------------------ Sponsors ------------------------------ */

function SponsorsPanel({
  data,
  mutate,
}: {
  data: Data;
  mutate: (a: string, p: unknown) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await mutate("create-sponsor", { name, contact_email: email || null });
    setName("");
    setEmail("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="space-y-3 border-4 border-black bg-white p-4">
        <h2 className="text-lg font-bold uppercase">New Sponsor</h2>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <div className="grid gap-2">
          <Label>Contact email (optional)</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <Button
          type="submit"
          className="rounded-none bg-black text-white hover:bg-gray-900"
        >
          Create
        </Button>
      </form>

      <div className="border-4 border-black bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data.sponsors.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No sponsors yet
                </td>
              </tr>
            )}
            {data.sponsors.map((s) => (
              <tr key={s.id} className="border-t border-black/20">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.contact_email ?? "—"}</td>
                <td className="p-2">
                  <select
                    value={s.status}
                    onChange={(e) =>
                      mutate("update-sponsor", { id: s.id, status: e.target.value })
                    }
                    className="rounded-none border-2 border-black bg-[#f9f7f1] px-2 py-1"
                  >
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete sponsor "${s.name}"? This also deletes its campaigns and creatives.`
                        )
                      )
                        mutate("delete-sponsor", { id: s.id });
                    }}
                    className="text-xs font-bold uppercase text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ Campaigns ------------------------------ */

function CampaignsPanel({
  data,
  mutate,
}: {
  data: Data;
  mutate: (a: string, p: unknown) => Promise<void>;
}) {
  const [sponsorId, setSponsorId] = useState("");
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState("pre_article");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [weight, setWeight] = useState("1");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await mutate("create-campaign", {
      sponsor_id: sponsorId,
      name,
      placement,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      weight: Number(weight) || 1,
    });
    setName("");
    setStartsAt("");
    setEndsAt("");
    setWeight("1");
  }

  const sponsorById = Object.fromEntries(data.sponsors.map((s) => [s.id, s.name]));

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="space-y-3 border-4 border-black bg-white p-4">
        <h2 className="text-lg font-bold uppercase">New Campaign</h2>
        <div className="grid gap-2">
          <Label>Sponsor</Label>
          <select
            required
            value={sponsorId}
            onChange={(e) => setSponsorId(e.target.value)}
            className="rounded-none border-2 border-black bg-[#f9f7f1] px-2 py-2"
          >
            <option value="">— Select sponsor —</option>
            {data.sponsors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Campaign name</Label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <div className="grid gap-2">
          <Label>Placement</Label>
          <Input
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Starts at</Label>
            <Input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="rounded-none border-2 border-black"
            />
          </div>
          <div className="grid gap-2">
            <Label>Ends at</Label>
            <Input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="rounded-none border-2 border-black"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Weight</Label>
          <Input
            type="number"
            min="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <Button
          type="submit"
          className="rounded-none bg-black text-white hover:bg-gray-900"
        >
          Create
        </Button>
      </form>

      <div className="overflow-x-auto border-4 border-black bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 text-left">Campaign</th>
              <th className="p-2 text-left">Sponsor</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Weight</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data.campaigns.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No campaigns yet
                </td>
              </tr>
            )}
            {data.campaigns.map((c) => (
              <tr key={c.id} className="border-t border-black/20">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{sponsorById[c.sponsor_id] ?? "—"}</td>
                <td className="p-2">
                  <select
                    value={c.status}
                    onChange={(e) =>
                      mutate("update-campaign", { id: c.id, status: e.target.value })
                    }
                    className="rounded-none border-2 border-black bg-[#f9f7f1] px-2 py-1"
                  >
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
                <td className="p-2">{c.weight}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete campaign "${c.name}"? This also deletes its creatives.`
                        )
                      )
                        mutate("delete-campaign", { id: c.id });
                    }}
                    className="text-xs font-bold uppercase text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------ Creatives ------------------------------ */

function CreativesPanel({
  data,
  mutate,
}: {
  data: Data;
  mutate: (a: string, p: unknown) => Promise<void>;
}) {
  const [campaignId, setCampaignId] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("Learn more");
  const [destination, setDestination] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await mutate("create-creative", {
      campaign_id: campaignId,
      headline,
      body: body || null,
      image_url: imageUrl || null,
      cta_text: ctaText || "Learn more",
      destination_url: destination,
    });
    setHeadline("");
    setBody("");
    setImageUrl("");
    setCtaText("Learn more");
    setDestination("");
  }

  const campaignById = Object.fromEntries(data.campaigns.map((c) => [c.id, c.name]));
  const sponsorById = Object.fromEntries(data.sponsors.map((s) => [s.id, s.name]));
  const sponsorNameByCampaign = Object.fromEntries(
    data.campaigns.map((c) => [c.id, sponsorById[c.sponsor_id] ?? "—"])
  );

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="space-y-3 border-4 border-black bg-white p-4">
        <h2 className="text-lg font-bold uppercase">New Creative</h2>
        <div className="grid gap-2">
          <Label>Campaign</Label>
          <select
            required
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="rounded-none border-2 border-black bg-[#f9f7f1] px-2 py-2"
          >
            <option value="">— Select campaign —</option>
            {data.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {sponsorNameByCampaign[c.id]} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Headline</Label>
          <Input
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <div className="grid gap-2">
          <Label>Body</Label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="rounded-none border-2 border-black bg-[#f9f7f1] px-3 py-2 font-serif"
          />
        </div>
        <div className="grid gap-2">
          <Label>Image URL</Label>
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="rounded-none border-2 border-black"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>CTA text</Label>
            <Input
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="rounded-none border-2 border-black"
            />
          </div>
          <div className="grid gap-2">
            <Label>Destination URL</Label>
            <Input
              type="url"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="rounded-none border-2 border-black"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="rounded-none bg-black text-white hover:bg-gray-900"
        >
          Create
        </Button>
        <p className="text-xs text-gray-600">
          New creatives start as <strong>pending</strong>. Approve them in the
          list below to make them live.
        </p>
      </form>

      <div className="overflow-x-auto border-4 border-black bg-white">
        <table className="w-full text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 text-left">Headline</th>
              <th className="p-2 text-left">Campaign</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {data.creatives.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No creatives yet
                </td>
              </tr>
            )}
            {data.creatives.map((cr) => (
              <tr key={cr.id} className="border-t border-black/20">
                <td className="p-2">{cr.headline}</td>
                <td className="p-2">{campaignById[cr.campaign_id] ?? "—"}</td>
                <td className="p-2">
                  <select
                    value={cr.status}
                    onChange={(e) =>
                      mutate("update-creative", { id: cr.id, status: e.target.value })
                    }
                    className="rounded-none border-2 border-black bg-[#f9f7f1] px-2 py-1"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Delete creative "${cr.headline}"?`))
                        mutate("delete-creative", { id: cr.id });
                    }}
                    className="text-xs font-bold uppercase text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}