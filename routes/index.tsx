import { FreshContext, page } from "fresh";
import { define, State } from "../utils.ts";
import { Button } from "../components/Button.tsx";

interface PageData {
  isLoggedIn: boolean;
  userEmail?: string;
}

export const handler = define.handlers<PageData>({
  GET(ctx: FreshContext<State>) {
    // If user is already logged in, they can see the main app
    if (ctx.state.user && ctx.state.session) {
      // TODO: Redirect to main dashboard/app when it's implemented
      // For now, show a logged-in welcome message
      return page({ isLoggedIn: true, userEmail: ctx.state.user.email });
    }
    
    // Show public welcome page for non-authenticated users
    return page({ isLoggedIn: false });
  },
});

export default define.page<typeof handler>(function Home({ data }: { data: PageData }) {
  // Get contact email from environment variable
  const contactEmail = Deno.env.get("CONTACT_EMAIL") || "info@safestreetshalton.ca";
  
  if (data.isLoggedIn) {
    return (
      <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div class="px-4 py-8 mx-auto">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-8">
              <img
                class="mx-auto mb-6"
                src="/ssh-icon.svg"
                width="96"
                height="96"
                alt="Safe Streets Halton logo"
              />
              <h1 class="text-4xl font-bold text-gray-900 mb-2">
                Welcome to Safe Streets Halton
              </h1>
              <h2 class="text-2xl text-gray-700 mb-4">Promotions Tool</h2>
              <p class="text-lg text-gray-600 mb-8">
                Hello, {data.userEmail}! You are successfully signed in.
              </p>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-8 text-center">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">
                Application Dashboard Coming Soon
              </h3>
              <p class="text-gray-600 mb-6">
                The main application features are currently under development.
              </p>
              <div class="flex justify-center space-x-4">
                <Button
                  href="/logout"
                  variant="outline"
                  size="md"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <p class="text-lg text-green-700 font-medium">Promotions Tool</p>
          </div>
          
          {/* Buttons */}
          <div class="space-y-4">
            <Button
              href="/login"
              variant="primary"
              size="md"
              fullWidth
            >
              Sign In
            </Button>
            
            <Button
              href={`mailto:${contactEmail}?subject=Access Request - Promotions Tool`}
              variant="secondary"
              size="md"
              fullWidth
            >
              Request Access
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
