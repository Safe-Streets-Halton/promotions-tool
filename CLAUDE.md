# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a Fresh web application (Deno-based React-like framework) called
SSH-Promotions-Tool. It uses:

- Fresh 2.0 (alpha) with Preact as the JSX runtime
- Deno as the runtime
- Tailwind CSS for styling
- TypeScript for type safety
- Supabase for authentication and database
- Cookie-based session management

## Common Commands

Development:

```bash
deno task dev          # Start development server with hot reload
deno task build        # Build for production
deno task start        # Start production server
deno task check        # Run format check, lint, and type check
```

Individual checks:

```bash
deno fmt --check .     # Check formatting
deno lint .            # Run linter
deno check             # Type check
deno test              # Run unit tests
```

## Architecture

- **Routes**: File-based routing in `/routes/` directory
  - `_app.tsx`: Root application wrapper
  - `_middleware.ts`: Global session management middleware
  - `index.tsx`: Home page with Fresh demo content
  - `login.tsx`: Login page with form handling (GET/POST handlers)
  - `api/[name].tsx`: API route example
- **Islands**: Client-side interactive components in `/islands/`
- **Components**: Reusable UI components in `/components/`
- **Static Assets**: CSS, images, etc. in `/static/`
- **State Management**: Uses Preact signals for reactive state
- **Authentication**: Supabase Auth with server-side session management

## Key Files

- `main.ts`: Application setup and route registration
- `dev.ts`: Development server configuration with Tailwind plugin
- `utils.ts`: Shared utilities, Fresh define helper, and State interface
- `lib/supabase.ts`: Supabase client configuration
- `lib/cookie-utils.ts`: Cookie parsing utilities
- `routes/_middleware.ts`: Global session management middleware
- `deno.json`: Project configuration, dependencies, and tasks
- `tailwind.config.ts`: Tailwind CSS configuration

## Session Management Architecture

The application uses a middleware-based approach for session management:

### Global Middleware (`routes/_middleware.ts`)
- **Cookie parsing**: Extracts session tokens from HTTP cookies
- **Session validation**: Uses Supabase API to validate stored tokens
- **Automatic token refresh**: Updates cookies when tokens are refreshed
- **Error handling**: Clears invalid session cookies automatically
- **Path filtering**: Skips validation for static files and Fresh internals

### State Management (`utils.ts`)
- **Unified State interface**: Defines session and user data types globally
- **Type safety**: Ensures consistent typing across all routes

### Session Data Structure
```typescript
interface State {
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
  user?: {
    id: string;
    email: string;
  } | null;
}
```

### Usage in Routes
```typescript
export const handler = define.handlers<PageData>({
  GET(ctx: FreshContext<State>) {
    if (ctx.state.user) {
      // User is authenticated
      const userEmail = ctx.state.user.email;
      const sessionToken = ctx.state.session?.access_token;
    }
  }
});
```

### Cookie Security
- **HttpOnly**: Prevents client-side JavaScript access to session tokens
- **Secure**: Only sent over HTTPS
- **SameSite=Strict**: CSRF protection
- **Proper expiration**: Access tokens expire with session, refresh tokens last 30 days

## Development Notes

- Use `define.page()` for page components and `define.handlers()` for route
  handlers
- Static files are served automatically from the `/static/` directory
- Islands are for client-side interactivity; regular components are
  server-rendered
- Use Test-driven development (TDD) practices with Deno's built-in testing framework
- Access user session data via `ctx.state.user` and `ctx.state.session` in route handlers
- Session validation occurs automatically via middleware on every request