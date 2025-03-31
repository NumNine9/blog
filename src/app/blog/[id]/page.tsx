import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { NewspaperHeader } from "@/components/newspaper-header"
import { DateDisplay } from "@/components/date-display"

interface BlogPostPageProps {
  params: {
    id: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  // In a real app, you would fetch this data from your database based on the ID
  const post = {
    id: params.id,
    title: "NEXT.JS FRAMEWORK REVOLUTIONIZES WEB DEVELOPMENT",
    subtitle: "Developers worldwide adopt new technology at unprecedented rates",
    content: `
      <p class="text-lg font-bold first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left">Next.js is rapidly becoming the framework of choice for modern web applications, offering developers a powerful set of tools to create dynamic, interactive websites with minimal configuration.</p>
      
      <p>Industry experts note that the framework's server-side rendering capabilities provide significant advantages for both performance and search engine optimization, making it an attractive option for businesses looking to establish a strong online presence.</p>
      
      <p>"We've seen a 40% improvement in load times since migrating to Next.js," reports Jane Smith, CTO of TechCorp Industries. "Our customers have noticed the difference, and our conversion rates have improved accordingly."</p>
      
      <h2 class="text-2xl font-bold mt-6 mb-4 uppercase">KEY FEATURES DRIVING ADOPTION</h2>
      
      <p>The framework's popularity can be attributed to several key features:</p>
      
      <ul class="list-disc pl-5 my-4 space-y-2">
        <li>File-system based routing that simplifies navigation structure</li>
        <li>Server-side rendering for improved performance and SEO</li>
        <li>Automatic code splitting to reduce initial load times</li>
        <li>Built-in CSS and Sass support for streamlined styling</li>
        <li>Fast refresh capabilities that enhance the development experience</li>
        <li>API routes that facilitate backend functionality</li>
      </ul>
      
      <p>These features combine to create a development experience that many find superior to traditional approaches, leading to faster development cycles and more robust applications.</p>
      
      <p>As web technologies continue to evolve, frameworks like Next.js are expected to play an increasingly important role in shaping the digital landscape. With strong community support and regular updates from its maintainers, Next.js appears poised to remain at the forefront of web development for years to come.</p>
    `,
    date: "2023-10-15",
    author: "Jane Doe",
    category: "Technology",
    tags: ["Next.js", "React", "JavaScript"],
    imageUrl: "/placeholder.svg?height=400&width=800",
  }

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
            {post.category}
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-none">
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 font-serif">
          {post.title}
        </h1>

        <h2 className="text-xl md:text-2xl font-medium italic mb-6">{post.subtitle}</h2>

        <div className="flex items-center justify-between text-sm mb-6 border-b border-t border-black py-2">
          <div>
            By <span className="font-semibold uppercase">{post.author}</span>, Staff Reporter
          </div>
          <time className="italic">{new Date(post.date).toLocaleDateString()}</time>
        </div>

        <div className="relative w-full mb-8">
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
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
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-8 pt-4 border-t border-black text-sm italic">
          This article first appeared in The Daily Blog on {new Date(post.date).toLocaleDateString()}
        </div>
      </article>
    </main>
  )
}

