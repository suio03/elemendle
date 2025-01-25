import GameHeader from '@/components/game-header'
import GameBoard from '@/components/game-board'
import Footer from '@/components/footer'
import { GameGuideProvider } from '@/contexts/game-guide-context'
import { GuideSection } from '@/components/guide-section'
export const runtime = 'edge';
export default function Home() {
    return (
        <GameGuideProvider>
            <main className="min-h-screen relative p-4">
                <GameHeader />
                <GameBoard />
                <GuideSection />
                <Footer />
            </main>
        </GameGuideProvider>
    )
}