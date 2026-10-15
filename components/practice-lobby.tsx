import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowRight, Dices, FlaskConical, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default async function PracticeLobby() {
    const [t, challengeT, locale] = await Promise.all([
        getTranslations('practice-hub'), getTranslations('challenge'), getLocale()
    ])
    const games = [
        { id: 'challenges', title: t('challenge-title'), description: t('challenge-description'), detail: t('challenge-detail'), Icon: Sparkles, color: 'text-sky-200', background: 'bg-sky-200/10' },
        { id: 'classic', title: t('classic-title'), description: t('classic-description'), detail: t('classic-detail'), Icon: Dices, color: 'text-amber-200', background: 'bg-amber-200/10' }
    ]

    return (
        <section dir={locale === 'ar' ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#9CCAD3]/40 bg-[#0B141B]/95 text-white shadow-2xl backdrop-blur-xl">
            <header className="border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9CCAD3]">
                    <FlaskConical className="h-5 w-5" aria-hidden="true" />{challengeT('eyebrow')}
                </p>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{t('title')}</h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">{t('description')}</p>
            </header>
            <div className="grid gap-4 p-5 sm:p-8 md:grid-cols-2">
                {games.map(({ id, title, description, detail, Icon, color, background }) => (
                    <Link key={id} href={`/practice/${id}`} className="group flex flex-col rounded-2xl border border-white/15 bg-white/[0.035] p-5 transition hover:border-[#9CCAD3]/60 hover:bg-white/[0.065] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9CCAD3] sm:p-6">
                        <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} ${background}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
                        <h2 className="mt-5 text-xl font-bold">{title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
                        <p className={`mb-6 mt-4 text-xs leading-relaxed ${color}`}>{detail}</p>
                        <span className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm font-semibold text-[#C8E6EC]">{t('choose')}<ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" /></span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
