'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight, BookOpen, Check, Lightbulb, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGameGuide } from '@/contexts/game-guide-context'
import { Link } from '@/i18n/routing'
import { trackEvent } from '@/lib/analytics'
import { MOLECULE_BY_ID } from '@/lib/molecule-orders'
import { composition, identifyMolecules } from '@/lib/molecule-exploration'
import { advanceLearning, checkLearningModel, chooseLearningStage, clearLearningModel, createMoleculeLearning, learningCorrect, learningDifferences, learningTarget, LEARNING_STAGES, LESSONS, removeLearningAtom, selectLearningAtom, showLearningHint } from '@/lib/molecule-learning'
import type { LearningStage, MoleculeLearning } from '@/lib/molecule-learning'
import { getStoredMoleculeData, MOLECULE_STORAGE_KEY, MOLECULE_UPDATED_EVENT, storeMoleculeData } from '@/lib/molecule-storage'
import { ATOM_SYMBOLS } from '@/types/molecule-orders'
import type { AtomSymbol, MoleculeData } from '@/types/molecule-orders'

const ATOM_STYLES: Record<AtomSymbol, string> = {
    H: 'border-sky-200/50 bg-sky-200/15 text-sky-100', O: 'border-rose-200/50 bg-rose-200/15 text-rose-100',
    C: 'border-amber-200/50 bg-amber-200/15 text-amber-100', N: 'border-violet-200/50 bg-violet-200/15 text-violet-100'
}
function formula(id: string): string {
    return (MOLECULE_BY_ID.get(id)?.formula || '').replace(/\d/g, digit => String.fromCharCode(8320 + Number(digit)))
}
function atomSummary(id: string): string {
    const molecule = MOLECULE_BY_ID.get(id)!
    return ATOM_SYMBOLS.filter(atom => molecule.atoms[atom]).map(atom => `${atom} × ${molecule.atoms[atom]}`).join(' + ')
}

