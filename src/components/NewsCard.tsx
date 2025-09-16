import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Article } from "@/lib/supabase";

const altPic =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMWFhUXGB0YFxgYGBcYGhodGhodGxoXHR0YHSggGx0lHRgXIzEhJSkrLi4uGCAzODMtNyotLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIALcBFAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAFBgQHAAIDAQj/xABGEAACAQIEAwYDBgIIBAUFAAABAhEAAwQSITEFBkETIlFhcYEykaEHQrHB0fBSYhQjM3KCkqLhFbLC8SRDU3OzFjRjg6P/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AaOWeTMPh1BdVu3erMJAPgqnQDz3pnNhCIKKR4FQR8orRDXUGgXuL8o2n/rMOTh7w1VkJCz6D4fVY96I8n8zXHc4TFjLiU2OkXB4iNJjXTfXzFTyaX+cMAXtdvb0vWO+rDeBqw9okeY8zQWDWUE5c4+MTbtMBq9vOTIjMrZXWJnQ67bEUboBvMP8AYt7/AFUj86py5aLlc0gCVEbsTlj/AJd6uTj4mw3hKz6ZhNUbxvHZc1tdDbMk9ZMk/ImPlQWFgLqLbyZmJIjPMzGpGn7+lC+M8MEFgM06lgTPkDSLY43dABzahYC9AvX1kzP1ph4ZzVmJR1yhlE5p6fFA6k/mfSg54nJZVHtgyNcwaG9/GmTlfm9LjCze0YxkeIzTtIiAfMaelCOL27bWxlEM8mCADr0HntSPj7bIwPe3kEHaPIUF/wBy1UG9aoH9nnMBxNlhcfNcTQzGonRv1/3pjv0EBhWuauriuRoPQxrorVyrcUHTNWyvXAtXoaglq9dFeogaugBolbB6jK1bhqCUr1uHqMrVuGoJStW4aoytXQNQd5rYVxDV0BoO81sK4g1lB3msrlNZQU9y3zDba3cEf1xOe4m0kAK1xR4mJYdCDetNFvjloDuEM3gCPxOgpS4vy5h8TdNxgyudypifMjoT5xU7B8tWrQhQx8ydTQNnD8c9wS6ZfDXX3G4qRj8UttC7bD6noB5k0u4zF3bSgWrZfwA0A9T0qFw3iLX7jLfQq6bKdR5kefnQNnD+MW7rFFkMBsR08x4ip9xwASTAGpJ2A8TQ7B4JU1CgHx6+1D+Z8eFUWxu2p9B+poB3GeY7b3FQHuKZJ8T0jyH40v8R4kLt1n6bKPIfv61C4q5CkjfYep0FCsTdNtCx6CgLcQ4uLdsmdToB4k7Uv8A2d8w9hiLqP8A2d1yCfBp0PvQHinFC7QDoNh+ZobZxBVgw3BkUH0Rj+OW7a5mYLPjufQbml7Fc7WQYVWb1IUfKZ+lVtxPjL3XLsZJ+Q8h5UPOKoLe4Zz1YZwtwG3OgYkMvqdJH1p1w+IV1DKQykSCCCCPIivm5cUaO8u8zX8K2a02h+JDqj+o8fMQRQfQeH0HvWUvcq802cYnd7t1R37ZOo81P3l8/nFZQKtq6GUMpBBEgjYg7EVtVZ8j8xG04sXD3G+An7reHofr61ZlAuc0cAF9e0tgC8o0/nH8J8/A/LwNV1h8QyMGUlWUyCNwRX0BVW/aFy32T/wBItD+rc94D7rHr6H6+tA08t8wJiU17t1R30/Neqn6bUZqg8HingXbTFbiGQQYII3Bq1OVOZlxK5H0uqNR0YfxL+Y6e1A0VlZWVQK/MP9i3qv5iqO4zjM9xj0Gg9BV4cw/2Leq/mKoHifxt6mgHX7tQr11mIVRJOgA3JqRfqZyxhQ95SdgZ+W1A6cucuC0oZxLnfy8hTLawgHSu+HSBUgLQcUsAV2C1tFbRQa5a2isrKDIrKysqjKysrKDIrKysqjKysrKDIrKysqjKysrKDIrKysqj/9k=";

interface NewsCardProps {
  article: Article;
  featured?: boolean;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const date = new Date(article.publishedAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className={cn(
        "font-serif",
        featured ? "border-b border-gray-300 pb-6" : ""
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start text-xs">
          <Badge
            variant="outline"
            className="rounded-none uppercase font-bold border-black"
          >
            {article.source.name}
          </Badge>
          <time className="italic">{formattedDate}</time>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <h3
            className={cn(
              "font-bold font-serif uppercase tracking-tight group-hover:underline",
              featured ? "text-3xl md:text-4xl" : "text-xl"
            )}
          >
            {article.title}
          </h3>
        </a>

        <div className="relative w-full">
          <img
            src={article.urlToImage || altPic}
            alt={article.title}
            width={featured ? 800 : 400}
            height={featured ? 400 : 200}
            className="w-full grayscale hover:grayscale-0 transition-all duration-300 object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1">
            {article.source.name}
          </div>
        </div>

        <p
          className={cn(
            "text-gray-800 leading-relaxed",
            featured ? "text-base" : "text-sm"
          )}
        >
          {article.description}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold uppercase hover:underline self-end inline-block mt-2"
        >
          Continue Reading →
        </a>
      </div>
    </article>
  );
}
