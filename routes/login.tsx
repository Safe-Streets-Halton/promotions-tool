import { FreshContext, page } from "fresh";
import { define } from "../utils.ts";
import { supabase } from "../lib/supabase.ts";

interface LoginPageData {
  error?: string;
}

export const handler = define.handlers<LoginPageData>({
  GET(_ctx: FreshContext) {
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
      <main class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h1>
          </div>
          <form class="mt-8 space-y-6" method="POST">
            {data?.error && (
              <div class="rounded-md bg-red-50 p-4">
                <div class="text-sm text-red-700">{data.error}</div>
              </div>
            )}
            <div class="rounded-md shadow-sm -space-y-px">
              <div>
                <label for="email" class="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label for="password" class="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  },
);
