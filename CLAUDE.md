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
- `lib/session-utils.ts`: Modular session management utilities
- `routes/_middleware.ts`: Global session management middleware
- `deno.json`: Project configuration, dependencies, and tasks
- `tailwind.config.ts`: Tailwind CSS configuration

## Session Management Architecture

The application uses a modular, middleware-based approach for session management:

### Session Utilities (`lib/session-utils.ts`)
- **Modular design**: Separates business logic from framework-specific code
- **Path filtering**: `shouldSkipAuth()` - Identifies static resources to skip authentication
- **Token extraction**: `extractSessionTokens()` - Safely extracts tokens from cookie headers
- **Session validation**: `validateSession()` - Validates tokens with Supabase API
- **Cookie management**: `createSessionCookieHeaders()` and `createClearSessionCookieHeaders()` - Secure cookie creation and clearing
- **Comprehensive testing**: All functions are independently testable without external dependencies

### Global Middleware (`routes/_middleware.ts`)
- **Orchestration**: Uses session utilities to handle authentication flow
- **State management**: Populates `ctx.state.session` and `ctx.state.user` 
- **Automatic token refresh**: Updates cookies when tokens are refreshed
- **Error handling**: Clears invalid session cookies automatically
- **Performance optimization**: Skips validation for static files and Fresh internals

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
- Follow TDD standards outlined in `.github/instructions/TestStandards.instructions.md`
- Access user session data via `ctx.state.user` and `ctx.state.session` in route handlers
- Session validation occurs automatically via middleware on every request

## Modular Architecture Benefits

The project follows a modular approach for testability and maintainability:

- **Separation of concerns**: Business logic is extracted into utility modules
- **Independent testing**: Each function can be tested without external dependencies
- **Reusability**: Utility functions can be imported and used across the application
- **Maintainability**: Changes to business logic don't require middleware modifications
- **Type safety**: All modules use TypeScript interfaces for consistent data structures
- **Testability**: Both individual functions and integrated handler logic can be thoroughly tested

## Testing Standards and Best Practices

### TDD Philosophy

Test-Driven Development follows the Red-Green-Refactor cycle:

1. **Red**: Write a failing test that describes the desired functionality
2. **Green**: Write the minimal code necessary to make the test pass
3. **Refactor**: Improve the code while keeping tests passing

### Key Testing Principles

- Write tests first (Red-Green-Refactor cycle)
- Use `@std/assert` and `@std/testing/mock` imports from deno.json configuration
- **Modular testing**: Extract business logic into separate utility modules for independent testing
- **Direct imports**: Test actual utility functions rather than copying implementation logic
- **Test actual implementations**: Mock external dependencies but test the real handler function logic
- **Comprehensive mocking**: Create realistic mocks that cover multiple scenarios (success, failure, edge cases)
- Use descriptive test names that clearly indicate what is being tested
- **Meaningful tests**: Focus on testing business logic, security requirements, and edge cases rather than trivial implementations
- **Integration verification**: Ensure utility functions work correctly when integrated in the actual handler

### Test File Organization

- **Test file naming**: Use `.test.ts` suffix (e.g., `middleware.test.ts`)
- **Test location**: Place tests adjacent to the code they test when possible
- **Utility tests**: Place shared utility tests in dedicated test files
- **Integration tests**: Use descriptive names that indicate the scope of testing

### Deno Testing Standards

#### Import Standards
```typescript
// Use project-configured imports from deno.json
import { assertEquals, assertExists, assertThrows } from "@std/assert";
import { spy, stub, restore } from "@std/testing/mock";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";

// Import functions from utility modules, not implementation modules
import { parseCookies } from "../lib/cookie-utils.ts";
```

#### Test Structure
```typescript
Deno.test("Component - specific functionality being tested", () => {
  // Arrange: Set up test data and conditions
  const input = "test data";
  
  // Act: Execute the function being tested
  const result = functionUnderTest(input);
  
  // Assert: Verify the expected outcome
  assertEquals(result, expectedValue);
});
```

### Test Categories

#### 1. Unit Tests
- **Purpose**: Test individual functions and components in isolation
- **Scope**: Single function, method, or component
- **Dependencies**: Mock external dependencies using `@std/testing/mock`
- **Example**: Cookie parsing, utility functions, pure components

#### 2. Integration Tests
- **Purpose**: Test interaction between components
- **Scope**: Multiple components working together
- **Dependencies**: Use real implementations where practical, spy on function calls
- **Example**: Middleware integration, route handlers with state

#### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Scope**: Full application features
- **Dependencies**: Real services (with test environments)
- **Example**: Login flow, session management

### Mocking and Test Isolation

#### When to Mock
- External APIs and services (Supabase, third-party APIs)
- File system operations
- Network requests
- Complex dependencies that would make tests slow or flaky

