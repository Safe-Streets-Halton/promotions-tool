import { FreshContext, page } from "fresh";
import { define } from "../utils.ts";
import { supabase } from "../lib/supabase.ts";
import { State } from "../utils.ts";
import { Button } from "../components/Button.tsx";

interface ForgotPasswordPageData {
  error?: string;
  success?: string;
  email?: string;
}

export const handler = define.handlers<ForgotPasswordPageData>({
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

    if (!email) {
      return page({ error: "Email address is required", email });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return page({ error: "Please enter a valid email address", email });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(ctx.req.url).origin}/reset-password`,
    });

    if (error) {
      return page({ error: error.message, email });
    }

    return page({ 
      success: "Password reset instructions have been sent to your email address. Please check your inbox and follow the link to reset your password.",
      email 
    });
  },
});

export default define.page<typeof handler>(
  function ForgotPassword({ data }: { data?: ForgotPasswordPageData }) {
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
              <p class="text-lg text-green-700 font-medium">Reset Password</p>
            </div>

            {/* Success Message */}
            {data?.success && (
              <div class="rounded-md bg-green-50 p-4 mb-6">
                <div class="text-sm text-green-700">{data.success}</div>
              </div>
            )}

            {/* Error Message */}
            {data?.error && (
              <div class="rounded-md bg-red-50 p-4 mb-6">
                <div class="text-sm text-red-700">{data.error}</div>
              </div>
            )}

            {!data?.success ? (
              <>
                <p class="text-gray-600 mb-6 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {/* Reset Form */}
                <form method="POST" class="space-y-6">
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={data?.email || ""}
                      class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div class="space-y-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                    >
                      Send Reset Link
                    </Button>
                    
                    <Button
                      href="/login"
                      variant="outline"
                      size="md"
                      fullWidth
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div class="space-y-4">
                <Button
                  href="/login"
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Back to Sign In
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
            )}
          </div>
        </div>
      </div>
    );
  },
);
