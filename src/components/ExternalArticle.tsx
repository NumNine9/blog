// ExternalArticle.tsx
import { ContentItem } from "@/lib/supabase";

interface ExternalArticleProps {
  article: Extract<ContentItem, { type: "external" }>;
}
export default function ExternalArticle({ article }: ExternalArticleProps) {
  return (
    <article className="bg-white p-6 rounded-lg border-l-4 border-green-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-bold">N</span>
        </div>
        <div>
          <p className="font-semibold">News Source</p>
          <p className="text-sm text-gray-500">{article.source.name}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-2">{article.title}</h2>
      <p className="text-gray-700 mb-4">{article.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-green-600 font-medium">
          External News
        </span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          View Original
        </a>
      </div>
    </article>
  );
}
