import { FreshContext } from "fresh";
import { supabase } from "../lib/supabase.ts";
import { State } from "../utils.ts";
import { parseCookies } from "../lib/cookie-utils.ts";

export async function handler(ctx: FreshContext<State>) {
  // Initialize session state
  ctx.state.session = null;
  ctx.state.user = null;
  
  // Skip session validation for static files
  const url = new URL(ctx.req.url);
  if (url.pathname.startsWith("/static/") || url.pathname.startsWith("/_fresh/")) {
    return await ctx.next();
  }
  
  // Parse cookies from request
  const cookies = parseCookies(ctx.req.headers.get("cookie"));
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");
  
  if (accessToken && refreshToken) {
    try {
      // Validate session using Supabase API
      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (session && !error) {
        // Store session and user info in context state
        ctx.state.session = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at!,  
          session: session,
          user: session.user        
        };
        
        if (session.user) {
          ctx.state.user = {
            id: session.user.id,
            email: session.user.email!,
          };
        }
        
        // If session was refreshed, update cookies
        if (session.access_token !== accessToken) {
          const response = await ctx.next();
          response.headers.append("Set-Cookie", `sb-access-token=${session.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${session.expires_in}`);
          return response;
        }
      }
    } catch (error) {
      // Clear invalid session cookies
      console.error("Session validation failed:", error);
      const response = await ctx.next();
      response.headers.append("Set-Cookie", "sb-access-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
      response.headers.append("Set-Cookie", "sb-refresh-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
      return response;
    }
  }
  
  return await ctx.next();
}