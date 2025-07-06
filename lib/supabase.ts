import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("PUBLIC_SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("PUBLIC_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
