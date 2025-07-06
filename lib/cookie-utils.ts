export function parseCookies(cookieHeader: string | null): Map<string, string> {
  const cookieMap = new Map<string, string>();
  
  if (!cookieHeader) return cookieMap;
  
  cookieHeader.split(";").forEach(cookie => {
    const trimmed = cookie.trim();
    const firstEquals = trimmed.indexOf("=");
    
    if (firstEquals > 0) {
      const name = trimmed.substring(0, firstEquals);
      const value = trimmed.substring(firstEquals + 1);
      
      if (name && value) {
        cookieMap.set(name, decodeURIComponent(value));
      }
    }
  });
  
  return cookieMap;
}