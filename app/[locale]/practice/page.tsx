import Footer from '@/components/footer'
import GameHeader from '@/components/game-header'
import { GuideSection } from '@/components/guide-section'
import PracticeBoard from '@/components/practice-board'
import { GameGuideProvider } from '@/contexts/game-guide-context'

export default function PracticePage() {
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
