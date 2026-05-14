import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing "url" query parameter' },
      { status: 400 }
    );
  }

  // Basic URL validation
  let validUrl: URL;
  try {
    validUrl = new URL(targetUrl);
    // Only allow http/https
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL provided' },
      { status: 400 }
    );
  }

  // Return an HTML page that does a client-side redirect
  // This is more effective than a server-side 301/302 for bypassing 
  // link preview blockers because crawlers see our domain
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0;url=${validUrl.href}">
  <meta name="robots" content="noindex">
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
    .container { text-align: center; }
    a { color: #60a5fa; }
    .spinner { width: 40px; height: 40px; border: 3px solid #333; border-top-color: #60a5fa; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Redirecting...</p>
    <p><a href="${validUrl.href}">${validUrl.href}</a></p>
  </div>
  <script>window.location.replace("${validUrl.href}");</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
