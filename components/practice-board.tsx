"use client"

import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleDot,
    Clock3,
    Dices,
    FlaskConical,
    Lightbulb,
    ListFilter,
    Play,
    RotateCcw,
    Scale,
    Search,
    Sparkles
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'react-hot-toast'
import elementsData from '@/data/atom.json'
import ElementBox from '@/components/element-box'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import {
    addRecentQuestionIds,
    advanceChallengeSession,
    answerChallengeQuestion,
    createChallengeSession,
    getChallengeScore,
    getElementByName
} from '@/lib/challenge'
import {
    getInitialChallengeData,
    getStoredChallengeData,
    storeChallengeData
} from '@/lib/challenge-storage'
import { trackEvent } from '@/lib/analytics'
import { useProgression } from '@/hooks/use-progression'
import { recordElementDiscovery } from '@/lib/progression'
import type { Element, ElementCategory } from '@/types/element'
import type {
    ChallengeAnswer,
    ChallengeData,
    ChallengeMode,
    ChallengeQuestion,
    ChallengeSession,
    ExtremeChallengeQuestion,
    IdentityChallengeQuestion,
    OddOneOutChallengeQuestion
} from '@/types/challenge'

const ELEMENTS = Object.values(elementsData) as Element[]

const MODE_ICONS = {
    mixed: Sparkles,
    identity: Search,
    extreme: Scale,
    'odd-one-out': ListFilter
} as const

export default function PracticeBoard() {
    const t = useTranslations('challenge')
    const [challengeData, setChallengeData] = useState<ChallengeData | null>(null)

    useEffect(() => {
        setChallengeData(getStoredChallengeData())
    }, [])

    const saveData = (next: ChallengeData) => {
        setChallengeData(next)
        storeChallengeData(next)
    }

    const startChallenge = (mode: ChallengeMode) => {
        if (!challengeData) return
        const currentSession = createChallengeSession(mode, {
            recentQuestionIds: challengeData.recentQuestionIds
        })
        saveData({
            ...challengeData,
            currentSession,
            recentQuestionIds: addRecentQuestionIds(challengeData.recentQuestionIds, currentSession.questions)
        })
        trackEvent('challenge_started', { challengeMode: mode })
    }

    const updateSession = (currentSession: ChallengeSession) => {
        if (!challengeData) return
        saveData({ ...challengeData, currentSession })
    }

    const returnToLab = () => {
        if (!challengeData) return
        saveData({ ...challengeData, currentSession: null })
    }

    if (!challengeData) {
        return (
            <div className="flex min-h-[42vh] items-center justify-center" role="status">
                <div className="animate-pulse text-[#C8E6EC] motion-reduce:animate-none">{t('loading')}</div>
            </div>
        )
    }

    if (!challengeData.currentSession) {
        return <ChallengeLobby onStart={startChallenge} />
    }

    if (challengeData.currentSession.completedAt) {
        return (
            <ChallengeResult
                session={challengeData.currentSession}
                onPlayAgain={() => startChallenge(challengeData.currentSession!.mode)}
                onReturn={returnToLab}
            />
        )
    }

    return (
        <ChallengeRound
            key={challengeData.currentSession.id}
            session={challengeData.currentSession}
            onChange={updateSession}
            onExit={returnToLab}
        />
    )
}

