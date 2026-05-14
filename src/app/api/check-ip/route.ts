import { NextResponse } from 'next/server';

// Helper: Check if an IP address is private/reserved
function isPrivateOrReserved(ip: string): boolean {
  if (!ip) return true;
  const reserved = ['127.', '10.', '192.168.', '0.', '::1', 'localhost'];
  if (reserved.some(r => ip.startsWith(r))) return true;
  // 172.16.0.0 – 172.31.255.255
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ipParam = searchParams.get('ip');

  let ip = ipParam;

  if (!ip) {
    // Try to extract from proxy headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    if (forwardedFor) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    }

    // If we still don't have a valid public IP (e.g. running on localhost),
    // detect the server's real public IP using an external service
    if (!ip || isPrivateOrReserved(ip)) {
      try {
        const publicIpRes = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(5000),
        });
        const publicIpData = await publicIpRes.json();
        ip = publicIpData.ip;
      } catch {
        // Fallback if ipify is unreachable
        ip = '8.8.8.8';
      }
    }
  }

  // Clean up IPv6 mapped IPv4
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      return NextResponse.json({ error: data.message || 'Failed to resolve IP' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('IP fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch IP details' }, { status: 500 });
  }
}
