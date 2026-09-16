const COOLDOWN_COOKIE = 'elemendle_feedback_cooldown'
const COOLDOWN_SECONDS = 600
const MAX_BODY_BYTES = 8192

function reply(status: number, error: string) {
  return Response.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function readPayload(request: Request): Promise<unknown> {
  if (!request.body) throw new Error('missing_body')
  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel()
        throw new Error('body_too_large')
      }
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally {
    reader.releaseLock()
  }
}

// Kept independent of Next.js so the same request handling is tested in workerd.
export async function handleFeedback(request: Request, webhookUrl?: string) {
  const origin = new URL(request.url).origin
  if (request.headers.get('origin') !== origin) return reply(403, 'forbidden')
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return reply(415, 'invalid_content_type')
  }
  const cookies = request.headers.get('cookie')?.split(';').map(cookie => cookie.trim()) ?? []
  if (cookies.includes(`${COOLDOWN_COOKIE}=1`)) {
    return Response.json({ error: 'rate_limited' }, {
      status: 429,
      headers: { 'Retry-After': String(COOLDOWN_SECONDS), 'Cache-Control': 'no-store' }
    })
  }

  let payload: unknown
  try {
    payload = await readPayload(request)
  } catch {
    return reply(400, 'invalid_message')
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return reply(400, 'invalid_message')
  const fields = payload as Record<string, unknown>
  const message = typeof fields.message === 'string'
    ? fields.message.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
    : ''
  if (message.length < 10 || message.length > 1000 || fields.website ||
      (message.match(/https?:\/\/|www\./gi)?.length ?? 0) > 1 || /(.)\1{24,}/.test(message)) {
    return reply(400, 'invalid_message')
  }
  // Only a local pathname is forwarded; never forward query strings or fragments.
  let page = '/'
  if (typeof fields.page === 'string' && fields.page.startsWith('/') && !fields.page.startsWith('//')) {
    try {
      const parsed = new URL(fields.page, origin)
      if (parsed.origin === origin) page = parsed.pathname.slice(0, 300)
    } catch {
      return reply(400, 'invalid_message')
    }
  }
  if (!webhookUrl) return reply(503, 'feedback_unavailable')

  try {
    const url = new URL(webhookUrl)
    // wait=true makes Discord confirm persistence before we show success.
    url.searchParams.set('wait', 'true')
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{
          title: 'New Elemendle feedback',
          description: message,
          color: 0x73b9ff,
          fields: [{ name: 'Page', value: page }],
          timestamp: new Date().toISOString()
        }]
      })
    })
    if (!response.ok) return reply(503, 'feedback_unavailable')
    // Drain the acknowledgement without retaining its message or channel data.
    await response.arrayBuffer()
  } catch {
    // Fetch errors can contain the secret URL. Never log them or return them.
    return reply(503, 'feedback_unavailable')
  }

  return Response.json({ ok: true }, {
    headers: {
      'Cache-Control': 'no-store',
      'Set-Cookie': `${COOLDOWN_COOKIE}=1; Max-Age=${COOLDOWN_SECONDS}; Path=/api/feedback; HttpOnly; SameSite=Strict${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`
    }
  })
}