function ChallengeLobby({ onStart }: { onStart: (mode: ChallengeMode) => void }) {
    const t = useTranslations('challenge')
    const modes: Exclude<ChallengeMode, 'mixed'>[] = ['identity', 'extreme', 'odd-one-out']

    return (
        <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#9CCAD3]/40 bg-[#0B141B]/95 text-white shadow-2xl backdrop-blur-xl">
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-10 sm:px-10 sm:py-12">
                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[42px] border-[#73B9FF]/10" />
                <div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
                <div className="relative max-w-2xl">
                    <div className="mb-5 flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#9CCAD3]/30 bg-[#73B9FF]/10 text-[#C8E6EC] shadow-[0_0_35px_rgba(115,185,255,0.16)]">
                            <FlaskConical className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
                            {t('eyebrow')}
                        </span>
                    </div>
                    <h1 className="max-w-xl text-4xl font-black tracking-[-0.035em] text-white sm:text-6xl">
                        {t('title')}
                    </h1>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">{t('description')}</p>
                    <Button
                        type="button"
                        onClick={() => onStart('mixed')}
                        className="mt-7 min-h-14 rounded-xl bg-[#73B9FF] px-6 text-base font-black text-[#071319] shadow-[0_12px_34px_rgba(115,185,255,0.22)] hover:bg-[#91C9FF]"
                    >
                        <Play className="mr-2 h-5 w-5 fill-current" aria-hidden="true" />
                        {t('start-mixed')}
                        <span className="ml-3 rounded-md bg-black/10 px-2 py-1 text-xs">{t('five-questions')}</span>
                    </Button>
                </div>
            </div>

            <div className="p-5 sm:p-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9CCAD3]">{t('choose-lab')}</p>
                        <h2 className="mt-1 text-xl font-bold">{t('choose-lab-description')}</h2>
                    </div>
                    <p className="hidden text-xs text-slate-500 sm:block">{t('no-penalty')}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {modes.map((mode, index) => {
                        const Icon = MODE_ICONS[mode]
                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => onStart(mode)}
                                className="group relative min-h-48 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-[#73B9FF]/45 hover:bg-[#73B9FF]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] motion-reduce:transform-none"
                            >
                                <span className="absolute right-4 top-3 text-5xl font-black text-white/[0.035]">0{index + 1}</span>
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#73B9FF]/10 text-[#BFE7EF] transition group-hover:bg-[#73B9FF]/20">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="mt-7 text-lg font-bold text-white">{t(`modes.${mode}.title`)}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(`modes.${mode}.description`)}</p>
                                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#9CCAD3]">
                                    {t('start-lab')}
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-dashed border-white/15 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Dices className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-slate-200">{t('classic.title')}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">{t('classic.description')}</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" className="shrink-0 border-white/15 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">
                        <Link href="/practice/classic">{t('classic.action')}</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

function ChallengeRound({
    session,
    onChange,
    onExit
}: {
    session: ChallengeSession
    onChange: (session: ChallengeSession) => void
    onExit: () => void
}) {
    const t = useTranslations('challenge')
    const question = session.questions[session.currentQuestionIndex]
    const answer = session.answers.find(item => item.questionId === question.id)
    const Icon = MODE_ICONS[question.kind]
    const progress = ((session.currentQuestionIndex + (answer ? 1 : 0)) / session.questions.length) * 100

    const submitAnswer = (selectedElementName: string) => {
        const next = answerChallengeQuestion(session, selectedElementName)
        const submittedAnswer = next.answers.find(item => item.questionId === question.id)
        if (submittedAnswer && !answer) {
            trackEvent('challenge_answered', {
                questionType: question.kind,
                questionNumber: session.currentQuestionIndex + 1,
                correct: submittedAnswer.isCorrect
            })
            if (submittedAnswer.isCorrect) {
                recordElementDiscovery({
                    eventId: `challenge:${session.id}:${question.id}`,
                    elementName: question.answerElementName,
                    source: 'challenge'
                })
            }
        }
        onChange(next)
    }

    const continueChallenge = () => {
        const next = advanceChallengeSession(session)
        if (next.completedAt && !session.completedAt) {
            trackEvent('challenge_completed', {
                challengeMode: session.mode,
                correctAnswers: getChallengeScore(next)
            })
        }
        onChange(next)
    }

    return (
        <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#9CCAD3]/40 bg-[#0B141B]/95 text-white shadow-2xl backdrop-blur-xl">
            <header className="border-b border-white/10 px-5 py-5 sm:px-8">
                <div className="flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={onExit}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF]"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('exit')}
                    </button>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9CCAD3]">
                        {t('question-count', { current: session.currentQuestionIndex + 1, total: session.questions.length })}
                    </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#73B9FF] to-amber-200 transition-[width] duration-300 motion-reduce:transition-none"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            <div className="p-5 sm:p-8">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#73B9FF]/10 text-[#BFE7EF]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9CCAD3]">{t(`modes.${question.kind}.title`)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{t('think-first')}</p>
                    </div>
                </div>

                <QuestionPrompt question={question} />

                <div className="mt-7">
                    {question.kind === 'identity' ? (
                        <ElementSearchAnswer
                            key={question.id}
                            disabled={Boolean(answer)}
                            onSubmit={submitAnswer}
                        />
                    ) : (
                        <ChoiceAnswers question={question} answer={answer} onSubmit={submitAnswer} />
                    )}
                </div>

                {answer ? (
                    <AnswerFeedback question={question} answer={answer} onContinue={continueChallenge} />
                ) : null}
            </div>
        </section>
    )
}

function QuestionPrompt({ question }: { question: ChallengeQuestion }) {
    const t = useTranslations('challenge')

    if (question.kind === 'identity') {
        return (
            <div className="mt-7">
                <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl">{t('questions.identity.prompt')}</h1>
                <p className="mt-2 text-sm text-slate-400">{t('questions.identity.instruction')}</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {question.clues.map((clue, index) => (
                        <div key={clue.property} className="rounded-2xl border border-[#9CCAD3]/20 bg-[#73B9FF]/[0.06] p-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9CCAD3]/70">
                                {t('clue-number', { number: index + 1 })} · {t(`properties.${clue.property}`)}
                            </span>
                            <p className="mt-2 break-words text-lg font-bold text-white">{formatPropertyValue(clue.property, clue.value)}</p>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (question.kind === 'extreme') {
        return (
            <div className="mt-7">
                <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl">
                    {t(`questions.extreme.${question.direction}`, { property: t(`properties.${question.property}`) })}
                </h1>
                <p className="mt-2 text-sm text-slate-400">{t('questions.choose-one')}</p>
            </div>
        )
    }

    return (
        <div className="mt-7">
            <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl">
                {t('questions.odd-one-out.prompt', { property: t(`properties.${question.property}`) })}
            </h1>
            <p className="mt-2 text-sm text-slate-400">{t('questions.odd-one-out.instruction')}</p>
        </div>
    )
}

function ChoiceAnswers({
    question,
    answer,
    onSubmit
}: {
    question: ExtremeChallengeQuestion | OddOneOutChallengeQuestion
    answer?: ChallengeAnswer
    onSubmit: (elementName: string) => void
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {question.choiceElementNames.map(name => {
                const element = getElementByName(name)
                if (!element) return null
                const isCorrect = name === question.answerElementName
                const isSelected = name === answer?.selectedElementName
                const answerStyle = answer
                    ? isCorrect
                        ? 'border-emerald-300/60 bg-emerald-300/10'
                        : isSelected
                            ? 'border-amber-200/50 bg-amber-200/10'
                            : 'border-white/5 bg-white/[0.02] opacity-55'
                    : 'border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:border-[#73B9FF]/45 hover:bg-[#73B9FF]/[0.08]'

                return (
                    <button
                        key={name}
                        type="button"
                        aria-label={element.name}
                        disabled={Boolean(answer)}
                        onClick={() => onSubmit(name)}
                        className={`flex min-h-24 items-center gap-4 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] motion-reduce:transform-none ${answerStyle}`}
                    >
                        <ElementBox
                            number={element.classic.atomic_number}
                            symbol={element.symbol}
                            name={element.name}
                            category={element.classic.element_type as ElementCategory}
                            className="h-16 w-16 shrink-0"
                        />
                        <span className="min-w-0">
                            <span className="block break-words text-base font-bold text-white">{element.name}</span>
                            <span className="mt-1 block text-xs text-slate-400">{element.symbol} · #{element.classic.atomic_number}</span>
                        </span>
                        {answer && isCorrect ? <Check className="ml-auto h-5 w-5 shrink-0 text-emerald-200" aria-hidden="true" /> : null}
                        {answer && isSelected && !isCorrect ? <CircleDot className="ml-auto h-5 w-5 shrink-0 text-amber-100" aria-hidden="true" /> : null}
                    </button>
                )
            })}
        </div>
    )
}

function ElementSearchAnswer({
    disabled,
    onSubmit
}: {
    disabled: boolean
    onSubmit: (elementName: string) => void
}) {
    const t = useTranslations('challenge')
    const [input, setInput] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const searchTerm = input.trim().toLowerCase()
    const suggestions = useMemo(() => searchTerm
        ? ELEMENTS.filter(element =>
            element.name.toLowerCase().includes(searchTerm) || element.symbol.toLowerCase().includes(searchTerm)
        ).sort((left, right) => {
            const leftExact = left.name.toLowerCase() === searchTerm || left.symbol.toLowerCase() === searchTerm
            const rightExact = right.name.toLowerCase() === searchTerm || right.symbol.toLowerCase() === searchTerm
            if (leftExact !== rightExact) return leftExact ? -1 : 1
            return left.name.localeCompare(right.name)
        }).slice(0, 6)
        : [], [searchTerm])

    const select = (element: Element) => {
        setInput(element.name)
        onSubmit(element.name)
    }

    const submit = () => {
        const normalized = input.trim().toLowerCase()
        const element = ELEMENTS.find(candidate =>
            candidate.name.toLowerCase() === normalized || candidate.symbol.toLowerCase() === normalized
        )
        if (!element) {
            toast.error(t('invalid-element'))
            return
        }
        select(element)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length > 0 && event.key === 'ArrowDown') {
            event.preventDefault()
            setActiveIndex(index => (index + 1) % suggestions.length)
        } else if (suggestions.length > 0 && event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex(index => index === 0 ? suggestions.length - 1 : index - 1)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            if (suggestions[activeIndex]) select(suggestions[activeIndex])
            else submit()
        } else if (event.key === 'Escape') {
            setInput('')
        }
    }

    return (
        <form
            onSubmit={event => {
                event.preventDefault()
                submit()
            }}
            className="relative"
        >
            <label htmlFor="challenge-element-answer" className="sr-only">{t('answer-label')}</label>
            <div className="flex gap-2">
                <input
                    id="challenge-element-answer"
                    value={input}
                    disabled={disabled}
                    onChange={event => {
                        setInput(event.target.value)
                        setActiveIndex(0)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t('answer-placeholder')}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={!disabled && suggestions.length > 0}
                    aria-controls="challenge-element-suggestions"
                    className="h-14 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] disabled:opacity-60"
                />
                <Button type="submit" disabled={disabled} className="h-14 rounded-xl bg-[#73B9FF] px-5 font-bold text-[#071319] hover:bg-[#91C9FF]">
                    {t('submit')}
                </Button>
            </div>
            {!disabled && suggestions.length > 0 ? (
                <div id="challenge-element-suggestions" role="listbox" className="absolute z-30 mt-2 max-h-72 w-[calc(100%-5rem)] overflow-y-auto rounded-xl border border-[#73B9FF]/35 bg-[#17212A] p-2 shadow-2xl">
                    {suggestions.map((element, index) => (
                        <button
                            key={element.name}
                            type="button"
                            role="option"
                            aria-selected={index === activeIndex}
                            onMouseDown={event => event.preventDefault()}
                            onClick={() => select(element)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73B9FF] ${index === activeIndex ? 'bg-[#73B9FF]/15' : 'hover:bg-white/5'}`}
                        >
                            <span className="font-medium text-[#C8E6EC]">{element.name}</span>
                            <span className="text-xs text-slate-500">{element.symbol} · #{element.classic.atomic_number}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </form>
    )
}

function AnswerFeedback({
    question,
    answer,
    onContinue
}: {
    question: ChallengeQuestion
    answer: ChallengeAnswer
    onContinue: () => void
}) {
    const t = useTranslations('challenge')
    const answerElement = getElementByName(question.answerElementName)

    return (
        <div
            aria-live="polite"
            className={`mt-6 rounded-2xl border p-4 sm:p-5 ${answer.isCorrect ? 'border-emerald-200/30 bg-emerald-300/[0.08]' : 'border-amber-200/30 bg-amber-200/[0.08]'}`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${answer.isCorrect ? 'bg-emerald-200/15 text-emerald-100' : 'bg-amber-200/15 text-amber-100'}`}>
                        {answer.isCorrect ? <Check className="h-4 w-4" aria-hidden="true" /> : <Lightbulb className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0">
                        <p className="font-bold text-white">{answer.isCorrect ? t('feedback.correct') : t('feedback.learning-moment')}</p>
                        <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">
                            <QuestionExplanation question={question} />
                        </p>
                        {answerElement ? (
                            <a href={answerElement.wiki} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-[#9CCAD3] underline-offset-4 hover:underline">
                                {t('feedback.learn-more', { element: answerElement.name })}
                            </a>
                        ) : null}
                    </div>
                </div>
                <Button type="button" onClick={onContinue} className="min-h-11 shrink-0 rounded-xl bg-white text-[#0B141B] hover:bg-slate-200">
                    {t('continue')}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
            </div>
        </div>
    )
}

function QuestionExplanation({ question }: { question: ChallengeQuestion }) {
    const t = useTranslations('challenge')

    if (question.kind === 'identity') {
        return <>{t('explanations.identity', { answer: question.answerElementName })}</>
    }
    if (question.kind === 'extreme') {
        const unit = question.property === 'atomic-mass'
            ? ' u'
            : question.property === 'melting-point' || question.property === 'boiling-point'
                ? '°C'
                : ''
        return <>{t('explanations.extreme', {
            answer: question.answerElementName,
            property: t(`properties.${question.property}`),
            value: `${question.answerValue}${unit}`
        })}</>
    }
    return <>{t('explanations.odd-one-out', {
        answer: question.answerElementName,
        property: t(`properties.${question.property}`),
        answerValue: formatPropertyValue(question.property, question.answerValue),
        commonValue: formatPropertyValue(question.property, question.commonValue)
    })}</>
}

function ChallengeResult({
    session,
    onPlayAgain,
    onReturn
}: {
    session: ChallengeSession
    onPlayAgain: () => void
    onReturn: () => void
}) {
    const t = useTranslations('challenge')
    const collectionT = useTranslations('collection')
    const progression = useProgression()
    const score = getChallengeScore(session)
    const duration = Math.max(0, Math.round(((session.completedAt || session.startedAt) - session.startedAt) / 1000))
    const newDiscoveries = progression ? session.questions.filter(question => {
        const answer = session.answers.find(item => item.questionId === question.id)
        const discovery = progression.discoveries[question.answerElementName]
        return answer?.isCorrect && discovery?.firstEventId === `challenge:${session.id}:${question.id}`
    }) : []
    const discoveredCount = progression ? Object.keys(progression.discoveries).length : 0

    return (
        <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#9CCAD3]/40 bg-[#0B141B]/95 text-white shadow-2xl backdrop-blur-xl">
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-9 text-center sm:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,185,255,0.2),transparent_58%)]" />
                <div className="relative">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#73B9FF]/15 text-[#C8E6EC]">
                        <FlaskConical className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[#9CCAD3]">{t('result.eyebrow')}</p>
                    <h1 className="mt-2 text-4xl font-black tracking-[-0.03em] sm:text-5xl">{t('result.title')}</h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300">{t(`result.summary.${score >= 4 ? 'strong' : score >= 2 ? 'steady' : 'curious'}`)}</p>
                </div>
            </div>

            <div className="space-y-7 p-5 sm:p-8">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <Check className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                        <p className="mt-3 text-xs text-slate-400">{t('result.score')}</p>
                        <p className="mt-1 text-2xl font-black">{score} / {session.questions.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <Clock3 className="h-4 w-4 text-[#9CCAD3]" aria-hidden="true" />
                        <p className="mt-3 text-xs text-slate-400">{t('result.time')}</p>
                        <p className="mt-1 text-2xl font-black">{formatDuration(duration)}</p>
                    </div>
                </div>

                {progression ? (
                    <div className="rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.06] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">{collectionT('progress')}</p>
                        <p className="mt-2 text-lg font-black">{collectionT('discovered-count', { count: discoveredCount, total: 118 })}</p>
                        {newDiscoveries.length > 0 ? <p className="mt-1 text-sm text-slate-300">{collectionT('new-discoveries', { elements: newDiscoveries.map(question => question.answerElementName).join(', ') })}</p> : null}
                    </div>
                ) : null}

                <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#9CCAD3]">{t('result.review')}</h2>
                    <div className="mt-3 space-y-2">
                        {session.questions.map((question, index) => {
                            const answer = session.answers.find(item => item.questionId === question.id)
                            return (
                                <div key={question.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${answer?.isCorrect ? 'bg-emerald-200/15 text-emerald-100' : 'bg-amber-200/15 text-amber-100'}`}>
                                        {answer?.isCorrect ? '✓' : index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t(`modes.${question.kind}.title`)}</p>
                                        <p className="mt-1 break-words text-sm leading-relaxed text-slate-300"><QuestionExplanation question={question} /></p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Button type="button" onClick={onPlayAgain} className="min-h-14 rounded-xl bg-[#73B9FF] font-bold text-[#071319] hover:bg-[#91C9FF]">
                        <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" />
                        {t('result.play-again')}
                    </Button>
                    <Button type="button" variant="outline" onClick={onReturn} className="min-h-14 rounded-xl border-white/15 bg-transparent text-slate-200 hover:bg-white/5 hover:text-white">
                        {t('result.back-to-lab')}
                    </Button>
                    <Button asChild variant="outline" className="min-h-14 rounded-xl border-emerald-200/25 bg-emerald-200/[0.05] text-emerald-100 hover:bg-emerald-200/10 hover:text-white">
                        <Link href="/collection">{collectionT('view')}</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
}

function formatPropertyValue(property: string, value: string): string {
    if (property !== 'element-type') return value
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace('Reactive Non Metal', 'Reactive Non-Metal')
}
