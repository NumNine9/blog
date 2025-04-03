import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY; // Not exposed to browser!
export type BlogPost = {
    title: string;
    author: string;
    category: string;
    imageURL: string;
    tags: string[];
    excerpt: string;
    content: string;
    subtitle: string;
    // created_at?: string; // Optional since Supabase can auto-generate timestamps
  };

export type BlogFormData = {
  title: string;
  author: string;
  imageFile: File | null;
  content: string;
};
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
  const { data, error } = await supabase.from("blogPosts").insert([post]).select();
  
  if (error) {
    console.error("Error inserting blog post:", error);
    return null;
  }

  return data;
};
export const fetchPosts = async () => {
    const { data, error } = await supabase.from("blogPosts").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
    return data;
  };
  