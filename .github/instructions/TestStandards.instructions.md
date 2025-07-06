# Test-Driven Development (TDD) Standards

This document outlines the best practices for Test-Driven Development in the SSH-Promotions-Tool project.

## TDD Philosophy

Test-Driven Development follows the Red-Green-Refactor cycle:

1. **Red**: Write a failing test that describes the desired functionality
2. **Green**: Write the minimal code necessary to make the test pass
3. **Refactor**: Improve the code while keeping tests passing

## Project-Specific Guidelines

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

// Import functions from utility modules, not implementation modules
import { parseCookies } from "../lib/cookie-utils.ts";
// NOT: import { parseCookies } from "./_middleware.ts";
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
- **Dependencies**: Mock external dependencies
- **Example**: Cookie parsing, utility functions, pure components

```typescript
Deno.test("parseCookies - handles empty cookie header", () => {
  const result = parseCookies(null);
  assertEquals(result.size, 0);
});
```

#### 2. Integration Tests
- **Purpose**: Test interaction between components
- **Scope**: Multiple components working together
- **Dependencies**: Use real implementations where practical
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

#### Mocking Patterns
```typescript
// Create utility modules for testable functions
// lib/cookie-utils.ts - testable without dependencies
export function parseCookies(cookieHeader: string | null): Map<string, string> {
  // Pure function - easy to test
}

// Use dependency injection for complex dependencies
export function createSessionValidator(supabaseClient: SupabaseClient) {
  return async function validateSession(tokens: SessionTokens) {
    // Testable by injecting mock client
  };
}
```

### Test Data Management

#### Test Data Principles
- **Minimal**: Use the smallest data set that exercises the functionality
- **Realistic**: Use data that resembles production scenarios
- **Isolated**: Each test should have its own data to avoid interdependencies

#### Example Test Data
```typescript
const mockSessionTokens = {
  access_token: "mock-access-token-12345",
  refresh_token: "mock-refresh-token-67890",
  expires_at: Date.now() + 3600000, // 1 hour from now
};

const mockUser = {
  id: "user-123",
  email: "test@example.com",
};
```

### Error Testing

#### Test Error Conditions
- Invalid inputs
- Network failures
- Authentication failures
- Edge cases and boundary conditions

```typescript
Deno.test("parseCookies - handles malformed cookie strings", () => {
  const result = parseCookies("invalid=;=value;name");
  // Should gracefully handle malformed cookies
  assertEquals(result.get("invalid"), undefined);
});
```

### Performance Testing

#### When to Include Performance Tests
- Critical path functions (authentication, session management)
- Functions that process large data sets
- API endpoints with performance requirements

```typescript
Deno.test("parseCookies - performance with large cookie strings", () => {
  const largeCookieString = "cookie1=value1;" + "cookie2=value2;".repeat(1000);
  
  const start = Date.now();
  const result = parseCookies(largeCookieString);
  const duration = Date.now() - start;
  
  assertEquals(result.size, 1001);
  assert(duration < 100, `Parsing took too long: ${duration}ms`);
});
```

### Continuous Integration

#### Test Execution
- Tests must pass before code can be merged
- Use `deno task check` to run full validation suite
- Include test coverage in CI pipeline

#### Test Commands
```bash
# Run all tests
deno test

# Run tests with coverage
deno test --coverage

# Run specific test file
deno test routes/_middleware.test.ts

# Run tests with environment access (when needed)
deno test --allow-env
```

### Best Practices Summary

1. **Write tests first**: Follow the Red-Green-Refactor cycle
2. **Test one thing**: Each test should verify a single behavior
3. **Use descriptive names**: Test names should clearly describe what is being tested
4. **Keep tests simple**: Tests should be easier to understand than the code they test
5. **Avoid test interdependencies**: Each test should be able to run independently
6. **Mock external dependencies**: Keep tests fast and reliable
7. **Test edge cases**: Include boundary conditions and error scenarios
8. **Refactor tests**: Keep test code clean and maintainable
9. **Use type safety**: Leverage TypeScript in tests for better reliability
10. **Document complex test scenarios**: Add comments for non-obvious test logic

### Common Anti-Patterns to Avoid

- **Testing implementation details**: Test behavior, not internal structure
- **Overly complex tests**: If a test is hard to understand, simplify it
- **Testing multiple things**: One assertion per test when possible
- **Ignoring test failures**: All tests should pass before merging
- **Mocking everything**: Use real implementations for simple dependencies
- **No negative testing**: Always test error conditions and edge cases
- **Duplicate test logic**: Extract common test utilities to reduce duplication

### Resources

- [Deno Testing Documentation](https://docs.deno.com/runtime/manual/basics/testing)
- [Fresh Testing Guide](https://fresh.deno.dev/docs/concepts/testing)
- [TDD Best Practices](https://martinfowler.com/bliki/TestDrivenDevelopment.html)