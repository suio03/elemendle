import CollectionBoard from '@/components/collection-board'
import Footer from '@/components/footer'
import GameHeader from '@/components/game-header'
import { GuideSection } from '@/components/guide-section'
import { GameGuideProvider } from '@/contexts/game-guide-context'

export const runtime = 'edge'

export default function CollectionPage() {
    return <GameGuideProvider><main className="min-h-screen p-4"><GameHeader /><CollectionBoard /><GuideSection /><Footer /></main></GameGuideProvider>
}
