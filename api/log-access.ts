/// <reference types="node" />
export const config = { runtime: 'edge' };

function parseUA(ua: string) {
  const device = /Mobile|Android|iPhone|iPad/i.test(ua)
    ? /iPad|Tablet/i.test(ua) ? 'タブレット' : 'スマートフォン'
    : 'PC';

  const os = /Windows NT/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'Mac'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS'
    : 'その他';

  const browser = /Edg\//.test(ua) ? 'Edge'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari'
    : 'その他';

  return { device, os, browser };
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const gasUrl = process.env.GAS_LOG_URL;
  if (!gasUrl) {
    return new Response('ok', { status: 200 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const ua = req.headers.get('user-agent') ?? '';
  const { device, os, browser } = parseUA(ua);

  // JST に変換
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const timestamp = jst.toISOString().replace('T', ' ').substring(0, 19);

  try {
    await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, ip, device, os, browser }),
    });
  } catch {
    // アプリの動作に影響させない
  }

  return new Response('ok', { status: 200 });
}
