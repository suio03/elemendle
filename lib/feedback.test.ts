// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handleFeedback } from './feedback'

const webhook = 'https://discord.com/api/webhooks/test/secret'
const message = 'Please add more practice challenges.'
const request = (body: unknown = { message, page: '/practice' }, headers = {}) => new Request('https://elemendle.com/api/feedback', {
  method: 'POST',
  headers: { origin: 'https://elemendle.com', 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body)
})

afterEach(() => vi.unstubAllGlobals())

describe('anonymous feedback', () => {
  it('sends only the suggestion and pathname, suppresses mentions, and sets a cooldown after confirmation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'saved' }))
    vi.stubGlobal('fetch', fetchMock)
    const response = await handleFeedback(request({ message: `${message} @everyone`, page: '/practice?token=private#secret', email: 'ignored@example.com' }), webhook)
    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('Max-Age=600; Path=/api/feedback; HttpOnly; SameSite=Strict; Secure')
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).toBe(`${webhook}?wait=true`)
    const payload = JSON.parse(options.body)
    expect(payload.allowed_mentions).toEqual({ parse: [] })
    expect(payload.embeds[0].fields).toEqual([{ name: 'Page', value: '/practice' }])
    expect(options.body).not.toContain('private')
    expect(options.body).not.toContain('ignored@example.com')
  })

  it.each([null, [], {}, { message: 'short' }, { message: 'a'.repeat(1001) }, { message, website: 'bot' }, { message: 'See https://a.example and https://b.example' }, { message: 'x'.repeat(25) }])('rejects malformed or spam submissions without sending (%j)', async body => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect((await handleFeedback(request(body), webhook)).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects oversized bodies and invalid JSON', async () => {
    expect((await handleFeedback(request({ message, extra: 'a'.repeat(8192) }), webhook)).status).toBe(400)
    const invalid = new Request('https://elemendle.com/api/feedback', {
      method: 'POST', headers: { origin: 'https://elemendle.com', 'Content-Type': 'application/json' }, body: '{'
    })
    expect((await handleFeedback(invalid, webhook)).status).toBe(400)
  })

  it('rejects other origins, form posts and cooldown requests', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect((await handleFeedback(request(undefined, { origin: 'https://other.example' }), webhook)).status).toBe(403)
    expect((await handleFeedback(request(undefined, { 'Content-Type': 'text/plain' }), webhook)).status).toBe(415)
    expect((await handleFeedback(request(undefined, { cookie: 'other=1; elemendle_feedback_cooldown=1' }), webhook)).status).toBe(429)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('never reports success or sets a cooldown when unconfigured or Discord fails', async () => {
    expect((await handleFeedback(request())).status).toBe(503)
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 429 }))
    vi.stubGlobal('fetch', fetchMock)
    const response = await handleFeedback(request(), webhook)
    expect(response.status).toBe(503)
    expect(response.headers.get('set-cookie')).toBeNull()
    fetchMock.mockRejectedValue(new Error(webhook))
    const failed = await handleFeedback(request(), webhook)
    expect(await failed.text()).not.toContain('secret')
    expect(failed.status).toBe(503)
  })
})
