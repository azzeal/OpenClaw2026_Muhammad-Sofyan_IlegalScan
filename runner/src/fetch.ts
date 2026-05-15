const UA = 'ClearMark-Scanner/0.1 (+OpenClaw)';

export interface FetchResult {
  status: number;
  body: string;
  contentType: string;
  finalUrl: string;
}

export async function httpGet(url: string, timeoutMs = 30000): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5',
        'accept-language': 'id-ID,id;q=0.9,en;q=0.5',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    const ct = res.headers.get('content-type') ?? '';
    const body = ct.includes('application/pdf') || ct.startsWith('image/') ? '' : await res.text();
    return { status: res.status, body, contentType: ct, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}
