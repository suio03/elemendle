"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Clock3, FlaskConical, LibraryBig, LockKeyhole, Sparkles, Trophy } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import elementsData from '@/data/atom.json'
import { useProgression } from '@/hooks/use-progression'
import { getPeriodicPositions } from '@/lib/progression'
import { trackEvent } from '@/lib/analytics'
import type { Element } from '@/types/element'

const ELEMENTS = Object.values(elementsData) as Element[]
const POSITIONS = getPeriodicPositions()

export default function CollectionBoard() {
    const t = useTranslations('collection')
    const locale = useLocale()
    const progression = useProgression()
    const [selectedName, setSelectedName] = useState<string | null>(null)
    const hasTrackedOpen = useRef(false)
    const elementByNumber = useMemo(() => new Map(ELEMENTS.map(element => [Number(element.classic.atomic_number), element])), [])
    const discoveredCount = progression ? Object.keys(progression.discoveries).length : 0
    const selected = selectedName ? ELEMENTS.find(element => element.name === selectedName) : undefined
    const selectedDiscovery = selectedName ? progression?.discoveries[selectedName] : undefined
    const recent = progression
        ? Object.values(progression.discoveries).sort((left, right) => right.firstDiscoveredAt.localeCompare(left.firstDiscoveredAt)).slice(0, 4)
        : []

    useEffect(() => {
        if (!progression || hasTrackedOpen.current) return
        hasTrackedOpen.current = true
        trackEvent('collection_opened', { discoveredCount: Object.keys(progression.discoveries).length })
    }, [progression])

    if (!progression) {
        return <div className="flex min-h-[45vh] items-center justify-center text-[#C8E6EC]" role="status">{t('loading')}</div>
    }

    return (
        <section className="mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-[#9CCAD3]/40 bg-[#0B141B]/95 text-white shadow-2xl backdrop-blur-xl">
            <header className="relative overflow-hidden border-b border-white/10 px-5 py-9 sm:px-8 lg:px-10">
                <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border-[38px] border-emerald-300/[0.07]" />
                <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/[0.07] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                            <LibraryBig className="h-4 w-4" aria-hidden="true" />
                            {t('eyebrow')}
                        </span>
                        <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-6xl">{t('title')}</h1>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">{t('description')}</p>
                    </div>
                    <div className="min-w-64 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('progress')}</p>
                                <p className="mt-1 text-3xl font-black">{discoveredCount}<span className="text-base font-medium text-slate-500"> / 118</span></p>
                            </div>
                            <Sparkles className="h-6 w-6 text-amber-200" aria-hidden="true" />
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#73B9FF] to-emerald-300" style={{ width: `${(discoveredCount / 118) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-7 p-4 sm:p-7 lg:p-9">
                {selected && selectedDiscovery ? (
                    <div className="grid gap-4 rounded-2xl border border-[#73B9FF]/25 bg-[#73B9FF]/[0.06] p-4 sm:grid-cols-[auto_1fr] sm:p-5">
                        <div className="flex h-24 w-24 flex-col justify-between rounded-2xl border border-[#9CCAD3]/30 bg-[#1E4054] p-3 shadow-[0_12px_35px_rgba(0,0,0,0.25)]">
                            <span className="text-xs text-[#BFE7EF]">{selected.classic.atomic_number}</span>
                            <strong className="text-center text-4xl">{selected.symbol}</strong>
                            <span className="truncate text-center text-[10px]">{selected.name}</span>
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('detail.discovered-element')}</p><h2 className="mt-1 text-2xl font-black">{selected.name}</h2></div>
                                <a href={selected.wiki} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white">{t('detail.learn-more')}</a>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                <Detail icon={FlaskConical} label={t('detail.first-source')} value={t(`sources.${selectedDiscovery.firstSource}`)} />
                                <Detail icon={Check} label={t('detail.first-date')} value={new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(selectedDiscovery.firstDiscoveredAt))} />
                                <Detail icon={Trophy} label={t('detail.best-attempts')} value={selectedDiscovery.bestAttempts ? String(selectedDiscovery.bestAttempts) : '—'} />
                                <Detail icon={Clock3} label={t('detail.best-time')} value={selectedDiscovery.bestTime ? `${selectedDiscovery.bestTime}s` : '—'} />
                            </div>
                        </div>
                    </div>
                ) : null}

                <div>
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                        <div><h2 className="text-lg font-bold">{t('table-title')}</h2><p className="mt-1 text-xs text-slate-500">{t('table-description')}</p></div>
                        <p className="text-xs text-slate-500 sm:hidden">{t('scroll-hint')}</p>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-3 [scrollbar-color:#4b6570_transparent]">
                        <div className="grid min-w-[990px] grid-cols-[repeat(18,minmax(46px,1fr))] grid-rows-[repeat(10,58px)] gap-1.5">
                            {Array.from({ length: 18 }, (_, index) => <span key={index} className="text-center text-[9px] font-bold text-slate-600" style={{ gridColumn: index + 1, gridRow: 1 }}>{index + 1}</span>)}
                            {POSITIONS.map(position => {
                                if (position.placeholder) return (
                                    <div key={position.placeholder} style={{ gridColumn: position.column, gridRow: position.row }} className="flex items-center justify-center rounded-lg border border-dashed border-white/10 text-[9px] text-slate-600">{position.placeholder === 'lanthanide' ? '57–71' : '89–103'}</div>
                                )
                                const element = elementByNumber.get(position.atomicNumber!)!
                                const discovery = progression.discoveries[element.name]
                                return (
                                    <button
                                        key={element.name}
                                        type="button"
                                        disabled={!discovery}
                                        onClick={() => setSelectedName(element.name)}
                                        aria-label={discovery ? t('element-label', { element: element.name }) : t('locked-label', { number: element.classic.atomic_number })}
                                        style={{ gridColumn: position.column, gridRow: position.row }}
                                        className={`relative flex min-w-0 flex-col rounded-lg border p-1 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] ${discovery ? 'border-[#73B9FF]/30 bg-gradient-to-br from-[#244D57] to-[#172C38] hover:-translate-y-0.5 hover:border-emerald-200/50' : 'cursor-default border-white/[0.06] bg-white/[0.025] text-slate-700'}`}
                                    >
                                        <span className="text-[8px]">{element.classic.atomic_number}</span>
                                        <span className={`self-center text-lg font-black ${discovery ? 'text-white' : 'text-slate-700'}`}>{discovery ? element.symbol : '·'}</span>
                                        <span className="w-full truncate text-center text-[7px]">{discovery ? element.name : ''}</span>
                                        {!discovery ? <LockKeyhole className="absolute right-1 top-1 h-2.5 w-2.5" aria-hidden="true" /> : null}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {recent.length > 0 ? (
                    <div><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9CCAD3]">{t('recent')}</h2><div className="mt-3 flex flex-wrap gap-2">{recent.map(item => <button key={item.elementName} type="button" onClick={() => setSelectedName(item.elementName)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 hover:border-[#73B9FF]/35 hover:text-white">{item.elementName}</button>)}</div></div>
                ) : null}
            </div>
        </section>
    )
}

function Detail({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
    return <div className="min-w-0 rounded-xl border border-white/10 bg-black/15 p-3"><Icon className="h-4 w-4 text-[#9CCAD3]" aria-hidden="true" /><p className="mt-2 text-[10px] text-slate-500">{label}</p><p className="mt-0.5 break-words text-sm font-bold">{value}</p></div>
}
