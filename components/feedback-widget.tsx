'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Loader2, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function FeedbackWidget() {
  const t = useTranslations('Feedback')
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'cooldown' | 'invalid'>('idle')
  const sending = useRef(false)
  const cooldownUntil = useRef(0)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current) return
    if (Date.now() < cooldownUntil.current) {
      setStatus('cooldown')
      return
    }
    if (message.trim().length < 10) {
      setStatus('invalid')
      return
    }
    sending.current = true
    setStatus('sending')
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, page: pathname, website })
      })
      const result = await response.json()
      if (response.ok && result.ok === true) {
        setMessage('')
        cooldownUntil.current = Date.now() + 600_000
        setStatus('sent')
      } else if (response.status === 429) {
        cooldownUntil.current = Date.now() + 600_000
        setStatus('cooldown')
      } else {
        setStatus(response.status === 400 ? 'invalid' : 'error')
      }
    } catch {
      setStatus('error')
    } finally {
      sending.current = false
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => {
      setOpen(next)
      if (next && !sending.current) {
        setStatus(Date.now() < cooldownUntil.current ? 'cooldown' : 'idle')
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 h-11 gap-2 rounded-full border-[#73B9FF]/40 bg-[#101D27] px-3 text-[#B9DCE3] shadow-lg hover:bg-[#193044] hover:text-white sm:px-4"
          aria-label={t('launcher')}
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">{t('launcher')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent
          closeLabel={t('close')}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-[#73B9FF]/25 bg-[#101D27] p-6 text-white"
      >
        <DialogHeader className="gap-2 text-start sm:text-start">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[#73B9FF]/10 text-[#73B9FF]">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle className="pe-5 text-xl leading-snug">{t('title')}</DialogTitle>
          <DialogDescription className="leading-relaxed text-slate-300">{t('helper')}</DialogDescription>
        </DialogHeader>
        {status === 'sent' ? (
          <div role="status" className="flex items-start gap-3 rounded-xl bg-emerald-400/10 p-4 text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm leading-relaxed">{t('success')}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium">{t('label')}</label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder={t('placeholder')}
                required minLength={10} maxLength={1000} rows={5}
                disabled={status === 'sending'}
                aria-describedby="feedback-limits feedback-privacy feedback-status"
                aria-invalid={status === 'invalid'}
                className="w-full resize-y rounded-xl border border-slate-600 bg-[#0D151C] p-3 text-base leading-relaxed text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] disabled:opacity-60"
              />
              <div id="feedback-limits" className="mt-1 flex justify-between gap-3 text-xs text-slate-400">
                <span>{t('limits')}</span><span>{message.length}/1000</span>
              </div>
            </div>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="feedback-website">Website</label>
              <input id="feedback-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
            </div>
            <p id="feedback-privacy" className="text-xs leading-relaxed text-slate-400">{t('privacy')}</p>
            <p id="feedback-status" role="status" className="text-sm leading-relaxed text-amber-200">
              {status === 'error' ? t('error') : status === 'cooldown' ? t('cooldown') : status === 'invalid' ? t('invalid') : ''}
            </p>
            <Button type="submit" disabled={status === 'sending' || message.trim().length < 10}
              className="h-11 w-full gap-2 rounded-xl bg-[#73B9FF] text-[#0D151C] hover:bg-[#9ACFFF]">
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {status === 'sending' ? t('sending') : t('send')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
