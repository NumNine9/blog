// InternalArticle.tsx
import { ContentItem } from "@/lib/supabase";

interface InternalArticleProps {
  post: Extract<ContentItem, { type: "internal" }>;
}
export default function InternalArticle({ post }: InternalArticleProps) {
  return (
    <article className="bg-white p-6 rounded-lg border-l-4 border-blue-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">U</span>
        </div>
        <div>
          <p className="font-semibold">Our Writer</p>
          <p className="text-sm text-gray-500">{post.author}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">{post.excerpt}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-600 font-medium">
          {post.category}
        </span>
        <button className="text-blue-600 hover:underline">Read Article</button>
      </div>
    </article>
  );
}
