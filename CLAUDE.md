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
```

## Architecture

- **Routes**: File-based routing in `/routes/` directory
  - `_app.tsx`: Root application wrapper
  - `index.tsx`: Home page with Fresh demo content
  - `login.tsx`: Login page with form handling (GET/POST handlers)
  - `api/[name].tsx`: API route example
- **Islands**: Client-side interactive components in `/islands/`
- **Components**: Reusable UI components in `/components/`
- **Static Assets**: CSS, images, etc. in `/static/`
- **State Management**: Uses Preact signals for reactive state

## Key Files

- `main.ts`: Application setup and route registration
- `dev.ts`: Development server configuration with Tailwind plugin
- `utils.ts`: Shared utilities and Fresh define helper
- `deno.json`: Project configuration, dependencies, and tasks
- `tailwind.config.ts`: Tailwind CSS configuration

## Development Notes

- Use `define.page()` for page components and `define.handlers()` for route
  handlers
- Static files are served automatically from the `/static/` directory
- Islands are for client-side interactivity; regular components are
  server-rendered
- Use Test-driven development (TDD) practices with Deno's built-in testing framework