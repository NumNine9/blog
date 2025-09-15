import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const SUPABASE_SERVICE_ROLE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY; // Not exposed to browser!
export type BlogPost = {
  id: number;
  created_at?: string; // Supabase automatic timestamp
  updated_at?: string; // Supabase automatic timestamp
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  // date: string; // Consider using ISO string format: `${number}-${number}-${number}`
  author: string;
  category: string; // Specific categories if limited
  tags: Array<string>; // Common tags if known
  imageURL: string;
  // Metadata fields
  published?: boolean;
  views?: number;
  // slug?: string;
};
export const fetchPagePosts = async (page = 1, pageSize = 3) => {
  const { data, error } = await supabase
    .from("blogPosts")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  return data as BlogPost[];
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
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup error:", error.message);
    return { error: error.message };
  }

  return { user: data.user };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Signin error:", error.message);
    return { error: error.message };
  }

  return { user: data.user };
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
