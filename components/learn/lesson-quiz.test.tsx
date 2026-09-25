import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LessonQuiz from './lesson-quiz'
import { NextIntlClientProvider } from 'next-intl'
import learning from '@/messages/en/learning.json'
import { lessonQuizzes } from '@/lib/learn-content'

let container: HTMLDivElement
let root: Root
beforeEach(() => {
    vi.stubGlobal('React', React)
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    window.plausible = vi.fn(() => {})
    window.gtag = vi.fn()
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
})
afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
})
async function click(text: string) {
    const button = Array.from(container.querySelectorAll('button')).find(el => el.textContent?.includes(text))!
    expect(button, text).toBeTruthy()
    expect(button.disabled).toBe(false)
    await act(async () => button.click())
}
async function choose(index: number) {
    await act(async () => (container.querySelectorAll('input')[index] as HTMLInputElement).click())
}

describe('lesson quizzes', () => {
    it('requires an answer, explains mistakes, locks checked answers, scores and resets without changing game storage', async () => {
        localStorage.setItem('existing-game', 'unchanged')
        await act(async () => root.render(<NextIntlClientProvider locale="en" messages={{ learning }} timeZone="UTC"><LessonQuiz lesson="clues" /></NextIntlClientProvider>))
        expect(container.querySelector('button')?.disabled).toBe(true)
        await choose(1)
        await click('Check answer')
        expect(container.querySelector('[role="status"]')?.textContent).toContain(lessonQuizzes.clues[0].explanation)
        expect(container.querySelector('fieldset')?.disabled).toBe(true)
        await click('Next question')
        await choose(2)
        await click('Check answer')
        await click('Next question')
        await choose(1)
        await click('Check answer')
        await click('See results')
        expect(container.textContent).toContain('2 of 3 correct')
        expect(window.plausible).toHaveBeenCalledWith('learn_quiz_completed', { props: { lesson: 'clues', correctAnswers: 2, total: 3 } })
        expect(vi.mocked(window.plausible!).mock.calls.filter(call => call[0] === 'learn_quiz_completed')).toHaveLength(1)
        await click('Try again')
        expect(container.textContent).toContain('Question 1 of 3')
        expect(container.querySelector('button')?.disabled).toBe(true)
        expect(localStorage.getItem('existing-game')).toBe('unchanged')
        expect(localStorage.length).toBe(1)
    })
    it('completes the first-20 quiz with distinct lesson attribution', async () => {
        await act(async () => root.render(<NextIntlClientProvider locale="en" messages={{ learning }} timeZone="UTC"><LessonQuiz lesson="first-20" /></NextIntlClientProvider>))
        for (const [i, question] of Array.from(lessonQuizzes['first-20'].entries())) {
            await choose(question.answer)
            await click('Check answer')
            await click(i === 2 ? 'See results' : 'Next question')
        }
        expect(container.textContent).toContain('3 of 3 correct')
        expect(window.plausible).toHaveBeenCalledWith('learn_quiz_started', { props: { lesson: 'first-20' } })
        expect(window.plausible).toHaveBeenCalledWith('learn_quiz_completed', { props: { lesson: 'first-20', correctAnswers: 3, total: 3 } })
    })
})
