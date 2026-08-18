import ClassicPracticeBoard from '@/components/classic-practice-board'
import Footer from '@/components/footer'
import GameHeader from '@/components/game-header'
import { GuideSection } from '@/components/guide-section'
import { GameGuideProvider } from '@/contexts/game-guide-context'

export default function ClassicPracticePage() {
    return (
        <GameGuideProvider>
            <main className="min-h-screen p-4">
                <GameHeader />
                <ClassicPracticeBoard />
                <GuideSection />
                <Footer />
            </main>
        </GameGuideProvider>
    )
}
