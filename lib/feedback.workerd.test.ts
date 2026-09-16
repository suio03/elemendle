// @vitest-environment node
import { build } from 'esbuild'
import { Miniflare, Response as WorkerResponse, convertV4MiniflareOptions } from 'miniflare'
import { expect, it } from 'vitest'

it('reads the request stream and sends confirmed feedback using real workerd Fetch', async () => {
  const bundle = await build({
    stdin: {
      contents: `import { handleFeedback } from './lib/feedback'; export default { fetch(request) { return handleFeedback(request, 'https://discord.com/api/webhooks/test/secret') } }`,
      resolveDir: process.cwd()
    },
    bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022'
  })
  let sent: Record<string, unknown> | undefined
  let sentUrl = ''
  let calls = 0
  const worker = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: bundle.outputFiles[0].text,
    compatibilityDate: '2026-08-18',
    outboundService: async request => {
      calls++
      sentUrl = request.url
      sent = await request.json() as Record<string, unknown>
      return WorkerResponse.json({ id: 'confirmed' })
    }
  }))
  try {
    const response = await worker.dispatchFetch('https://elemendle.com/api/feedback', {
      method: 'POST', headers: { origin: 'https://elemendle.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '希望可以增加更多元素相关的挑战。', page: '/ch/practice?private=1' })
    })
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(sent).toMatchObject({ allowed_mentions: { parse: [] }, embeds: [{ description: '希望可以增加更多元素相关的挑战。', fields: [{ name: 'Page', value: '/ch/practice' }] }] })
    expect(calls).toBe(1)
    expect(sentUrl).toBe('https://discord.com/api/webhooks/test/secret?wait=true')
    const oversized = await worker.dispatchFetch('https://elemendle.com/api/feedback', {
      method: 'POST', headers: { origin: 'https://elemendle.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '超'.repeat(4000) })
    })
    expect(oversized.status).toBe(400)
    expect(calls).toBe(1)
  } finally {
    await worker.dispose()
  }
}, 30_000)
