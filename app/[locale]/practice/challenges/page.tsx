import { getPracticeMetadata } from '@/lib/practice-metadata'
import Footer from '@/components/footer'
import GameHeader from '@/components/game-header'
import { GuideSection } from '@/components/guide-section'
import PracticeBoard from '@/components/practice-board'
import { GameGuideProvider } from '@/contexts/game-guide-context'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    return getPracticeMetadata(locale, 'challenges')
}

export default function ElementChallengesPage() {
    return (
        <GameGuideProvider>
            <main className="min-h-screen p-4">
                <GameHeader />
                <PracticeBoard />
                <GuideSection />
                <Footer />
            </main>
        </GameGuideProvider>
    )
}
