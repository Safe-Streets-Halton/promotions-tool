import { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { parseCookies } from "./cookie-utils.ts";

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  session: Session;
  user: User;
}

export interface UserData {
  id: string;
  email: string;
}

/**
 * Checks if a URL path should skip authentication (static resources)
 */
export function shouldSkipAuth(pathname: string): boolean {
  return pathname.startsWith("/static/") || pathname.startsWith("/_fresh/");
}

/**
 * Extracts session tokens from cookie header
 */
export function extractSessionTokens(cookieHeader: string | null): SessionTokens | null {
  const cookies = parseCookies(cookieHeader);
  const accessToken = cookies.get("sb-access-token");
  const refreshToken = cookies.get("sb-refresh-token");
  
  if (accessToken && refreshToken) {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  
  return null;
}

/**
 * Validates session tokens with Supabase
 */
export async function validateSession(
  tokens: SessionTokens,
  supabase: SupabaseClient
): Promise<{ session: SessionData; user: UserData } | null> {
  try {
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
    
    if (session && !error && session.user) {
      return {
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at!,
          session: session,
          user: session.user,
        },
        user: {
          id: session.user.id,
          email: session.user.email!,
        },
      };
    }
  } catch (error) {
    console.error("Session validation failed:", error);
  }
  
  return null;
}

/**
 * Creates secure cookie headers for session tokens
 */
export function createSessionCookieHeaders(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): string[] {
  return [
    `sb-access-token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiresIn}`,
    `sb-refresh-token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiresIn}`,
  ];
}

/**
 * Creates cookie headers to clear session tokens
 */
export function createClearSessionCookieHeaders(): string[] {
  return [
    "sb-access-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
    "sb-refresh-token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
  ];
}