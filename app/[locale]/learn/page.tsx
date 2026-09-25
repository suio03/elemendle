import { getLearningCopy } from '@/lib/learning-copy-server'
import { Link } from '@/i18n/routing'
import LearnShell from '@/components/learn/learn-shell'
import styles from '@/components/learn/learn.module.css'
import { learnMetadata, type LearnPageProps } from '@/lib/learn-metadata'

export async function generateMetadata({ params }: LearnPageProps) {
    return learnMetadata('/learn', 'Learn the Periodic Table by Playing', 'Learn to read element clues, get to know the first 20 elements, and check your understanding with short quizzes and original riddles.', (await params).locale)
}
export default async function LearnPage({ params }: LearnPageProps) {
    const t = await getLearningCopy()

    return <LearnShell>
        <header className={styles.hero}>
            <p className={styles.eyebrow}>{t("The Elemendle field guide")}</p>
            <h1>{t("A little knowledge.")}<br /><span>{t("A better next guess.")}</span></h1>
            <p>{t("Get to know the elements, make sense of the clues, and put an idea into practice. Start wherever you feel curious.")}</p>
            <div className={styles.meta}><span>{t("Two short lessons")}</span><span>{t("Three questions per lesson")}</span><span>{t("No account needed")}</span></div>
        </header>
        <section className={styles.section} aria-label={t("Choose a lesson")}>
            <div className={styles.cards}>
                <Link href="/properties" className={`${styles.card} !no-underline`}><span className={styles.number}>{t("01 / READ THE CLUES")}</span><h2>{t("Turn feedback into your next guess.")}</h2><p>{t("Understand arrows, groups, periods and element types. Follow one worked example, then try three questions.")}</p><span className={styles.go}>{t("Read the clues guide →")}</span></Link>
                <Link href="/learn/first-20-elements" className={`${styles.card} !no-underline`}><span className={styles.number}>{t("02 / MEET THE ELEMENTS")}</span><h2>{t("Start with the first twenty.")}</h2><p>{t("Learn the names and symbols from hydrogen to calcium. Explore their positions and check what you remember.")}</p><span className={styles.go}>{t("Meet the first 20 elements →")}</span></Link>
            </div>
        </section>
        <section className={styles.section}>
            <p className={styles.eyebrow}>{t("Put the clues together")}</p><h2>{t("Twelve riddles. Twelve discoveries.")}</h2>
            <p>{t("Try our original element riddles, from familiar everyday clues to a little more detective work. Reveal each answer when you are ready, with the reasoning underneath.")}</p>
            <Link href="/learn/periodic-table-riddles" className={styles.button}>{t("Solve the element riddles →")}</Link>
        </section>
        <section className={styles.section}><h2>{t("Ready for a game?")}</h2><p>{t("Use what you have learned in today’s puzzle, or keep exploring with Element Challenges.")}</p><div className="flex flex-wrap items-center gap-5"><Link href="/" className={styles.button}>{t("Play today’s Elemendle →")}</Link><Link href="/practice">{t("Try Element Challenges")}</Link></div></section>
    </LearnShell>
}
