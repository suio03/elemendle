'use client'

import { useLearningCopy } from '@/lib/learning-copy'

import { useState } from 'react'
import { firstTwenty } from '@/lib/learn-content'

const groups = [1, 2, 13, 14, 15, 16, 17, 18]
export default function ElementExplorer() {
    const t = useLearningCopy()

    const [selected, setSelected] = useState<number>(1)
    const element = firstTwenty[selected - 1]
    return (
        <div className="rounded-2xl border border-[#9CCAD3]/25 bg-[#101D27] p-4 sm:p-6">
            <p className="mb-4 text-sm text-slate-400">{t("Select an element. Columns are groups; rows are periods.")}</p>
            <div dir="ltr" className="grid grid-cols-8 gap-1 sm:gap-2" aria-label={t("First 20 elements arranged by group and period")}>
                {groups.map(group => <span key={group} className="pb-1 text-center text-[10px] text-slate-400 sm:text-xs">{group}</span>)}
                {firstTwenty.map(item => <button key={item.number} type="button" aria-pressed={selected === item.number} aria-label={`${item.number}, ${t(item.name)}, ${item.symbol}`} onClick={() => setSelected(item.number)} style={{ gridColumn: groups.indexOf(item.group) + 1, gridRow: item.period + 1 }} className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-md border py-2 transition sm:min-h-20 ${selected === item.number ? 'border-[#73B9FF] bg-[#73B9FF] text-[#071319]' : 'border-[#9CCAD3]/25 bg-[#17242E] text-[#C8E6EC] hover:border-[#73B9FF]'}`}>
                    <span className="text-[10px] sm:text-xs">{item.number}</span><span className="text-base font-bold sm:text-2xl">{item.symbol}</span>
                </button>)}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{t("Groups 3–12 are omitted here: none of the first 20 elements occupy them. Period 4 continues beyond this subset.")}</p>
            <div role="status" aria-live="polite" className="mt-6 flex flex-wrap items-center gap-5 border-t border-[#9CCAD3]/25 pt-5">
                <span className="text-5xl font-bold text-[#9CCAD3]">{element.symbol}</span>
                <div><p className="text-xl font-semibold text-white">{t(element.name)}</p><p className="mt-1 text-sm text-slate-300">{t('Atomic number {number} · Group {group} · Period {period}', { number: element.number, group: element.group, period: element.period })}</p></div>
            </div>
        </div>
    )
}
