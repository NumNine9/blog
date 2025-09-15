import { Article } from "@/lib/supabase";
import Image from "next/image";

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {article.urlToImage && (
        <div className="relative h-48 w-full">
          <img
            src={article.urlToImage}
            alt={article.title}
            // fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">
          {article.title}
        </h2>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {article.description}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{article.source.name}</span>
          <span>{formattedDate}</span>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Read More
        </a>
      </div>
    </div>
  );
}
