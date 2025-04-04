import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface Post {
  id: string
  title: string
  excerpt: string
  date: string
  author: string
  category: string
  tags: string[]
  imageURL: string
}

interface BlogCardProps {
  post: Post
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image src={post.imageURL || "/pic.jpg"} alt={post.title} fill className="object-cover" />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
          <time className="text-sm text-muted-foreground">{new Date(post.date).toLocaleDateString()}</time>
        </div>
        <Link href={`/blog/${post.id}`} className="hover:underline">
          <h3 className="text-xl font-bold">{post.title}</h3>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between mt-auto">
        <div className="text-sm">By {post.author}</div>
        <div className="flex gap-2">
          {post.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {post.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{post.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

