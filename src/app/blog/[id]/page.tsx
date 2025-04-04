'use client';
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { NewspaperHeader } from "@/components/newspaper-header"
import { DateDisplay } from "@/components/date-display"
import { BlogPost, supabase } from "@/lib/supabase"
import { useEffect, useState } from 'react';

interface BlogPostPageProps {
  params: {
    id: string
  }
}
// { params }: BlogPostPageProps
export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [blog, setBlog] = useState<BlogPost>();
// Fetch the specific blog post
useEffect(() => {
  async function loadBlog() {
    try {
      // setLoading(true);
      // setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('blogPosts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        setBlog(data as BlogPost);
      } else {
        alert('Blog post not found');
      }
    } catch (err) {
      console.error('Error loading blog post:', err);
      alert('Failed to load blog post');
      // setBlog(null);
    } finally {
      // setLoading(false);
    }
  }

  if (params?.id) {
    loadBlog();
  }
}, [params?.id]);
  // const { data } = await supabase
  //   .from('blogPosts')
  //   .select('*')
  //   .eq('id', params.id)
  //   .single()

  // setBlog(data)
  // const blog: BlogPost = data

  
  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="flex justify-between items-center border-b-2 border-black py-2 mb-6">
        <DateDisplay />
        <div className="font-serif">Edition No. 42</div>
      </div>

      <Button variant="ghost" asChild className="mb-6 rounded-none border border-black hover:bg-gray-100">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Front Page
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto font-serif">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="rounded-none uppercase font-bold border-black">
            {blog?.category}
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

        <h2 className="text-xl md:text-2xl font-medium italic mb-6">{blog?.subtitle}</h2>

        <div className="flex items-center justify-between text-sm mb-6 border-b border-t border-black py-2">
          <div>
            By <span className="font-semibold uppercase">{blog?.author}</span>, Staff Reporter
          </div>
          <time className="italic">{blog?.created_at}</time>
        </div>

        <div className="relative w-full mb-8">
          <Image
            src={blog?.imageUrl || "/placeholder.svg"}
            alt={blog?.created_at || "/placeholder.svg"}
            width={800}
            height={400}
            className="w-full grayscale"
          />
          <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1">
            Photo by Staff Photographer
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none font-serif prose-headings:font-serif prose-headings:uppercase prose-headings:font-bold"
          dangerouslySetInnerHTML={{ __html: blog?.content || "no content" }}
        />

        <div className="mt-8 pt-4 border-t border-black text-sm italic">
          This article first appeared in The Commit Log on {new Date().toLocaleDateString()}
        </div>
      </article>
    </main>
  )
}

