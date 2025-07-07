import { FreshContext } from "fresh";
import { define } from "../utils.ts";
import { supabase } from "../lib/supabase.ts";

export const handler = define.handlers({
  async GET(_ctx: FreshContext) {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear the session cookies
    const headers = new Headers();
    headers.set("Location", "/");
    
    // Clear both cookies by setting them to expire in the past
    headers.append("Set-Cookie", "sb-access-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
    headers.append("Set-Cookie", "sb-refresh-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");

    // Redirect to home page
    return new Response("", {
      status: 302,
      headers,
    });
  },
});
