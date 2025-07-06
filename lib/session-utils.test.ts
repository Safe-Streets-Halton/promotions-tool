import { assertEquals, assertExists } from "@std/assert";
import {
  shouldSkipAuth,
  extractSessionTokens,
  createSessionCookieHeaders,
  createClearSessionCookieHeaders,
} from "./session-utils.ts";

Deno.test("shouldSkipAuth - identifies static resources correctly", () => {
  // Test cases for static resource identification
  const testCases = [
    // Static resources that should skip auth
    { path: "/static/app.js", expected: true, reason: "JavaScript files should skip auth" },
    { path: "/static/css/styles.css", expected: true, reason: "CSS files should skip auth" },
    { path: "/static/images/logo.png", expected: true, reason: "Image files should skip auth" },
    { path: "/_fresh/build.js", expected: true, reason: "Fresh framework files should skip auth" },
    { path: "/_fresh/chunk-abc123.js", expected: true, reason: "Fresh chunks should skip auth" },
    
    // Dynamic resources that should require auth
    { path: "/dashboard", expected: false, reason: "Dashboard should require auth" },
    { path: "/api/users", expected: false, reason: "API endpoints should require auth" },
    { path: "/login", expected: false, reason: "Login page should be processed" },
    { path: "/", expected: false, reason: "Root path should be processed" },
    { path: "/profile/settings", expected: false, reason: "User pages should require auth" },
  ];

  testCases.forEach(({ path, expected, reason }) => {
    const result = shouldSkipAuth(path);
    assertEquals(result, expected, `${path}: ${reason}`);
  });
});

Deno.test("extractSessionTokens - extracts tokens from cookie headers", () => {
  // Test successful token extraction
  const validCookies = "sb-access-token=access123; sb-refresh-token=refresh456; other=value";
  const tokens = extractSessionTokens(validCookies);
  
  assertExists(tokens, "Should extract tokens from valid cookie header");
  assertEquals(tokens.access_token, "access123", "Should extract access token");
  assertEquals(tokens.refresh_token, "refresh456", "Should extract refresh token");
});

Deno.test("extractSessionTokens - handles missing tokens", () => {
  const testCases = [
    { cookies: null, description: "null cookie header" },
    { cookies: "", description: "empty cookie header" },
    { cookies: "other=value; theme=dark", description: "cookies without session tokens" },
    { cookies: "sb-access-token=access123; other=value", description: "missing refresh token" },
    { cookies: "sb-refresh-token=refresh456; other=value", description: "missing access token" },
  ];

  testCases.forEach(({ cookies, description }) => {
    const result = extractSessionTokens(cookies);
    assertEquals(result, null, `Should return null for ${description}`);
  });
});

Deno.test("extractSessionTokens - handles malformed cookies safely", () => {
  const malformedCookies = [
    "sb-access-token=; sb-refresh-token=refresh456",
    "sb-access-token=access123; sb-refresh-token=",
    "malformed=;=invalid;sb-access-token=access123",
    "sb-access-token=access%3D123; sb-refresh-token=refresh%3D456",
  ];

  malformedCookies.forEach(cookies => {
    const result = extractSessionTokens(cookies);
    // Should either return valid tokens or null, but not crash
    if (result) {
      assertEquals(typeof result.access_token, "string", "Access token should be string");
      assertEquals(typeof result.refresh_token, "string", "Refresh token should be string");
    }
  });
});

