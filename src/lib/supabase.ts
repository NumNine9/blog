import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type ContentItem =
  | {
      type: "internal";
      id: number;
      created_at?: string;
      updated_at?: string;
      title: string;
      subtitle: string;
      content: string;
      excerpt: string;
      author: string;
      category: string;
      tags: Array<string>;
      imageURL: string;
      published?: boolean;
      views?: number;
    }
  | {
      type: "external";
      source: {
        id: string | null;
        name: string;
      };
      author: string | null;
      title: string;
      description: string;
      url: string;
      urlToImage: string | null;
      publishedAt: string;
      content: string | null;
      id: string; // Using URL as ID for external content
    };

export type BlogPost = {
  id: number;
  created_at?: string;
  updated_at?: string;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: Array<string>;
  imageURL: string;
  published?: boolean;
  views?: number;
  source_type: "internal" | "external";
  external_source?: string; // For external content source name
  original_url?: string; // For external content original link
};

export const fetchPagePosts = async (
  page = 1,
  pageSize = 3,
  category = "general",
) => {
  const { data, error } = await supabase
    .from("blogPosts")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  // Add source_type to distinguish content
  const internalWithType =
    data?.map((post) => ({
      ...post,
      source_type: "internal",
    })) || [];
  // Fetch external content from NewsAPI
  const externalResponse = await fetch(`/api/news?category=${category}`);
  const externalData = await externalResponse.json();
  const externalWithType = externalData.articles.map((article: Article) => ({
    ...article,
    source_type: "external",
  }));
  const combinedData = [...internalWithType, ...externalWithType];
  return combinedData as BlogPost[];
};

export type BlogFormData = {
  title: string;
  author: string;
  imageFile: File | null;
  content: string;
};

export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// UPDATED: SignUp function with name support
export const signUp = async (
  email: string,
  password: string,
  name?: string,
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split("@")[0], // Use name or fallback to email username
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.message);
    return { error: error.message };
  }

  // Optional: Also insert into a custom users table if you have one
  if (data.user && name) {
    try {
      const { error: insertError } = await supabase.from("users").upsert(
        {
          id: data.user.id,
          email: email,
          name: name,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (insertError) {
        console.warn("Could not insert user into users table:", insertError);
      }
    } catch (err) {
      console.warn("Error inserting user into users table:", err);
    }
  }

  return { user: data.user, error: null };
};

// Updated signIn function to return consistent format
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Signin error:", error.message);
    return { error: error.message, user: null };
  }

  return { user: data.user, error: null };
};

export const addBlogPost = async (post: BlogPost) => {
  const { data, error } = await supabase
    .from("blogPosts")
    .insert([post])
    .select();

  if (error) {
    console.error("Error inserting blog post:", error);
    return null;
  }

  return data;
};

export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("blogPosts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data;
};
// This function was mixing internal and external content.
// If you want to keep it for the external content, here's a cleaner version:

export const fetchPagePostsWithExternal = async (
  page = 1,
  pageSize = 3,
  category = "general",
) => {
  // Fetch internal posts
  const { data: internalData, error: internalError } = await supabase
    .from("blogPosts")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (internalError) {
    console.error("Error fetching posts:", internalError);
    return [];
  }

  const internalWithType = (internalData || []).map((post) => ({
    ...post,
    source_type: "internal" as const,
  }));

  // Fetch external content from NewsAPI
  try {
    const externalResponse = await fetch(`/api/news?category=${category}`);
    const externalData = await externalResponse.json();
    const externalWithType = (externalData.articles || []).map(
      (article: any) => ({
        ...article,
        source_type: "external" as const,
        id: article.url || Math.random().toString(), // Ensure each external article has an id
      }),
    );

    return [...internalWithType, ...externalWithType];
  } catch (error) {
    console.error("Error fetching external content:", error);
    return internalWithType;
  }
};
