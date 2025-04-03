// services/blogPosts.ts
import { supabase } from "../supabase";
import type { BlogPost } from '../supabase';

export const createBlogPost = async (postData: BlogPost) => {
  const { data, error } = await supabase
    .from('blogPosts')
    .insert(postData)
    .select()
    .single(); // Returns the inserted record

  if (error) {
    throw new Error(`Insert failed: ${error.message}`);
  }

  return data as BlogPost;
};