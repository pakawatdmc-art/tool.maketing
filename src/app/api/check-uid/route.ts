import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { uids } = await request.json();
    
    if (!Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Process chunk of UIDs
    const results = await Promise.all(
      uids.map(async (uid: string) => {
        try {
          const res = await fetch(`https://graph.facebook.com/${uid}/picture?redirect=false`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            },
            // short timeout
            signal: AbortSignal.timeout(5000)
          });
          
          if (!res.ok) {
             return { uid, status: 'die' };
          }

          const data = await res.json();
          
          // If graph API returns data object without error, consider it live
          // Disabled accounts usually return 400 Bad Request or an error object
          if (data && data.data && !data.error) {
             return { uid, status: 'live' };
          }
          
          return { uid, status: 'die' };
        } catch {
          return { uid, status: 'die' };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Check UID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
