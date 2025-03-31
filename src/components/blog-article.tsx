import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  title: string
  excerpt: string
  date: string
  author: string
  category: string
  tags: string[]
  imageUrl: string
}

interface BlogArticleProps {
  post: Post
  featured?: boolean
}

export function BlogArticle({ post, featured = false }: BlogArticleProps) {
  return (
    <article className={cn("font-serif", featured ? "border-b border-gray-300 pb-6" : "")}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start text-xs">
          <Badge variant="outline" className="rounded-none uppercase font-bold border-black">
            {post.category}
          </Badge>
          <time className="italic">{new Date(post.date).toLocaleDateString()}</time>
        </div>

        <Link href={`/blog/${post.id}`} className="group">
          <h3
            className={cn(
              "font-bold font-serif uppercase tracking-tight group-hover:underline",
              featured ? "text-3xl md:text-4xl" : "text-xl",
            )}
          >
            {post.title}
          </h3>
        </Link>

        <div className="relative w-full">
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            width={featured ? 800 : 400}
            height={featured ? 400 : 200}
            className="w-full grayscale hover:grayscale-0 transition-all duration-300"
          />
          <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1">Photo by Staff</div>
        </div>

        <p className={cn("text-gray-800 leading-relaxed", featured ? "text-base" : "text-sm")}>{post.excerpt}</p>

        <div className="text-xs">
          By <span className="font-semibold uppercase">{post.author}</span>, Staff Reporter
        </div>

        <Link href={`/blog/${post.id}`} className="text-sm font-bold uppercase hover:underline self-end">
          Continue Reading →
        </Link>
      </div>
    </article>
  )
}

