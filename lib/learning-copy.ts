import { useTranslations } from 'next-intl'
import type { TranslationValues, RichTranslationValues } from 'next-intl'

// Stable source-based keys keep long editorial text readable in JSX.
export function learningKey(source: string): string {
    let hash = 2166136261
    for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619)
    return `text_${(hash >>> 0).toString(16)}`
}
export function createLearningCopy(translate: ReturnType<typeof useTranslations>) {
    return Object.assign(
        (source: string, values?: TranslationValues) => translate(learningKey(source), values),
        { rich: (source: string, values?: RichTranslationValues) => translate.rich(learningKey(source), values) }
    )
}
export function useLearningCopy() {
    return createLearningCopy(useTranslations('learning'))
}
