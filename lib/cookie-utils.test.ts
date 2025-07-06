import { assertEquals, assert } from "@std/assert";
import { parseCookies } from "./cookie-utils.ts";

// Cookie Parsing Utility Tests
// Following TDD standards - each test verifies one specific behavior

Deno.test("parseCookies - returns empty map for null input", () => {
  // Arrange
  const cookieHeader = null;
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 0);
});

Deno.test("parseCookies - returns empty map for empty string", () => {
  // Arrange
  const cookieHeader = "";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 0);
});

Deno.test("parseCookies - parses single cookie correctly", () => {
  // Arrange
  const cookieHeader = "sb-access-token=token123";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 1);
  assertEquals(result.get("sb-access-token"), "token123");
});

Deno.test("parseCookies - parses multiple cookies correctly", () => {
  // Arrange
  const cookieHeader = "sb-access-token=token123; sb-refresh-token=refresh456; other=value";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 3);
  assertEquals(result.get("sb-access-token"), "token123");
  assertEquals(result.get("sb-refresh-token"), "refresh456");
  assertEquals(result.get("other"), "value");
});

Deno.test("parseCookies - decodes URL-encoded values correctly", () => {
  // Arrange
  const cookieHeader = "encoded=hello%20world";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 1);
  assertEquals(result.get("encoded"), "hello world");
});

Deno.test("parseCookies - handles cookies with extra whitespace", () => {
  // Arrange
  const cookieHeader = " cookie1=value1 ; cookie2=value2 ; cookie3=value3 ";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 3);
  assertEquals(result.get("cookie1"), "value1");
  assertEquals(result.get("cookie2"), "value2");
  assertEquals(result.get("cookie3"), "value3");
});

Deno.test("parseCookies - ignores malformed cookie entries", () => {
  // Arrange - malformed cookies without values or names
  const cookieHeader = "valid=value; invalid=; =noname; malformed";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 1);
  assertEquals(result.get("valid"), "value");
});

Deno.test("parseCookies - handles complex URL-encoded values", () => {
  // Arrange
  const cookieHeader = "complex=hello%20world%21%40%23%24%25";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 1);
  assertEquals(result.get("complex"), "hello world!@#$%");
});

Deno.test("parseCookies - performance with large cookie strings", () => {
  // Arrange
  const largeCookieString = Array.from({ length: 100 }, (_, i) => `cookie${i}=value${i}`).join("; ");
  
  // Act
  const start = Date.now();
  const result = parseCookies(largeCookieString);
  const duration = Date.now() - start;
  
  // Assert
  assertEquals(result.size, 100);
  assert(duration < 100, `Parsing took too long: ${duration}ms`);
});

Deno.test("parseCookies - handles cookies with equals signs in values", () => {
  // Arrange
  const cookieHeader = "complex=value=with=equals";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 1);
  assertEquals(result.get("complex"), "value=with=equals");
});

Deno.test("parseCookies - handles semicolons in URL-encoded values", () => {
  // Arrange
  const cookieHeader = "encoded=value%3Bwith%3Bsemicolons";
  
  // Act
  const result = parseCookies(cookieHeader);
  
  // Assert
  assertEquals(result.size, 1);
  assertEquals(result.get("encoded"), "value;with;semicolons");
});