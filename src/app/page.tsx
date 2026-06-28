"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogArticle } from "@/components/blog-article";
import { PaginationDemo } from "@/components/pagination-demo";
import { NewspaperHeader } from "@/components/newspaper-header";
import { WeatherWidget } from "@/components/weather-widget";
import { DateDisplay } from "@/components/date-display";
import { useEffect, useState, useCallback } from "react";
import { BlogPost, supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader } from "@/components/loader";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 3;

  const fetchPostsData = useCallback(async () => {
    setLoading(true);
    try {
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from("blogPosts")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Error fetching count:", countError);
        return;
      }

      const calculatedTotalPages = Math.ceil((count || 0) / pageSize);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);

      // Fetch paginated posts
      const { data, error } = await supabase
        .from("blogPosts")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) {
        console.error("Error fetching posts:", error);
        setBlogPosts([]);
        return;
      }

      // Map the data to match BlogPost type
      const posts: BlogPost[] = (data || []).map((post) => ({
        ...post,
        source_type: "internal",
      }));

      setBlogPosts(posts);
    } catch (error) {
      console.error("Error in fetchPostsData:", error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]); // Add dependencies here

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      }
    };

    checkUser();
    fetchPostsData();
  }, [fetchPostsData]); // Now fetchPostsData is stable and won't cause unnecessary re-renders

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
        toast.error("Error signing out", {
          duration: 4000,
          position: "bottom-center",
          style: { backgroundColor: "#fc5659" },
          icon: "❌",
        });
        return;
      }

      setUser(null);
      toast.success("You have signed out", {
        duration: 4000,
        position: "bottom-center",
        style: { backgroundColor: "#99f598" },
        icon: "👏",
      });

      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred", {
        duration: 4000,
        position: "bottom-center",
        style: { backgroundColor: "#fc5659" },
        icon: "❌",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if there are any posts
  const hasPosts = blogPosts.length > 0;

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="flex justify-between items-center border-b-2 border-black py-2 mb-6">
        <DateDisplay />
        <WeatherWidget />
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-serif">LATEST STORIES</h2>
        <div className="flex gap-2">
          <Button
            asChild
            className="bg-black text-white hover:bg-gray-800 rounded-none"
          >
            {user ? (
              <Link href="/admin/create">SUBMIT ARTICLE</Link>
            ) : (
              <Link href="/signup">SUBMIT ARTICLE</Link>
            )}
          </Button>
          {user && (
            <Button
              onClick={handleSignOut}
              className="bg-[#3d4a4a] text-white hover:bg-gray-800 rounded-none border-white cursor-pointer"
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : !hasPosts ? (
        <div className="text-center py-16 border-4 border-dashed border-gray-300">
          <h3 className="text-2xl font-serif text-gray-500 mb-4">
            No articles published yet
          </h3>
          <p className="text-gray-400">Be the first to submit an article!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured article - spans 8 columns */}
            <div className="lg:col-span-8 border-r border-gray-400 pr-6">
              {blogPosts[0] && (
                <BlogArticle post={blogPosts[0]} featured={true} />
              )}
            </div>

            {/* Side articles - span 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              {blogPosts.slice(1, 3).map((post) => (
                <BlogArticle key={post.id} post={post} featured={false} />
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <PaginationDemo
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
