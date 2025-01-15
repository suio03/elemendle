import GameHeader from '@/components/game-header'
import GameBoard from '@/components/game-board'
import HowToPlay from '@/components/how-to-play'
import Features from '@/components/features'
import Tips from '@/components/tips'
import Faq from '@/components/faq'
import Footer from '@/components/footer'

export const runtime = 'edge';
export default function Home() {
    return (
        <main className="min-h-screen relative p-4">
            <GameHeader />
            <GameBoard />
            <HowToPlay />
            <Features />
            <Tips />
            <Faq />
            <Footer />
        </main>
    )
}