export function parseCookies(cookieHeader: string | null): Map<string, string> {
  const cookieMap = new Map<string, string>();
  
  if (!cookieHeader) return cookieMap;
  
  cookieHeader.split(";").forEach(cookie => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookieMap.set(name, decodeURIComponent(value));
    }
  });
  
  return cookieMap;
}