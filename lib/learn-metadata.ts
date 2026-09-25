import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { getLearningCopy } from '@/lib/learning-copy-server'

export type LearnPageProps = { params: Promise<{ locale: string }> }
export function languageTag(locale: string) {
    return locale === 'ch' ? 'zh-Hans' : locale === 'jp' ? 'ja' : locale
}
export function learningUrl(path: string, locale: string) {
    return `https://elemendle.com${locale === 'en' ? '' : `/${locale}`}${path}`
}
export async function learnMetadata(path: string, title: string, description: string, locale: string): Promise<Metadata> {
    const t = await getLearningCopy(locale)
    const url = learningUrl(path, locale)
    const languages = Object.fromEntries(routing.locales.map(language => [languageTag(language), learningUrl(path, language)]))
    return {
        title: `${t(title)} | Elemendle`, description: t(description),
        alternates: { canonical: url, languages: { ...languages, 'x-default': learningUrl(path, 'en') } },
        openGraph: { title: t(title), description: t(description), url, type: 'website', locale: languageTag(locale), siteName: 'Elemendle' },
        twitter: { card: 'summary', title: t(title), description: t(description) }
    }
}
