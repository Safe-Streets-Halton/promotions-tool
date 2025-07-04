import { createClient } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {  
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable session detection in URL
  },
});
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY, "supabase service role key");
console.log(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "supabase anon key",
);