#### When NOT to Mock
- Simple utility functions
- Internal application logic
- Pure functions without side effects

#### Mocking Patterns with @std/testing
```typescript
// Spy on function calls
const validateSessionSpy = spy(sessionUtils, "validateSession");

// Stub function behavior
const validateSessionStub = stub(sessionUtils, "validateSession", () => 
  Promise.resolve({ session: mockSession, user: mockUser })
);

// Clean up after tests
restore();
```

### Meaningful Testing Standards

#### What Makes a Test Meaningful

A meaningful test provides **value** by testing actual functionality, business logic, or critical paths rather than trivial implementation details.

#### Test Critical Paths and Business Logic
- **DO**: Test user authentication flow, data validation, error handling
- **DON'T**: Test that a variable assignment worked (`let x = 3; assertEquals(x, 3)`)

#### Enable Safe Refactoring
- **DO**: Test public interfaces and expected behaviors
- **DON'T**: Test internal implementation details that may change

#### Catch Real Bugs
- **DO**: Test edge cases, boundary conditions, and error scenarios
- **DON'T**: Test framework functionality or language features

#### Serve as Documentation
- **DO**: Write tests that clearly show how the code should be used
- **DON'T**: Write tests that require extensive comments to understand

### When NOT to Write Tests

#### Avoid Testing Trivial Code
- **Simple getters/setters**: `get name() { return this.name; }`
- **Basic assignments**: `this.value = input;`
- **Framework functionality**: Testing that a library works as documented
- **One-line delegates**: Methods that just call another method

### Test Quality Metrics

#### 1. Test Effectiveness
- **Formula**: (Defects Detected by Tests / Total Defects) × 100
- **Goal**: High-quality tests that catch real issues

#### 2. Meaningful Coverage
- **Focus**: Critical paths, edge cases, business logic
- **Avoid**: High percentage coverage of trivial code

#### 3. Test Maintenance Ratio
- **Measure**: Time spent maintaining tests vs. value provided
- **Goal**: Tests that provide lasting value with minimal maintenance

### Behaviour-Driven Development (BDD) Best Practices

#### BDD Philosophy

BDD extends TDD by focusing on the behavior of the system from the user's perspective, using natural language descriptions that bridge the gap between technical and business stakeholders. As defined in the [Deno BDD tutorial](https://docs.deno.com/examples/bdd_tutorial/): "BDD focuses on defining the behavior of an application through examples written in a natural, ubiquitous language."

#### Deno BDD Module

Deno provides a standard BDD module at `@std/testing/bdd` with familiar describe/it syntax:

```typescript
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { assertEquals, assertExists } from "@std/assert";

describe("User Authentication", () => {
  beforeEach(() => {
    // Setup test context before each test
  });

  afterEach(() => {
    // Clean up after each test
  });

  it("should authenticate valid user with complete session tokens", async () => {
    // Test implementation
  });
});
```

#### BDD vs Traditional Deno.test

Choose BDD style when:
- Tests describe user behaviors and business rules
- You need hierarchical test organization
- Multiple stakeholders review test specifications
- Tests serve as living documentation

Choose traditional `Deno.test` when:
- Testing utility functions or technical components
- Simple, isolated unit tests
- Performance-critical test suites

#### Given-When-Then Pattern

Structure test content using the Given-When-Then pattern for clarity:

```typescript
describe("Session Management", () => {
  it("should authenticate valid user with complete session tokens", async () => {
    // Given: A user with valid session tokens
    const validTokens = {
      access_token: "valid-access-token",
      refresh_token: "valid-refresh-token"
    };
    const mockContext = createMockContext("http://localhost/dashboard", 
      "sb-access-token=valid-access-token; sb-refresh-token=valid-refresh-token");
    
    // When: The middleware processes the request
    const response = await middlewareHandler(mockContext);
    
    // Then: The user should be authenticated and session should be set
    assertExists(mockContext.state.session, "Session should be set for valid tokens");
    assertExists(mockContext.state.user, "User should be set for valid tokens");
    assertEquals(response.status, 200, "Should continue to protected resource");
  });
});
```

#### BDD Test Organization

##### Feature-Based Grouping
```typescript
Deno.test("Feature: User Session Management", async (t) => {
  await t.step("Scenario: Valid user accesses protected resource", async () => {
    // Given-When-Then implementation
  });
  
  await t.step("Scenario: Invalid user is denied access", async () => {
    // Given-When-Then implementation
  });
  
  await t.step("Scenario: Session expires during request", async () => {
    // Given-When-Then implementation
  });
});
```

##### User Story Mapping
```typescript
Deno.test("As a logged-in user, I want my session to persist across requests", async (t) => {
  await t.step("Given I have a valid session", async () => {
    // Setup valid session state
  });
  
  await t.step("When I make multiple requests", async () => {
    // Execute multiple middleware calls
  });
  
  await t.step("Then my session should remain valid", async () => {
    // Verify session persistence
  });
});
```

