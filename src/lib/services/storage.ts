// services/storage.ts
import { supabase } from "../supabase";
const BUCKET_NAME = 'blog-images';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${path}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteImage = async (path: string) => {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) console.error('Delete failed:', error);
};