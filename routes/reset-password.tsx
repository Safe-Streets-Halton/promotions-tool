import { FreshContext, page } from "fresh";
import { define } from "../utils.ts";
import { supabase } from "../lib/supabase.ts";
import { State } from "../utils.ts";
import { Button } from "../components/Button.tsx";

interface ResetPasswordPageData {
  error?: string;
  success?: string;
  hasValidToken?: boolean;
}

export const handler = define.handlers<ResetPasswordPageData>({
  GET(ctx: FreshContext<State>) {
    const url = new URL(ctx.req.url);
    const accessToken = url.searchParams.get("access_token");
    const refreshToken = url.searchParams.get("refresh_token");
    
    // Check if we have the required tokens from the email link
    if (!accessToken || !refreshToken) {
      return page({ 
        error: "Invalid or expired reset link. Please request a new password reset.",
        hasValidToken: false 
      });
    }
    
    return page({ hasValidToken: true });
  },
  async POST(ctx: FreshContext) {
    const form = await ctx.req.formData();
    const password = form.get("password")?.toString();
    const confirmPassword = form.get("confirmPassword")?.toString();
    
    const url = new URL(ctx.req.url);
    const accessToken = url.searchParams.get("access_token");
    const refreshToken = url.searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return page({ 
        error: "Invalid or expired reset link. Please request a new password reset.",
        hasValidToken: false 
      });
    }

    if (!password || !confirmPassword) {
      return page({ 
        error: "Both password fields are required",
        hasValidToken: true 
      });
    }

    if (password.length < 6) {
      return page({ 
        error: "Password must be at least 6 characters long",
        hasValidToken: true 
      });
    }    

    if (password !== confirmPassword) {
      return page({ 
        error: "Passwords do not match",
        hasValidToken: true 
      });
    }

    // Set the session using the tokens from the email link
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return page({ 
        error: "Invalid or expired reset link. Please request a new password reset.",
        hasValidToken: false 
      });
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return page({ 
        error: error.message,
        hasValidToken: true 
      });
    }

    return page({ 
      success: "Your password has been successfully updated. You can now sign in with your new password.",
      hasValidToken: true 
    });
  },
});

export default define.page<typeof handler>(
  function ResetPassword({ data }: { data?: ResetPasswordPageData }) {
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
              <p class="text-lg text-green-700 font-medium">Set New Password</p>
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

            {data?.hasValidToken && !data?.success ? (
              <>
                <p class="text-gray-600 mb-6 text-sm">
                  Enter your new password below.
                </p>

                {/* Reset Form */}
                <form method="POST" class="space-y-6">
                  <div class="space-y-4">
                    <div>
                      <label for="password" class="block text-sm font-medium text-gray-700 mb-2 text-left">
                        New Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        placeholder="Confirm new password"
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
                      Update Password
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
                  {data?.success ? "Sign In Now" : "Go to Sign In"}
                </Button>
                
                {!data?.success && (
                  <Button
                    href="/forgot-password"
                    variant="outline"
                    size="md"
                    fullWidth
                  >
                    Request New Reset Link
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
