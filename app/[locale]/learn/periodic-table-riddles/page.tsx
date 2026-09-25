import { Link } from '@/i18n/routing'
import LearnShell from '@/components/learn/learn-shell'
import { getLearningCopy } from '@/lib/learning-copy-server'
import { learnMetadata, type LearnPageProps } from '@/lib/learn-metadata'
import RiddlesArticle from './riddles-article'

export async function generateMetadata({ params }: LearnPageProps) {
    return learnMetadata('/learn/periodic-table-riddles', '12 Periodic Table Riddles with Answers', 'Solve 12 original periodic table riddles with answers and step-by-step explanations. Learn to combine element clues, then practice with Elemendle.', (await params).locale)
}
export default async function RiddlesPage() {
    const t = await getLearningCopy()
    return <LearnShell>
        <div className="px-5 pt-5 sm:px-10"><Link href="/learn" className="inline-flex min-h-11 items-center text-sm text-[#B9DCE3] underline underline-offset-4">{t('← All learning guides')}</Link></div>
        <RiddlesArticle />
    </LearnShell>
}
