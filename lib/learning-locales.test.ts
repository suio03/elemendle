// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createTranslator } from 'next-intl'
import { routing } from '@/i18n/routing'
import { learningKey } from '@/lib/learning-copy'
import { firstTwenty, lessonQuizzes } from '@/lib/learn-content'
import english from '@/messages/en/learning.json'

const tokens = (text: string) => Array.from(text.matchAll(/\{(\w+)\}|<\/?(tag\d+)>/g)).map(match => match[0]).sort()

describe('learning translations', () => {
    for (const locale of routing.locales) {
        it(`${locale} includes every lesson, metadata and interactive message with valid formatting`, () => {
            const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}/learning.json`, import.meta.url), 'utf8')) as Record<string, string>
            expect(Object.keys(messages).sort()).toEqual(Object.keys(english).sort())
            const formatErrors: string[] = []
            const t = createTranslator({ locale, messages, onError: error => formatErrors.push(error.message) })
            for (const [key, source] of Object.entries(english)) {
                const translated = messages[key]
                expect(translated.trim(), `${locale}: ${source}`).not.toBe('')
                expect(tokens(translated), `${locale}: ${source}`).toEqual(tokens(source))
                const values: Record<string, string | ((chunks: unknown) => string)> = {}
                for (const match of Array.from(source.matchAll(/\{(\w+)\}/g))) values[match[1]] = '2'
                for (const match of Array.from(source.matchAll(/<(tag\d+)>/g))) values[match[1]] = chunks => String(chunks)
                const rendered = t.rich(key, values)
                expect(rendered, `${locale}: ${source}`).toBeTruthy()
                expect(String(rendered), `${locale}: ${source}`).not.toMatch(/<\/?tag\d+>/)
            }
            expect(formatErrors).toEqual([])
            for (const element of firstTwenty) expect(messages[learningKey(element.name)]).toBeTruthy()
            for (const questions of Object.values(lessonQuizzes)) {
                for (const question of questions) {
                    for (const source of [question.prompt, ...question.choices, question.explanation]) {
                        expect(messages[learningKey(source)], `${locale}: ${source}`).toBeTruthy()
                    }
                }
            }
            for (const symbol of ['S', 'Na', 'Ne', 's']) expect(messages[learningKey(symbol)]).toBe(symbol)
        })
    }
})
