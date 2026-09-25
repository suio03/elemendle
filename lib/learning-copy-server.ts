import { getTranslations } from 'next-intl/server'
import { createLearningCopy } from '@/lib/learning-copy'

export async function getLearningCopy(locale?: string) {
    return createLearningCopy(await (locale ? getTranslations({ locale, namespace: 'learning' }) : getTranslations('learning')))
}