#### BDD Best Practices

##### 1. Use Business Language
- Write test descriptions that non-technical stakeholders can understand
- Focus on user goals and system behaviors rather than implementation details
- Use domain-specific terminology consistently

##### 2. Scenario Coverage
- **Happy Path**: Normal user flows and expected behaviors
- **Edge Cases**: Boundary conditions and unusual but valid scenarios
- **Error Paths**: Invalid inputs, system failures, and error handling
- **Security Scenarios**: Authentication failures, authorization checks, injection attempts

##### 3. Behavioral Assertions
```typescript
// Focus on observable behaviors
assertEquals(response.status, 302, "Should redirect unauthenticated user");
assertEquals(response.headers.get("Location"), "/login", "Should redirect to login page");

// Rather than internal state
// assertEquals(middleware.authChecked, true); // Internal implementation detail
```

##### 4. Test Data as Examples
```typescript
const userScenarios = [
  {
    description: "Premium user with valid subscription",
    user: { id: "1", role: "premium", subscriptionActive: true },
    expectedAccess: true
  },
  {
    description: "Free user accessing premium feature",
    user: { id: "2", role: "free", subscriptionActive: false },
    expectedAccess: false
  }
];

userScenarios.forEach(({ description, user, expectedAccess }) => {
  Deno.test(`Access control: ${description}`, async () => {
    // Test implementation using the example data
  });
});
```

##### 5. Living Documentation
- Keep test descriptions current with feature changes
- Use tests as specification documentation for new developers
- Ensure test names describe the business value being tested

#### BDD Anti-Patterns to Avoid

- **Technical jargon in scenarios**: Avoid implementation details in test descriptions
- **Testing multiple behaviors**: One scenario should test one specific behavior
- **Imperative test structure**: Use declarative Given-When-Then rather than procedural steps
- **Ignoring the "Why"**: Always include the business reason for the behavior being tested

### Common Testing Anti-Patterns to Avoid

- **Testing implementation details**: Test behavior, not internal structure
- **Overly complex tests**: If a test is hard to understand, simplify it
- **Testing multiple things**: One assertion per test when possible
- **Ignoring test failures**: All tests should pass before merging
- **Mocking everything**: Use real implementations for simple dependencies
- **No negative testing**: Always test error conditions and edge cases
- **Duplicate test logic**: Extract common test utilities to reduce duplication
- **Trivial testing**: Don't test assignments, getters, or framework functionality
- **Testing for coverage numbers**: Focus on meaningful coverage, not percentages

### Test Commands

```bash
# Run all tests
deno test

# Run tests with coverage
deno test --coverage

# Run specific test file
deno test routes/_middleware.test.ts

# Run tests with environment access (when needed)
deno test --allow-env

# Run tests with type checking disabled (for development)
deno test --no-check
```

## Testing Architecture

The project uses a layered testing approach:

### Unit Tests (`lib/*.test.ts`)
- **Cookie utilities**: Test cookie parsing, security, and edge cases
- **Session utilities**: Test authentication logic, token extraction, and security requirements
- **Independent testing**: Each utility function is tested without external dependencies

### Integration Tests (`routes/*.test.ts`)
- **Middleware handler testing**: Test the actual middleware handler function with mocked dependencies
- **Complete request/response cycles**: Verify full authentication flow including state management
- **Edge case handling**: Test error conditions, malformed input, and security scenarios
- **Mock strategy**: Use realistic Supabase client mocks to test actual handler logic without external dependencies

### Comprehensive Handler Testing Strategy

The project implements a sophisticated approach to testing the actual middleware handler:

#### Mock Implementation Approach
- **Realistic Supabase mocks**: Create mock clients that simulate different authentication scenarios
- **Scenario coverage**: Valid sessions, token refresh, invalid tokens, API errors, network failures
- **Handler recreation**: Recreate the exact handler logic in tests to avoid import dependency issues
- **Integration validation**: Verify that utility functions integrate correctly within the handler flow

#### Test Coverage Areas
1. **Path filtering logic**: Static resource identification and authentication skipping
2. **Session token processing**: Valid token handling and state population
3. **Token refresh scenarios**: Automatic token refresh and cookie updating
4. **Error handling**: Invalid tokens, API failures, malformed cookies
5. **Security verification**: Cookie attributes, session clearing, partial token rejection
6. **Integration workflows**: End-to-end utility function coordination

#### Testing Benefits
- **Actual logic testing**: Tests the real handler function, not simplified approximations
- **Dependency isolation**: Mocks external services while testing internal logic
- **Comprehensive coverage**: All code paths including error conditions are verified
- **Security validation**: Ensures security requirements are met in practice
- **Regression prevention**: Changes to handler logic are immediately caught by tests