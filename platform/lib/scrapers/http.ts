const POOL = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
];

function ua(): string {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

export interface FetchOpts {
  timeoutMs?: number;
  headers?: Record<string, string>;
  referer?: string;
}

export interface FetchResult {
  status: number;
  body: string;
  contentType: string;
  finalUrl: string;
  bytes?: Buffer;
}

export async function httpGet(url: string, opts: FetchOpts = {}): Promise<FetchResult> {
  const { timeoutMs = 12000, headers = {}, referer } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': ua(),
        accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5',
        'accept-language': 'id-ID,id;q=0.9,en;q=0.5',
        ...(referer ? { referer } : {}),
        ...headers,
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    const ct = res.headers.get('content-type') ?? '';
    const body = ct.startsWith('image/') || ct.includes('octet-stream') ? '' : await res.text();
    return { status: res.status, body, contentType: ct, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

export async function httpGetBytes(url: string, timeoutMs = 12000): Promise<Buffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'user-agent': ua() }, signal: controller.signal });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const BLOCK_SIGNALS = [
  'just a moment',
  'cf-challenge',
  'attention required',
  'cloudflare',
  'detected unusual traffic',
  'captcha',
  'access denied',
];

export function detectBlock(body: string, status: number): string | null {
  if (status === 403) return `http_403`;
  if (status === 429) return `http_429`;
  if (status === 503) return `http_503`;
  const low = body.slice(0, 2000).toLowerCase();
  for (const sig of BLOCK_SIGNALS) {
    if (low.includes(sig)) return `signal:${sig}`;
  }
  return null;
}
