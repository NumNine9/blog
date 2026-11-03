
import { supabaseAdmin } from "@/lib/sponsor/supabase";

/**
 * Verifies the request's Bearer token against Supabase Auth.
 * Returns the authenticated user, or null if the token is missing/invalid.
 *
 * NOTE: for MVP, any authenticated user is treated as admin.
 * Before you invite real sponsors, add a `role` column to a profiles table
 * (or use app_metadata.role) and check it here.
 */
export async function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user;
}