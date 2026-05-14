// ─── jimaro.app/fermat/* → fermat-jimaro.pages.dev/fermat/* ───────
//
// Cloudflare Pages doesn't support subpath custom domains directly, so this
// tiny Worker proxies requests for the /fermat/ subpath of jimaro.app to the
// underlying Pages deployment. Any other path on jimaro.app is left alone.
//
// Deploy:
//   wrangler deploy
// Bind it to the route jimaro.app/fermat* in wrangler.toml.
//
// Notes:
//   - The path is forwarded unchanged because the Vite build already prefixes
//     every asset with /fermat/ (matching base in vite.config.js).
//   - Cache-Control headers from Pages are preserved.
//   - If you ever rename the Pages project, update PAGES_ORIGIN below or set
//     it via `wrangler secret put PAGES_ORIGIN`.

const DEFAULT_PAGES_ORIGIN = 'https://fermat-jimaro.pages.dev';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only handle requests for the /fermat subtree.
    if (!url.pathname.startsWith('/fermat')) {
      return new Response('Not found', { status: 404 });
    }

    // Normalise "/fermat" → "/fermat/" so relative asset URLs resolve.
    if (url.pathname === '/fermat') {
      return Response.redirect(url.origin + '/fermat/' + url.search, 301);
    }

    const origin = (env && env.PAGES_ORIGIN) || DEFAULT_PAGES_ORIGIN;
    const target = new URL(url.pathname + url.search, origin);

    // Forward the request to Pages. Preserve method, headers, and body.
    const upstream = await fetch(target.toString(), {
      method:   request.method,
      headers:  request.headers,
      body:     ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    // Re-emit the response, stripping headers that don't apply on jimaro.app.
    const headers = new Headers(upstream.headers);
    headers.delete('content-security-policy');
    headers.delete('x-frame-options');

    return new Response(upstream.body, {
      status:     upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
};
