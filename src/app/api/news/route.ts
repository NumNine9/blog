import { NextRequest, NextResponse } from "next/server";
import { fetchTopHeadlines } from "../../../lib/newsAPI";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || "general";
  const country = searchParams.get("country") || "us";

  try {
    const articles = await fetchTopHeadlines(country, category);

    // Return empty array instead of error if no articles
    return NextResponse.json({
      articles,
      message:
        articles.length === 0
          ? "No articles found"
          : "Articles retrieved successfully",
    });
  } catch (error: unknown) {
    console.error(
      "API Route Error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error: "Failed to fetch news",
        // details: error.message,
        articles: [], // Return empty array instead of error
      },
      { status: 500 }
    );
  }
}
