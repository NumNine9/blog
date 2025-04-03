// app/api/posts/route.ts
import { supabaseServer } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const postData = await request.json();

  // Admin-only operation (bypasses RLS)
  const { data, error } = await supabaseServer
    .from('blogPosts')
    .insert(postData)
    .select();

  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 201,
  });
}