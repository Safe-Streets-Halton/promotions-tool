import { FreshContext } from "fresh";
import { supabase } from "../lib/supabase.ts";
import { State } from "../utils.ts";
import {
  shouldSkipAuth,
  extractSessionTokens,
  validateSession,
  createClearSessionCookieHeaders,
} from "../lib/session-utils.ts";

export async function handler(ctx: FreshContext<State>) {
  // Initialize session state
  ctx.state.session = null;
  ctx.state.user = null;
  
  // Skip session validation for static files
  const url = new URL(ctx.req.url);
  if (shouldSkipAuth(url.pathname)) {
    return await ctx.next();
  }
  
  // Extract session tokens from cookies
  const tokens = extractSessionTokens(ctx.req.headers.get("cookie"));
  
  if (tokens) {
    // Validate session using Supabase API
    const validationResult = await validateSession(tokens, supabase);
    
    if (validationResult) {
      // Store session and user info in context state
      ctx.state.session = validationResult.session;
      ctx.state.user = validationResult.user;
      
      // If session was refreshed, update cookies
      if (validationResult.session.access_token !== tokens.access_token) {
        const response = await ctx.next();
        response.headers.append(
          "Set-Cookie", 
          `sb-access-token=${validationResult.session.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${validationResult.session.session.expires_in}`
        );
        return response;
      }
    } else {
      // Clear invalid session cookies
      const response = await ctx.next();
      const clearHeaders = createClearSessionCookieHeaders();
      clearHeaders.forEach(header => {
        response.headers.append("Set-Cookie", header);
      });
      return response;
    }
  }
  
  return await ctx.next();
}