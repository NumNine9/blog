"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ScanEye } from "lucide-react";
import { NewspaperHeader } from "@/components/newspaper-header";
import { DateDisplay } from "@/components/date-display";
import { BlogPost, supabase } from "@/lib/supabase";
import { use, useEffect, useRef, useState } from "react";
import { altPic } from "@/components/blog-article";
import toast, { Toaster } from "react-hot-toast";
import MDEditor from "@uiw/react-md-editor";
import { Loader } from "@/components/loader";
import BlogComments from "@/components/BlogComments";
import { SponsorGate } from "@/components/SponsorGate";
import type { SponsorDecision } from "@/lib/sponsor/types";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [blog, setBlog] = useState<BlogPost>();
  const [sponsor, setSponsor] = useState<SponsorDecision | null>(null);
  const viewedRef = useRef<number | null>(null);

  // Cache the in-flight sponsor fetch by id so Strict Mode's
  // second effect invocation reuses it instead of double-fetching.
  const sponsorFetchRef = useRef<{
    id: string;
    promise: Promise<{ sponsor: SponsorDecision | null }>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    function getSponsorPromise(articleId: string) {
      if (sponsorFetchRef.current?.id === articleId) {
        return sponsorFetchRef.current.promise;
      }
      const promise = fetch(
        `/api/sponsor?placement=pre_article&articleId=${encodeURIComponent(
          articleId
        )}`,
        { cache: "no-store" }
      ).then((r) => r.json() as Promise<{ sponsor: SponsorDecision | null }>);
      sponsorFetchRef.current = { id: articleId, promise };
      return promise;
    }

    async function load() {
      const numericId = Number(id);

      const [blogResult, sponsorResult] = await Promise.allSettled([
        supabase.from("blogPosts").select("*").eq("id", numericId).single(),
        getSponsorPromise(id),
      ]);

      if (cancelled) return;

      // --- Blog ---
      if (
        blogResult.status === "fulfilled" &&
        !blogResult.value.error &&
        blogResult.value.data
      ) {
        const data = blogResult.value.data;

        if (viewedRef.current !== numericId) {
          viewedRef.current = numericId;
          const { error: rpcError } = await supabase.rpc("increment_views", {
            post_id: numericId,
          });
          if (rpcError) {
            console.error("Failed to increment views:", rpcError);
          }
        }

        setBlog({ ...(data as BlogPost), views: (data.views ?? 0) + 1 });
      } else {
        toast.error("Blog post not found", {
          duration: 4000,
          position: "bottom-center",
          style: { backgroundColor: "#fc5659" },
          className: "",
          icon: "❌",
          iconTheme: { primary: "#99f598", secondary: "#99f598" },
          ariaProps: { role: "status", "aria-live": "polite" },
          removeDelay: 2000,
        });
      }

      // --- Sponsor (failsafe: null on any problem) ---
      if (
        sponsorResult.status === "fulfilled" &&
        sponsorResult.value &&
        sponsorResult.value.sponsor
      ) {
        setSponsor(sponsorResult.value.sponsor);
      }
    }

    if (id) load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const dateString: string | undefined = blog?.created_at;
  const date = dateString ? new Date(dateString) : new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="flex justify-between items-center border-b-2 border-black py-2 mb-6">
        <DateDisplay />
        <div className="font-serif">Edition No. 42</div>
      </div>

      <Button
        variant="ghost"
        asChild
        className="mb-6 rounded-none border border-black hover:bg-gray-100"
      >
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Front Page
        </Link>
      </Button>

      {blog ? (
        <article className="max-w-4xl mx-auto font-serif">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              variant="outline"
              className="rounded-none uppercase font-bold border-black"
            >
              {blog?.category}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-none uppercase font-bold border-black"
            >
              {blog?.views} <ScanEye className="w-4 h-4 text-gray-500" />
            </Badge>
            {blog?.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-none">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 font-serif">
            {blog?.title}
          </h1>

          <h2 className="text-xl md:text-2xl font-medium italic mb-6">
            {blog?.subtitle}
          </h2>

          <div className="flex items-center justify-between text-sm mb-6 border-b border-t border-black py-2">
            <div>
              By <span className="font-semibold uppercase">{blog?.author}</span>
              , Staff Reporter
            </div>
            <time className="italic">{formattedDate}</time>
          </div>

          <div className="relative w-full mb-8">
            <Image
              src={blog?.imageURL || altPic}
              alt={blog?.created_at || altPic}
              width={800}
              height={400}
              className="w-full grayscale"
            />
            <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1">
              Photo by Staff Photographer
            </div>
          </div>

          <div className="container bg-white p-6 rounded-lg">
            <MDEditor.Markdown
              source={blog?.content || "no content"}
              style={{
                backgroundColor: "transparent",
                color: "#000000",
              }}
            />
          </div>

          <div className="mt-8 pt-4 border-t border-black text-sm italic">
            This article first appeared in The Commit Log on {formattedDate}
          </div>
          <BlogComments postId={id} supabase={supabase} />
          <Toaster />
        </article>
      ) : (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      )}

      {blog && sponsor && (
        <SponsorGate sponsor={sponsor} articleId={id} />
      )}
    </main>
  );
}