import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogArticle } from "@/components/blog-article"
import { PaginationDemo } from "@/components/pagination-demo"
import { NewspaperHeader } from "@/components/newspaper-header"
import { WeatherWidget } from "@/components/weather-widget"
import { DateDisplay } from "@/components/date-display"

export default function Home() {
  // In a real app, you would fetch this data from your database yes
  const blogPosts = [
    {
      id: "1",
      title: "NEXT.JS FRAMEWORK REVOLUTIONIZES WEB DEVELOPMENT",
      excerpt: "New technology promises to change how developers build applications for the modern web",
      date: "2023-10-15",
      author: "Jane Doe",
      category: "Technology",
      tags: ["Next.js", "React", "JavaScript"],
      imageUrl: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "2",
      title: "SERVER COMPONENTS: THE FUTURE OF REACT APPLICATIONS",
      excerpt: "Industry experts predict significant performance improvements with new rendering approach",
      date: "2023-10-10",
      author: "John Smith",
      category: "Technology",
      tags: ["React", "Server Components"],
      imageUrl: "/placeholder.svg?height=200&width=400",
    },
    {
      id: "3",
      title: "STYLING TRENDS IN WEB DEVELOPMENT SHIFT DRAMATICALLY",
      excerpt: "Developers embrace utility-first CSS as traditional approaches fall out of favor",
      date: "2023-10-05",
      author: "Jane Doe",
      category: "Design",
      tags: ["CSS", "Tailwind", "Styling"],
      imageUrl: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="flex justify-between items-center border-b-2 border-black py-2 mb-6">
        <DateDisplay />
        <WeatherWidget />
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold font-serif">LATEST STORIES</h2>
        <Button asChild className="bg-black text-white hover:bg-gray-800 rounded-none">
          <Link href="/admin/create">SUBMIT ARTICLE</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured article - spans 8 columns */}
        <div className="lg:col-span-8 border-r border-gray-400 pr-6">
          <BlogArticle post={blogPosts[0]} featured={true} />
        </div>

        {/* Side articles - span 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          {blogPosts.slice(1, 3).map((post) => (
            <BlogArticle key={post.id} post={post} featured={false} />
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <PaginationDemo />
      </div>
    </main>
  )
}

