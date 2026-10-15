import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export async function getPracticeMetadata(locale: string, game?: 'challenges' | 'classic') {
    const t = await getTranslations({ locale, namespace: 'practice-hub' })
    const titleKey = game === 'challenges' ? 'challenge-title' : game === 'classic' ? 'classic-title' : 'title'
    const descriptionKey = game === 'challenges' ? 'challenge-description' : game === 'classic' ? 'classic-description' : 'description'
    const path = `/practice${game ? `/${game}` : ''}`
    const url = (language: string) => `https://elemendle.com${language === 'en' ? '' : `/${language}`}${path}`
    return {
        title: `${t(titleKey)} | Elemendle`,
        description: t(descriptionKey),
        alternates: {
            canonical: url(locale),
            languages: { ...Object.fromEntries(routing.locales.map(language => [language, url(language)])), 'x-default': url('en') }
        }
    }
}
