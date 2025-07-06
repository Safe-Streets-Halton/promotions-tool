import { FreshContext, page } from "fresh";
import { define } from "../utils.ts";
import { supabase } from "../lib/supabase.ts";
import { State } from "../utils.ts";
import { Button } from "../components/Button.tsx";

interface LoginPageData {
  error?: string;
}

export const handler = define.handlers<LoginPageData>({
  GET(ctx: FreshContext<State>) {
    // Check if user is already logged in via middleware
    if (ctx.state.user && ctx.state.session) {
      // User is already logged in, redirect to homepage
      return new Response("", {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }
    
    return page({});
  },
  async POST(ctx: FreshContext) {
    const form = await ctx.req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    if (!email || !password) {
      return new Response("Email and password are required", {
        status: 400,
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(error.message, {
        status: 401,
      });
    }

    // Store session tokens in cookies for server-side persistence
    const headers = new Headers();
    headers.set("Location", "/");
    
    if (data.session) {      
      headers.append("Set-Cookie", `sb-access-token=${data.session.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${data.session.expires_in}`);
      headers.append("Set-Cookie", `sb-refresh-token=${data.session.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}`); // 30 days

      console.log("User logged in:", data.user?.email);
      console.log("Session expires at:", new Date(data.session.expires_at! * 1000));
    }

    // Redirect to home page on successful login
    return new Response("", {
      status: 302,
      headers,
    });
  },
});

export default define.page<typeof handler>(
  function Login({ data }: { data?: LoginPageData }) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full">
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Logo */}
            <img
              class="mx-auto mb-6"
              src="/ssh-icon.svg"
              width="80"
              height="80"
              alt="Safe Streets Halton logo"
            />
            
            {/* Title */}
            <h1 class="text-2xl font-bold text-gray-900 mb-2 tracking-wide">
              SAFE STREETS HALTON
            </h1>
            
            <div class="mb-8">
              <div class="w-12 h-0.5 bg-green-600 mx-auto mb-3"></div>
              <p class="text-lg text-green-700 font-medium">Sign In</p>
            </div>

            {/* Error Message */}
            {data?.error && (
              <div class="rounded-md bg-red-50 p-4 mb-6">
                <div class="text-sm text-red-700">{data.error}</div>
              </div>
            )}

            {/* Login Form */}
            <form method="POST" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Sign In
                </Button>
                
                <Button
                  href="/"
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  Back to Home
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  },
);
