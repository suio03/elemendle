import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/routing'
import Footer from '@/components/footer'
import RiddlesArticle from './riddles-article'

const url = 'https://elemendle.com/learn/periodic-table-riddles'
const title = '12 Periodic Table Riddles with Answers | Elemendle'
const description = 'Solve 12 original periodic table riddles with answers and step-by-step explanations. Learn to combine element clues, then practice with Elemendle.'
type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    if ((await params).locale !== 'en') notFound()

    return {
        title,
        description,
        alternates: { canonical: url, languages: { en: url, 'x-default': url } },
        openGraph: { title, description, url, type: 'article', locale: 'en_US', siteName: 'Elemendle' },
        twitter: { card: 'summary', title, description }
    }
}

export default async function RiddlesPage({ params }: Props) {
    if ((await params).locale !== 'en') notFound()

    return (
        <main className="mx-auto max-w-5xl px-4 pb-6 pt-6 text-slate-100 sm:px-8 sm:pt-10">
            <a href="#guide" className="sr-only focus:not-sr-only focus:mb-4 focus:block focus:rounded focus:bg-[#73B9FF] focus:p-3 focus:text-[#071319]">Skip to guide</a>
            <nav aria-label="Main navigation" className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#9CCAD3]/25 pb-5">
                <Link href="/" locale="en" className="rounded text-xl font-bold tracking-tight text-[#B9DCE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73B9FF]">elemendle<span className="text-[#73B9FF]">.</span></Link>
                <Link href="/practice" locale="en" className="inline-flex min-h-11 items-center rounded-lg border border-[#9CCAD3]/40 bg-[#10171D] px-4 text-sm font-semibold text-[#B9DCE3] transition hover:border-[#73B9FF] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#73B9FF]">Play Element Challenges <span aria-hidden="true" className="ml-2">↗</span></Link>
            </nav>
            <div id="guide"><RiddlesArticle /></div>
            <Footer />
        </main>
    )
}
