'use client'

import { useLearningCopy } from '@/lib/learning-copy'

import { useRef, useState } from 'react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'
import { lessonQuizzes, type LessonId } from '@/lib/learn-content'

export default function LessonQuiz({ lesson }: { lesson: LessonId }) {
    const t = useLearningCopy()

    const questions = lessonQuizzes[lesson]
    const [index, setIndex] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [answers, setAnswers] = useState<number[]>([])
    const [finished, setFinished] = useState(false)
    const checkedRef = useRef(false)
    const startedRef = useRef(false)
    const headingRef = useRef<HTMLHeadingElement>(null)
    const feedbackRef = useRef<HTMLDivElement>(null)
    const question = questions[index]
    const checked = answers.length > index
    const score = answers.filter((answer, i) => answer === questions[i].answer).length

    function checkAnswer() {
        if (selected === null || checkedRef.current) return
        checkedRef.current = true
        const next = [...answers, selected]
        setAnswers(next)
        trackEvent('learn_quiz_answered', { lesson, question: index + 1, correct: selected === question.answer })
        if (next.length === questions.length) {
            trackEvent('learn_quiz_completed', { lesson, correctAnswers: next.filter((a, i) => a === questions[i].answer).length, total: questions.length })
        }
        requestAnimationFrame(() => feedbackRef.current?.focus())
    }

    function next() {
        if (index === questions.length - 1) setFinished(true)
        else { setIndex(index + 1); setSelected(null); checkedRef.current = false }
        requestAnimationFrame(() => headingRef.current?.focus())
    }

    function reset() {
        setIndex(0); setSelected(null); setAnswers([]); setFinished(false)
        checkedRef.current = false; startedRef.current = false
        requestAnimationFrame(() => headingRef.current?.focus())
    }

    return (
        <div className="rounded-2xl border border-[#9CCAD3]/30 bg-[#101D27] p-5 sm:p-7">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#9CCAD3]">{finished ? t('Quick check complete') : t('Question {current} of {total}', { current: index + 1, total: questions.length })}</p>
            <h3 ref={headingRef} tabIndex={-1} className="mb-5 text-xl font-semibold text-white outline-none">{finished ? t('{score} of {total} correct', { score, total: questions.length }) : t(question.prompt)}</h3>
            {finished ? <>
                <p className="text-sm leading-7 text-slate-300">{score === questions.length ? t('Nice work. Try using these ideas in a game next.') : t('Use the explanations below to revisit the ideas you missed, then try again.')}{' '}{t("This is a short practice check, not a mastery score.")}</p>
                <ul className="my-5 space-y-3">{questions.map((q, i) => <li key={t(q.prompt)} className="text-sm"><strong>{answers[i] === q.answer ? t('✓ Correct') : t('Review')}: </strong>{t(q.prompt)} <a href={q.review} className="text-[#B9DCE3] underline underline-offset-4">{t("Review this idea")}</a></li>)}</ul>
                <div className="flex flex-wrap gap-3"><Button onClick={reset} variant="outline">{t("Try again")}</Button><Link href="/practice" className="inline-flex min-h-11 items-center rounded-lg bg-[#73B9FF] px-4 text-sm font-semibold text-[#071319]">{t("Play Element Challenges →")}</Link></div>
                <p className="mt-4 text-xs text-slate-400">{t("Element Challenges covers the wider periodic table.")}</p>
            </> : <>
                <fieldset disabled={checked}>
                    <legend className="sr-only">{t("Choose one answer")}</legend>
                    <div className="space-y-3">{question.choices.map((choice, i) => <label key={choice} className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${selected === i ? 'border-[#73B9FF] bg-[#73B9FF]/10 text-white' : 'border-white/15 text-slate-300'} ${checked ? 'cursor-default' : 'hover:border-[#9CCAD3]'}`}>
                        <input type="radio" name={`quiz-${lesson}`} checked={selected === i} onChange={() => {
                            setSelected(i)
                            if (!startedRef.current) { startedRef.current = true; trackEvent('learn_quiz_started', { lesson }) }
                        }} className="mt-1 h-4 w-4 shrink-0 accent-[#73B9FF]" />{t(choice)}
                    </label>)}</div>
                </fieldset>
                {checked ? <div ref={feedbackRef} tabIndex={-1} role="status" className={`mt-5 rounded-xl border p-4 outline-none ${selected === question.answer ? 'border-emerald-300/30 bg-emerald-400/5' : 'border-amber-200/30 bg-amber-200/5'}`}>
                    <p className="font-semibold text-white">{selected === question.answer ? t('Correct.') : t('The answer is: {answer}.', { answer: t(question.choices[question.answer]) })}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{t(question.explanation)}</p>
                </div> : null}
                <div className="mt-5">{checked ? <Button onClick={next}>{index === questions.length - 1 ? t('See results') : t('Next question')} →</Button> : <Button disabled={selected === null} onClick={checkAnswer}>{t("Check answer")}</Button>}</div>
            </>}
            <noscript><p className="mt-4">{t("Enable JavaScript to use this quiz. The lesson and worked examples above are available without it.")}</p></noscript>
        </div>
    )
}
