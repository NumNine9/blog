import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error) {
      alert('Error uploading image!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-6 bg-[#fdf6e3] border-2 border-dashed border-[#b58900] rounded-xl shadow-inner font-serif">
        <label
            htmlFor="image-upload"
            className={`cursor-pointer px-6 py-3 border border-[#657b83] rounded-md text-[#586e75] bg-[#eee8d5] hover:bg-[#fdf6e3] hover:text-[#b58900] transition-all duration-300 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {uploading ? 'Uploading...' : 'Upload Image'}
        </label>

        <input
            required={true}
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={uploadImage}
            disabled={uploading}
            className="hidden"
        />
    </div>

  );
}