Deno.test("createSessionCookieHeaders - creates secure cookie headers", () => {
  const accessToken = "secure-access-token-123";
  const refreshToken = "secure-refresh-token-456";
  const expiresIn = 3600;
  
  const headers = createSessionCookieHeaders(accessToken, refreshToken, expiresIn);
  
  assertEquals(headers.length, 2, "Should create headers for both tokens");
  
  // Test access token header
  const accessHeader = headers[0];
  assertEquals(accessHeader.includes(accessToken), true, "Should include access token");
  assertEquals(accessHeader.includes("HttpOnly"), true, "Should include HttpOnly flag");
  assertEquals(accessHeader.includes("Secure"), true, "Should include Secure flag");
  assertEquals(accessHeader.includes("SameSite=Strict"), true, "Should include SameSite flag");
  assertEquals(accessHeader.includes("Path=/"), true, "Should include Path");
  assertEquals(accessHeader.includes(`Max-Age=${expiresIn}`), true, "Should include Max-Age");
  
  // Test refresh token header
  const refreshHeader = headers[1];
  assertEquals(refreshHeader.includes(refreshToken), true, "Should include refresh token");
  assertEquals(refreshHeader.includes("HttpOnly"), true, "Should include HttpOnly flag");
  assertEquals(refreshHeader.includes("Secure"), true, "Should include Secure flag");
  assertEquals(refreshHeader.includes("SameSite=Strict"), true, "Should include SameSite flag");
});

Deno.test("createClearSessionCookieHeaders - creates token clearing headers", () => {
  const clearHeaders = createClearSessionCookieHeaders();
  
  assertEquals(clearHeaders.length, 2, "Should create headers for both tokens");
  
  clearHeaders.forEach((header, index) => {
    const tokenType = index === 0 ? "access" : "refresh";
    
    // Should immediately expire the token
    assertEquals(header.includes("Max-Age=0"), true, `Should expire ${tokenType} token immediately`);
    
    // Should maintain security attributes
    assertEquals(header.includes("HttpOnly"), true, `Should maintain HttpOnly for ${tokenType} token`);
    assertEquals(header.includes("Secure"), true, `Should maintain Secure for ${tokenType} token`);
    assertEquals(header.includes("SameSite=Strict"), true, `Should maintain SameSite for ${tokenType} token`);
    
    // Should clear the token value
    const expectedTokenName = index === 0 ? "sb-access-token=" : "sb-refresh-token=";
    assertEquals(header.startsWith(expectedTokenName), true, `Should clear ${tokenType} token value`);
  });
});

Deno.test("Session Security Integration", async (t) => {
  await t.step("token extraction and header creation maintain security consistency", () => {
    // This tests that the security attributes are consistent across the token lifecycle
    const testTokens = {
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
    };
    
    // Create session cookies
    const sessionHeaders = createSessionCookieHeaders(
      testTokens.access_token,
      testTokens.refresh_token,
      3600
    );
    
    // Verify the security lifecycle
    sessionHeaders.forEach(header => {
      const securityAttributes = ["HttpOnly", "Secure", "SameSite=Strict", "Path=/"];
      securityAttributes.forEach(attr => {
        assertEquals(
          header.includes(attr),
          true,
          `Security attribute ${attr} must be present in session headers`
        );
      });
    });
    
    // Verify clearing maintains security
    const clearHeaders = createClearSessionCookieHeaders();
    clearHeaders.forEach(header => {
      assertEquals(header.includes("Max-Age=0"), true, "Clear headers must expire immediately");
      assertEquals(header.includes("HttpOnly"), true, "Clear headers must maintain HttpOnly");
      assertEquals(header.includes("Secure"), true, "Clear headers must maintain Secure");
    });
  });
  
  await t.step("path filtering prevents unnecessary processing", () => {
    // This tests performance optimization logic
    const performanceTestCases = [
      { path: "/static/bundle.js", expectSkip: true },
      { path: "/_fresh/island.js", expectSkip: true },
      { path: "/api/sensitive-data", expectSkip: false },
      { path: "/dashboard", expectSkip: false },
    ];
    
    performanceTestCases.forEach(({ path, expectSkip }) => {
      const shouldSkip = shouldSkipAuth(path);
      assertEquals(
        shouldSkip,
        expectSkip,
        `Path ${path} should ${expectSkip ? "skip" : "require"} authentication`
      );
    });
  });
});