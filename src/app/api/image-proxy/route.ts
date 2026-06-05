/* eslint-disable @typescript-eslint/no-explicit-any */
import http from 'http';
import https from 'https';
import { NextRequest, NextResponse } from 'next/server';

// Optional host mapping (keep empty unless needed)
const HOST_MAP: Record<string, string> = {};

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || '';
  if (!url) return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });

  try {
    const parsed = new URL(url);

    // If the host is in the map, rewrite it to the mapped domain (preserve protocol and path)
    const mappedHost = HOST_MAP[parsed.hostname];
    if (mappedHost) {
      parsed.hostname = mappedHost;
      // keep hostname in sync (avoid port issues)
      parsed.host = mappedHost + (parsed.port ? `:${parsed.port}` : '');
    }

    const lib = parsed.protocol === 'https:' ? https : http;

    return await new Promise<Response>((resolve, reject) => {
      const options: any = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        method: 'GET',
        headers: { 'User-Agent': 'Next.js Image Proxy' },
      };

      // In non-production allow fetching resources even if upstream certs are invalid
      if (parsed.protocol === 'https:') {
        options.agent = new https.Agent({ rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false });
      }

      const r = lib.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          const headers: Record<string,string> = {};
          if (res.headers['content-type']) headers['Content-Type'] = String(res.headers['content-type']);
          // forward caching headers lightly
          if (res.headers['cache-control']) headers['Cache-Control'] = String(res.headers['cache-control']);
          if (res.headers['expires']) headers['Expires'] = String(res.headers['expires']);
          resolve(new Response(buf, { status: res.statusCode || 200, headers }));
        });
      });

      r.on('error', (err) => reject(err));
      r.end();
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
