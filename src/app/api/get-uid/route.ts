import { NextResponse } from 'next/server';

// Extract username/id from various Facebook URL formats
function extractIdentifier(input: string): string {
  let cleaned = input.trim();
  
  // If it's already a numeric UID, return as-is
  if (/^\d{1,20}$/.test(cleaned)) return cleaned;
  
  // Remove protocol and domain
  cleaned = cleaned.replace(/^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/?/i, '');
  
  // Handle profile.php?id=XXXXX format
  const profileMatch = cleaned.match(/profile\.php\?id=(\d+)/);
  if (profileMatch) return profileMatch[1];
  
  // Handle pages/XXX/XXXXX format
  const pageMatch = cleaned.match(/pages\/[^/]+\/(\d+)/);
  if (pageMatch) return pageMatch[1];
  
  // Remove trailing slash and query params
  cleaned = cleaned.split('?')[0].split('#')[0].replace(/\/$/, '');
  
  // Remove "pg/" prefix if present (old page URLs)
  cleaned = cleaned.replace(/^pg\//, '');

  // Remove people/xxx/ prefix
  cleaned = cleaned.replace(/^people\/[^/]+\//, '');
  
  // Return whatever's left (username or path segment)
  return cleaned || input;
}

// Method 1: Try Facebook's Graph API (most reliable for public profiles)
async function tryGraphApi(identifier: string): Promise<string | null> {
  try {
    // The picture endpoint with redirect=false reveals the UID in the URL
    const res = await fetch(`https://graph.facebook.com/${identifier}/picture?redirect=false&type=large`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    
    // The response URL contains the numeric ID
    // e.g., https://scontent.xx.fbcdn.net/.../NUMERIC_ID/...
    if (data?.data?.url) {
      // Try to extract UID from the CDN URL
      const urlMatch = data.data.url.match(/\/(\d{10,20})[\/_]/);
      if (urlMatch) return urlMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

// Method 2: Try Mobile Facebook (often less strict with blocking)
async function tryMobileFacebook(identifier: string): Promise<string | null> {
  try {
    const url = `https://m.facebook.com/${identifier}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    
    const html = await res.text();
    
    // Patterns to find UID in mobile Facebook HTML
    const patterns = [
      /owner_id=(\d{10,20})/,
      /\"userID\":\"(\d+)\"/,
      /profile_id=(\d{10,20})/,
      /uid=(\d{10,20})/,
      /\"entity_id\":\"(\d+)\"/,
      /content=\"fb:\/\/profile\/(\d+)\"/,
      /data-store=\"[^\"]*?id[&quot;:]+(\d{10,20})/,
      /\"pageID\":\"(\d+)\"/,
      /page_id=(\d{10,20})/,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const results = await Promise.all(
      urls.map(async (urlInput: string) => {
        try {
          const identifier = extractIdentifier(urlInput);
          if (!identifier) return { url: urlInput, status: 'fail' };
          
          // If input is already a numeric UID, just verify and return it
          if (/^\d{1,20}$/.test(identifier)) {
            return { url: urlInput, uid: identifier, status: 'success' };
          }
          
          // Method 1: Graph API
          let uid = await tryGraphApi(identifier);
          if (uid) return { url: urlInput, uid, status: 'success' };
          
          // Method 2: Mobile Facebook scraping
          uid = await tryMobileFacebook(identifier);
          if (uid) return { url: urlInput, uid, status: 'success' };
          
          return { url: urlInput, status: 'fail' };
        } catch {
          return { url: urlInput, status: 'fail' };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Get UID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

