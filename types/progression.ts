export type DiscoverySource = 'daily' | 'classic' | 'challenge'

export interface ElementDiscovery {
    elementName: string
    firstDiscoveredAt: string
    firstSource: DiscoverySource
    sources: DiscoverySource[]
    successCount: number
    bestAttempts: number | null
    bestTime: number | null
    firstEventId: string
}

export interface DiscoveryEvent {
    id: string
    elementName: string
    source: DiscoverySource
    attempts: number | null
    timeTaken: number | null
    discoveredAt: string
}

export interface ProgressionData {
    version: 2
    baselineDiscoveries: Record<string, ElementDiscovery>
    legacyEventIds: string[]
    events: DiscoveryEvent[]
    discoveries: Record<string, ElementDiscovery>
}

export interface DiscoveryInput {
    eventId: string
    elementName: string
    source: DiscoverySource
    attempts?: number
    timeTaken?: number
    discoveredAt?: string
}

export interface DiscoveryOutcome {
    discovery: ElementDiscovery
    isNew: boolean
    discoveredCount: number
}

export interface PeriodicPosition {
    atomicNumber?: number
    row: number
    column: number
    series?: 'lanthanide' | 'actinide'
    placeholder?: 'lanthanide' | 'actinide'
}
