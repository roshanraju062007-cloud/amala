const BACKEND_URL = (process.env.BACKEND_URL || process.env.API_BASE_URL || '').replace(/\/+$/, '');

function buildTargetUrl(req) {
  const rawPath = Array.isArray(req.query?.path) ? req.query.path.join('/') : (req.query?.path || '');
  const parsed = new URL(req.url, 'http://localhost');
  return `${BACKEND_URL}/api/${rawPath}${parsed.search}`;
}

module.exports = async function handler(req, res) {
  if (!BACKEND_URL) {
    res.status(503).json({
      success: false,
      message: 'Backend proxy is not configured. Set BACKEND_URL in Vercel environment variables.',
    });
    return;
  }

  const target = buildTargetUrl(req);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value) continue;
    const lower = key.toLowerCase();
    if (['host', 'connection', 'content-length'].includes(lower)) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }

  const fetchOptions = {
    method: req.method,
    headers,
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  }

  const upstream = await fetch(target, fetchOptions);

  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (['content-encoding', 'transfer-encoding', 'content-length'].includes(lower)) return;
    res.setHeader(key, value);
  });

  const contentType = upstream.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const text = await upstream.text();
    res.send(text);
    return;
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.send(buffer);
};
