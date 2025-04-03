// // pages/api/admin-actions.ts
// import { createClient } from '@supabase/supabase-js';

// export default async function handler() {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
//   const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

//   const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false
//     }
//   });

//   // Only use for admin actions (bypasses RLS!)
//   const { data, error } = await supabase
//     .from('users')
//     .delete()
//     .eq('id', '123');

// //   res.status(200).json({ data });
// }