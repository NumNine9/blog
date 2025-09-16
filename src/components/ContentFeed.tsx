import { useState, useMemo } from "react";
import { BlogPost } from "@/lib/supabase";
import { Article } from "@/lib/supabase";
import SearchBar from "./SearchBar";
import InternalArticle from "./InternalArticle";
import ExternalArticle from "./ExternalArticle";
import { ContentItem } from "@/lib/supabase";

interface ContentFeedProps {
  internalContent: BlogPost[];
  externalContent: Article[];
}

export default function ContentFeed({
  internalContent,
  externalContent,
}: ContentFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contentFilter, setContentFilter] = useState("all");

  // Combine content with unified type
  const allContent = useMemo((): ContentItem[] => {
    const internalItems: ContentItem[] = internalContent.map((post) => ({
      type: "internal",
      ...post,
    }));

    const externalItems: ContentItem[] = externalContent.map((article) => ({
      type: "external",
      ...article,
      id: article.url, // Using URL as ID for external content
    }));

    return [...internalItems, ...externalItems];
  }, [internalContent, externalContent]);

  // Filter content based on search query and filter
  const filteredContent = useMemo(() => {
    return allContent.filter((item) => {
      // Apply content type filter
      if (contentFilter !== "all" && item.type !== contentFilter) {
        return false;
      }

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();

        if (item.type === "internal") {
          return (
            item.title.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query) ||
            item.author.toLowerCase().includes(query) ||
            item.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        } else {
          return (
            item.title.toLowerCase().includes(query) ||
            (item.description &&
              item.description.toLowerCase().includes(query)) ||
            (item.content && item.content.toLowerCase().includes(query)) ||
            item.source.name.toLowerCase().includes(query)
          );
        }
      }

      return true;
    });
  }, [allContent, searchQuery, contentFilter]);

  const handleSearch = (query: string, filter: string) => {
    setSearchQuery(query);
    setContentFilter(filter);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Content Feed</h1>

      <SearchBar onSearch={handleSearch} />

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredContent.length} of {allContent.length} items
        </p>
        {searchQuery && (
          <button
            onClick={() => handleSearch("", contentFilter)}
            className="text-blue-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No content found matching your criteria.
          </p>
          <button
            onClick={() => handleSearch("", "all")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Show all content
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => {
            if (item.type === "internal") {
              return <InternalArticle key={item.id} post={item} />;
            } else {
              return <ExternalArticle key={item.id} article={item} />;
            }
          })}
        </div>
      )}
    </div>
  );
}