export default function MoleculeOrdersBoard() {
    const t = useTranslations('molecule-learning')
    const e = useTranslations('exploration')
    const moleculeT = useTranslations('molecules')
    const locale = useLocale()
    const [data, setData] = useState<MoleculeData | null>(null)
    const currentRef = useRef<MoleculeData | null>(null)
    const openedRef = useRef(false)
    const headingRef = useRef<HTMLHeadingElement>(null)
    const [saveError, setSaveError] = useState(false)
    const save = useCallback((next: MoleculeData) => {
        const updated = { ...next, updatedAt: Date.now() }
        currentRef.current = updated
        setData(updated)
        setSaveError(!storeMoleculeData(updated))
    }, [])

    useEffect(() => {
        const restore = () => {
            const stored = getStoredMoleculeData()
            if (!stored.learning) save({ ...stored, learning: createMoleculeLearning() })
            else { currentRef.current = stored; setData(stored) }
        }
        const onStorage = (event: StorageEvent) => { if (event.key === MOLECULE_STORAGE_KEY || event.key === null) restore() }
        restore()
        if (!openedRef.current) { openedRef.current = true; trackEvent('molecule_opened', { locale }) }
        window.addEventListener('storage', onStorage)
        window.addEventListener(MOLECULE_UPDATED_EVENT, restore)
        return () => {
            window.removeEventListener('storage', onStorage)
            window.removeEventListener(MOLECULE_UPDATED_EVENT, restore)
        }
    }, [locale, save])

    const state = data?.learning
    const question = state?.question
    useEffect(() => { if (question !== undefined) headingRef.current?.focus() }, [question])

    function update(action: (current: MoleculeLearning) => MoleculeLearning, event?: 'check' | 'hint' | 'stage') {
        const current = currentRef.current
        if (!current?.learning) return
        const next = action(current.learning)
        if (next === current.learning) return
        save({ ...current, learning: next })
        if (event === 'check') trackEvent('molecule_learning_checked', { sessionId: next.id, stage: next.stage, question: next.question, correct: learningCorrect(next), hintUsed: next.hintUsed, attempt: next.attempts })
        if (event === 'hint') trackEvent('molecule_learning_hint', { sessionId: next.id, question: next.question })
        if (event === 'stage' || next.stage !== current.learning.stage) trackEvent('molecule_learning_stage', { sessionId: next.id, stage: next.stage })
    }

    if (!state) return <p role="status" className="py-20 text-center text-slate-200">{moleculeT('loading')}</p>
    const target = learningTarget(state)
    const correct = learningCorrect(state)
    const locked = correct && state.stage !== 'explore'
    const reveal = state.stage !== 'practice' || state.hintUsed || correct
    const matches = state.checked ? identifyMolecules(composition(state.selected)) : []
    const explanations = target && correct ? [target] : state.stage === 'explore' ? matches : []
    const switchStage = (stage: LearningStage) => { if (stage !== state.stage) update(current => chooseLearningStage(current, stage), 'stage') }

    return (
        <section dir={locale === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-[#9CCAD3]/40 bg-[#0B141B]/95 text-white shadow-2xl">
            <header className="border-b border-white/10 px-5 py-6 sm:px-8">
                <Link href="/practice" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"><ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />{moleculeT('back')}</Link>
                <div className="mt-3 flex items-start justify-between gap-4"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('title')}</h1><BookOpen className="h-8 w-8 shrink-0 text-emerald-200" aria-hidden="true" /></div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">{t('intro')}</p>
            </header>
            <div className="space-y-6 p-5 sm:p-8">
                {saveError ? <p role="alert" className="text-sm text-amber-200">{moleculeT('save-error')}</p> : null}
                <nav aria-label={t('stages')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LEARNING_STAGES.map((stage, index) => <button key={stage} type="button" onClick={() => switchStage(stage)} aria-current={state.stage === stage ? 'step' : undefined} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-3 text-start text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${state.stage === stage ? 'border-emerald-200/50 bg-emerald-200/10 text-emerald-100' : 'border-white/10 text-slate-300 hover:bg-white/5'}`}><span className="opacity-60">0{index + 1}</span>{t(stage)}</button>)}
                </nav>
                <div className="rounded-2xl border border-sky-200/20 bg-sky-200/[0.04] p-5">
                    <p className="text-sm leading-relaxed text-slate-300">{t(`${state.stage}-goal`)}</p>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-xl font-bold outline-none">{target ? t('target', { name: moleculeT(`names.${target.id}`) }) : t('explore')}</h2>
                    {target ? <p className="mt-2 text-xs text-slate-400">{state.index + 1} / {LESSONS[state.stage].length}</p> : null}
                    {target && reveal ? <div className="mt-4"><p dir="ltr" className="text-4xl font-black text-sky-100">{formula(target.id)}</p><p className="mt-3 text-sm leading-relaxed text-slate-300">{t('formula-rule')}</p></div> : null}
                    {state.stage === 'practice' && !reveal ? <Button type="button" variant="ghost" onClick={() => update(showLearningHint, 'hint')} className="mt-3 min-h-11 px-0 text-sky-200 hover:bg-transparent hover:text-sky-100"><Lightbulb className="me-2 h-4 w-4" aria-hidden="true" />{t('hint')}</Button> : null}
                </div>
                <div>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-300">{t('atoms')}</h2>
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {ATOM_SYMBOLS.map(atom => <button key={atom} type="button" onClick={() => update(current => selectLearningAtom(current, atom))} disabled={locked || state.selected.length >= 12} aria-label={e('add', { atom })} className={`flex min-h-20 items-center justify-center gap-2 rounded-2xl border p-3 transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40 ${ATOM_STYLES[atom]}`}><span className="text-2xl font-black">{atom}</span><Plus className="h-4 w-4" aria-hidden="true" /></button>)}
                </div>
                </div>
                <div className="rounded-2xl border border-dashed border-white/25 bg-black/15 p-4 sm:p-6">
                    <h2 className="text-sm font-semibold text-slate-200">{e('bench')}</h2>
                    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3 py-5">
                        {state.selected.length ? state.selected.map((atom, index) => <button key={`${index}-${atom}`} type="button" disabled={locked} onClick={() => update(current => removeLearningAtom(current, index))} aria-label={e('remove', { atom })} className={`h-12 w-12 rounded-full border text-xl font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-14 sm:w-14 ${ATOM_STYLES[atom]}`}>{atom}</button>) : <p className="max-w-sm text-center text-sm leading-relaxed text-slate-400">{t('empty')}</p>}
                    </div>
                    {state.selected.length >= 12 ? <p role="status" className="mb-3 text-center text-xs text-slate-300">{t('limit')}</p> : null}
                    <div className="flex flex-wrap justify-center gap-3"><Button type="button" onClick={() => update(checkLearningModel, 'check')} disabled={!state.selected.length || state.checked} className="min-h-12 bg-emerald-200 px-7 font-bold text-[#071319] hover:bg-emerald-100">{e('check')}</Button><Button type="button" variant="ghost" onClick={() => update(clearLearningModel)} disabled={!state.selected.length || locked} className="min-h-12 text-slate-300 hover:bg-white/10 hover:text-white"><RotateCcw className="me-2 h-4 w-4" aria-hidden="true" />{t('clear')}</Button></div>
                </div>
                <div role="status" aria-live="polite" aria-atomic="true">
                    {state.checked ? correct ? <div className="space-y-3 rounded-2xl border border-emerald-200/30 bg-emerald-200/10 p-5">
                        <p className="flex items-center gap-2 font-bold text-emerald-100"><Check className="h-5 w-5 shrink-0" aria-hidden="true" />{t('correct')}</p>
                        {explanations.map(molecule => <div key={molecule.id}><p className="text-xl font-bold"><span dir="ltr">{formula(molecule.id)}</span> · {moleculeT(`names.${molecule.id}`)}</p><p className="mt-2 text-sm leading-relaxed text-slate-200">{t('explanation', { formula: formula(molecule.id), atoms: atomSummary(molecule.id) })}</p></div>)}
                        {state.stage === 'practice' ? <p className="text-xs text-emerald-100">{t(!state.hintUsed && state.attempts === 1 ? 'independent' : 'assisted')}</p> : null}
                        {locked ? <Button type="button" onClick={() => update(advanceLearning)} className="min-h-11 bg-emerald-200 font-bold text-[#071319] hover:bg-emerald-100">{t('next')}<ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" /></Button> : null}
                    </div> : <div className="rounded-xl border border-amber-200/25 bg-amber-200/5 p-4 text-sm text-amber-100"><p>{target ? t('retry') : e('unknown')}</p>{target ? <ul className="mt-2 space-y-1">{learningDifferences(state).map(({ atom, difference }) => <li key={atom}>{t(difference > 0 ? 'missing' : 'extra', { atom, count: Math.abs(difference) })}</li>)}</ul> : null}</div> : null}
                </div>
                {state.stage === 'compare' ? <div className="rounded-2xl border border-white/15 p-5"><div className="grid grid-cols-2 gap-3">{['water', 'hydrogen-peroxide'].map(id => <div key={id}><p dir="ltr" className="text-2xl font-bold text-sky-100">{formula(id)}</p><p className="mt-1 text-sm text-slate-200">{moleculeT(`names.${id}`)}</p><p dir="ltr" className="mt-2 text-xs text-slate-300">{atomSummary(id)}</p></div>)}</div><p className="mt-4 text-sm leading-relaxed text-slate-300">{t('compare-note')}</p></div> : null}
                {state.seenIds.length ? <div><h2 className="mb-3 text-sm font-bold text-slate-200">{t('records')}</h2><p className="mb-3 text-xs leading-relaxed text-slate-400">{t('records-note')}</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{state.seenIds.filter(id => !(state.stage === 'practice' && target?.id === id && !reveal)).map(id => <div key={id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p dir="ltr" className="font-bold text-sky-100">{formula(id)}</p><p className="mt-1 text-sm text-slate-200">{moleculeT(`names.${id}`)}</p><p className="mt-2 text-xs text-slate-400">{t(state.independentIds.includes(id) ? 'independent' : 'seen')}</p></div>)}</div></div> : null}
            </div>
            <footer className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-slate-400 sm:px-8">{e('model-note')}</footer>
        </section>
    )
}

export function MoleculeOrdersGuide() {
    const t = useTranslations('molecule-learning')
    const { isGuideVisible, toggleGuide } = useGameGuide()
    return <Dialog open={isGuideVisible} onOpenChange={open => { if (open !== isGuideVisible) toggleGuide() }}><DialogContent className="border-[#9CCAD3]/40 bg-[#0B141B] text-white"><DialogHeader><DialogTitle>{t('title')}</DialogTitle><DialogDescription className="text-slate-300">{t('intro')}</DialogDescription></DialogHeader><ol className="list-decimal space-y-3 ps-5 text-sm leading-relaxed text-slate-200">{LEARNING_STAGES.map(stage => <li key={stage}><strong>{t(stage)}</strong><p className="mt-1">{t(`${stage}-goal`)}</p></li>)}</ol></DialogContent></Dialog>
}
