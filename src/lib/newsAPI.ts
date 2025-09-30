import axios from "axios";
import { Article, NewsResponse } from "./supabase";

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2";

interface ApiError {
  message: string;
  response?: {
    status: number;
    data: NewsResponse;
  };
}
// Debug: Check if API key is loaded (remove in production)
console.log("API Key available:", !!API_KEY);
if (!API_KEY) {
  console.error("NEWS_API_KEY is missing from environment variables");
}

export const fetchTopHeadlines = async (
  country: string = "us",
  category: string = "general",
  pageSize: number = 20
): Promise<Article[]> => {
  try {
    // NewsAPI requires API key as a query parameter, not in headers
    const response = await axios.get<NewsResponse>(
      `${BASE_URL}/top-headlines`,
      {
        params: {
          country,
          category,
          pageSize,
          apiKey: API_KEY, // This should be a query parameter
        },
      }
    );

    if (response.data.status !== "ok") {
      console.error("NewsAPI returned non-ok status:", response.data.status);
      return [];
    }

    return response.data.articles;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error("Error fetching news:", apiError.message);
    if (apiError.response) {
      console.error("Status:", apiError.response.status);
      console.error("Data:", apiError.response.data);
    }
    return [];
  }
};

export const fetchNewsByQuery = async (
  query: string,
  pageSize: number = 20
): Promise<Article[]> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/everything`, {
      params: {
        q: query,
        pageSize,
        sortBy: "publishedAt",
        apiKey: API_KEY, // Query parameter
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error("Error fetching news by query:", error);
    return [];
  }
};
