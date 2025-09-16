"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlogArticle } from "@/components/blog-article";
import { PaginationDemo } from "@/components/pagination-demo";
import { NewspaperHeader } from "@/components/newspaper-header";
import { WeatherWidget } from "@/components/weather-widget";
import { DateDisplay } from "@/components/date-display";
import { useEffect, useState } from "react";
import { BlogPost, fetchPagePosts, supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader } from "@/components/loader";
import { Article } from "@/lib/supabase";
import NewsCard from "@/components/NewsCard";
export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 3; // Number of posts per page
  const [articles, setArticles] = useState<Article[]>([]);
  // const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("general");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/news?category=${category}`);
        const data = await response.json();
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    checkUser();
    fetchPostsData();
  }, [currentPage, category]); // Add currentPage as dependency

  const fetchPostsData = async () => {
    setLoading(true);
    try {
      // First fetch the total count of posts
      const { count } = await supabase
        .from("blogPosts")
        .select("*", { count: "exact", head: true });

      // Calculate total pages
      const calculatedTotalPages = Math.ceil((count || 0) / pageSize);
      setTotalPages(calculatedTotalPages);

      // Then fetch the paginated posts
      const posts = await fetchPagePosts(currentPage, pageSize);
      setBlogPosts(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
        return;
      }
      toast.success("You have signed out", {
        duration: 4000,
        position: "bottom-center",
        style: { backgroundColor: "#99f598" },
        icon: "👏",
        iconTheme: {
          primary: "#99f598",
          secondary: "#99f598",
        },
        ariaProps: {
          role: "status",
          "aria-live": "polite",
        },
        removeDelay: 2000,
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Optional: scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="flex justify-between items-center border-b-2 border-black py-2 mb-6">
        <DateDisplay />
        <WeatherWidget />
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-serif">LATEST STORIES</h2>
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
            asChild
            onClick={() => handleSignOut()}
            className="bg-[#3d4a4a] text-white hover:bg-gray-800 rounded-none mr-[3px] border-white"
          >
            <p>Sign Outt</p>
          </Button>
        )}
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="general">General</option>
            <option value="business">Business</option>
            <option value="entertainment">Entertainment</option>
            <option value="health">Health</option>
            <option value="science">Science</option>
            <option value="sports">Sports</option>
            <option value="technology">Technology</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <NewsCard key={index} article={article} />
          ))}
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
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
