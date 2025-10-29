import { getConfig } from '@/config/api';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isAllowedPath(path: string): boolean {
  try {
    const url = new URL('http://local' + path);
    return url.pathname.startsWith('/upload/');
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const enabled = process.env.USE_IMAGE_PROXY === 'true';
  if (!enabled) {
    return new NextResponse('Image proxy disabled', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';

  if (!isAllowedPath(path)) {
    return new NextResponse('Forbidden path', { status: 403 });
  }

  const baseConfig = getConfig();
  if (!baseConfig) {
    return new NextResponse('Config not available', { status: 500 });
  }

  const targetUrl = new URL(path, baseConfig.baseUrl);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Encoding': request.headers.get('accept-encoding') || '',
        'User-Agent': 'kuma-mieru-image-proxy',
      },
      cache: 'no-store',
      
      redirect: 'manual',
    });

    const resHeaders = new Headers();
    const passthroughHeaders = [
      'content-type',
      'content-length',
      'etag',
      'last-modified',
      'cache-control',
      'expires',
    ];
    for (const key of passthroughHeaders) {
      const v = upstream.headers.get(key);
      if (v) resHeaders.set(key, v);
    }

    if (!resHeaders.has('cache-control')) {
      resHeaders.set('Cache-Control', 'public, max-age=60');
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (e) {
    return new NextResponse('Upstream fetch failed', { status: 502 });
  }
}


