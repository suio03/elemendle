import { redirect } from '@/i18n/routing'

// Temporarily hidden while the learning direction is reconsidered.
// Keep the implementation and saved progress available for a future iteration.
export default async function MoleculeOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    redirect({ href: '/practice', locale })
}
