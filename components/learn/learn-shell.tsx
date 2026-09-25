import { useLearningCopy } from '@/lib/learning-copy'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import LearningLanguageSwitcher from './learning-language-switcher'
import Footer from '@/components/footer'
import styles from './learn.module.css'

export default function LearnShell({ children }: { children: ReactNode }) {
    const t = useLearningCopy()
    const locale = useLocale()

    return (
        <main dir={locale === 'ar' ? 'rtl' : 'ltr'} className={styles.shell}>
            <a href="#lesson" className="sr-only focus:not-sr-only focus:block focus:p-3">{t("Skip to learning content")}</a>
            <nav aria-label={t("Main navigation")} className={styles.nav}>
                <Link href="/" className={styles.brand}>elemendle<span className="text-[#73B9FF]">.</span></Link>
                <div className="flex flex-wrap gap-2"><Link href="/">{t("Daily")}</Link><Link href="/practice">{t("Practice")}</Link><Link href="/learn">{t("Learn")}</Link><LearningLanguageSwitcher /></div>
            </nav>
            <div id="lesson" className={styles.article}>{children}</div>
            <Footer />
        </main>
    )
}
