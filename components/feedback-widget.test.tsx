import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import messages from '@/messages/en/i18n.json'
import FeedbackWidget from './feedback-widget'

vi.mock('next/navigation', () => ({ usePathname: () => '/practice' }))
let root: Root
let container: HTMLDivElement
beforeEach(async () => {
  vi.stubGlobal('React', React)
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC"><FeedbackWidget /></NextIntlClientProvider>))
  await act(async () => container.querySelector('button')!.click())
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function enterSuggestion() {
  const textarea = document.querySelector('textarea')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'Please add more practice challenges.')
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
  return textarea
}
async function submit() {
  await act(async () => {
    document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

it('keeps the suggestion after an error and allows a successful retry', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ error: 'feedback_unavailable' }, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ ok: true }))
  vi.stubGlobal('fetch', fetchMock)
  const textarea = await enterSuggestion()
  await submit()
  expect(document.body.textContent).toContain(messages.Feedback.error)
  expect(textarea.value).toBe('Please add more practice challenges.')
  await submit()
  expect(document.body.textContent).toContain(messages.Feedback.success)
  expect(document.querySelector('textarea')).toBeNull()
})

it('prevents simultaneous duplicate submissions and preserves text on a cooldown response', async () => {
  let resolve!: (value: Response) => void
  const fetchMock = vi.fn(() => new Promise<Response>(done => { resolve = done }))
  vi.stubGlobal('fetch', fetchMock)
  const textarea = await enterSuggestion()
  await submit()
  await submit()
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(textarea.disabled).toBe(true)
  await act(async () => resolve(Response.json({ error: 'rate_limited' }, { status: 429 })))
  expect(textarea.value).toBe('Please add more practice challenges.')
  expect(document.body.textContent).toContain(messages.Feedback.cooldown)
  await submit()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
