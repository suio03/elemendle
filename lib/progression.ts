import elementsData from '@/data/atom.json'
import type { Element } from '@/types/element'
import type {
    DiscoveryEvent,
    DiscoveryInput,
    DiscoveryOutcome,
    DiscoverySource,
    ElementDiscovery,
    PeriodicPosition,
    ProgressionData
} from '@/types/progression'

export const PROGRESSION_STORAGE_KEY = 'elemendle-progression-v2'
export const LEGACY_PROGRESSION_STORAGE_KEY = 'elemendle-progression-v1'
export const PROGRESSION_UPDATED_EVENT = 'elemendle:progression-updated'
const VERSION = 2
const SOURCES: DiscoverySource[] = ['daily', 'classic', 'challenge']
const ELEMENT_NAMES = new Set(Object.values(elementsData).map(element => element.name))

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function positiveNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function isoDate(value: unknown, fallback = new Date().toISOString()): string {
    if (typeof value !== 'string') return fallback
    const timestamp = Date.parse(value)
    return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : fallback
}

function normalizeDiscovery(value: unknown, elementName: string): ElementDiscovery | null {
    if (!isRecord(value) || !ELEMENT_NAMES.has(elementName) ||
        typeof value.firstDiscoveredAt !== 'string' ||
        !SOURCES.includes(value.firstSource as DiscoverySource) ||
        typeof value.firstEventId !== 'string') return null

    const sources = Array.isArray(value.sources)
        ? Array.from(new Set(value.sources.filter(source => SOURCES.includes(source as DiscoverySource)))) as DiscoverySource[]
        : [value.firstSource as DiscoverySource]

    return {
        elementName,
        firstDiscoveredAt: isoDate(value.firstDiscoveredAt),
        firstSource: value.firstSource as DiscoverySource,
        sources: sources.length > 0 ? sources : [value.firstSource as DiscoverySource],
        successCount: typeof value.successCount === 'number' && Number.isInteger(value.successCount) && value.successCount > 0 ? value.successCount : 1,
        bestAttempts: positiveNumber(value.bestAttempts),
        bestTime: positiveNumber(value.bestTime),
        firstEventId: value.firstEventId
    }
}

function normalizeEvent(value: unknown): DiscoveryEvent | null {
    if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0 ||
        typeof value.elementName !== 'string' || !ELEMENT_NAMES.has(value.elementName) ||
        !SOURCES.includes(value.source as DiscoverySource) ||
        typeof value.discoveredAt !== 'string' || !Number.isFinite(Date.parse(value.discoveredAt))) return null

    return {
        id: value.id,
        elementName: value.elementName,
        source: value.source as DiscoverySource,
        attempts: positiveNumber(value.attempts),
        timeTaken: positiveNumber(value.timeTaken),
        discoveredAt: isoDate(value.discoveredAt)
    }
}

function mergeDiscoveryRecords(
    current: ElementDiscovery,
    imported: ElementDiscovery
): ElementDiscovery {
    const first = imported.firstDiscoveredAt < current.firstDiscoveredAt ? imported : current
    return {
        ...first,
        sources: Array.from(new Set([...current.sources, ...imported.sources]))
            .sort((left, right) => SOURCES.indexOf(left) - SOURCES.indexOf(right)),
        successCount: Math.max(current.successCount, imported.successCount),
        bestAttempts: minimumNullable(current.bestAttempts, imported.bestAttempts),
        bestTime: minimumNullable(current.bestTime, imported.bestTime)
    }
}

function buildDiscoveries(
    baselineDiscoveries: Record<string, ElementDiscovery>,
    events: DiscoveryEvent[],
    legacyEventIds: string[]
): Record<string, ElementDiscovery> {
    const discoveries = { ...baselineDiscoveries }
    const ignoredIds = new Set(legacyEventIds)
    const orderedEvents = [...events].sort((left, right) =>
        left.discoveredAt.localeCompare(right.discoveredAt) ||
        SOURCES.indexOf(left.source) - SOURCES.indexOf(right.source) ||
        left.id.localeCompare(right.id)
    )

    for (const event of orderedEvents) {
        if (ignoredIds.has(event.id)) continue
        const existing = discoveries[event.elementName]
        if (!existing) {
            discoveries[event.elementName] = {
                elementName: event.elementName,
                firstDiscoveredAt: event.discoveredAt,
                firstSource: event.source,
                sources: [event.source],
                successCount: 1,
                bestAttempts: event.attempts,
                bestTime: event.timeTaken,
                firstEventId: event.id
            }
            continue
        }

        const eventWasFirst = event.discoveredAt <= existing.firstDiscoveredAt
        discoveries[event.elementName] = {
            ...existing,
            firstDiscoveredAt: eventWasFirst ? event.discoveredAt : existing.firstDiscoveredAt,
            firstSource: eventWasFirst ? event.source : existing.firstSource,
            firstEventId: eventWasFirst ? event.id : existing.firstEventId,
            sources: Array.from(new Set([...existing.sources, event.source]))
                .sort((left, right) => SOURCES.indexOf(left) - SOURCES.indexOf(right)),
            successCount: existing.successCount + 1,
            bestAttempts: minimumNullable(existing.bestAttempts, event.attempts),
            bestTime: minimumNullable(existing.bestTime, event.timeTaken)
        }
    }

    return discoveries
}

function migrateLegacyProgression(value: UnknownRecord): ProgressionData {
    const baselineDiscoveries: Record<string, ElementDiscovery> = {}
    const events: DiscoveryEvent[] = []
    const firstEventIds = new Set<string>()

    if (isRecord(value.discoveries)) {
        for (const [name, raw] of Object.entries(value.discoveries)) {
            const discovery = normalizeDiscovery(raw, name)
            if (!discovery) continue
            firstEventIds.add(discovery.firstEventId)
            events.push({
                id: discovery.firstEventId,
                elementName: name,
                source: discovery.firstSource,
                attempts: discovery.bestAttempts,
                timeTaken: discovery.bestTime,
                discoveredAt: discovery.firstDiscoveredAt
            })
            if (discovery.successCount > 1) {
                baselineDiscoveries[name] = {
                    ...discovery,
                    successCount: discovery.successCount - 1
                }
            }
        }
    }

    const legacyEventIds = Array.isArray(value.settledEvents)
        ? Array.from(new Set(value.settledEvents.filter((id): id is string =>
            typeof id === 'string' && !firstEventIds.has(id)
        ))).slice(-500)
        : []

    return {
        version: VERSION,
        baselineDiscoveries,
        legacyEventIds,
        events,
        discoveries: buildDiscoveries(baselineDiscoveries, events, legacyEventIds)
    }
}

export function getInitialProgressionData(): ProgressionData {
    return {
        version: VERSION,
        baselineDiscoveries: {},
        legacyEventIds: [],
        events: [],
        discoveries: {}
    }
}

export function normalizeProgressionData(value: unknown): ProgressionData {
    if (!isRecord(value)) return getInitialProgressionData()
    if (value.version === 1) return migrateLegacyProgression(value)
    if (value.version !== VERSION) return getInitialProgressionData()

    const baselineDiscoveries: Record<string, ElementDiscovery> = {}
    if (isRecord(value.baselineDiscoveries)) {
        for (const [name, raw] of Object.entries(value.baselineDiscoveries)) {
            const discovery = normalizeDiscovery(raw, name)
            if (discovery) baselineDiscoveries[name] = discovery
        }
    }
    const legacyEventIds = Array.isArray(value.legacyEventIds)
        ? Array.from(new Set(value.legacyEventIds.filter((id): id is string => typeof id === 'string'))).slice(-500)
        : []
    const events = Array.isArray(value.events)
        ? Array.from(new Map(
            value.events
                .map(normalizeEvent)
                .filter((event): event is DiscoveryEvent => event !== null)
                .map(event => [event.id, event])
        ).values())
        : []

    return {
        version: VERSION,
        baselineDiscoveries,
        legacyEventIds,
        events,
        discoveries: buildDiscoveries(baselineDiscoveries, events, legacyEventIds)
    }
}

export function getStoredProgressionData(): ProgressionData {
    if (typeof window === 'undefined') return getInitialProgressionData()
    try {
        const current = localStorage.getItem(PROGRESSION_STORAGE_KEY)
        if (current) return normalizeProgressionData(JSON.parse(current))

        const legacy = localStorage.getItem(LEGACY_PROGRESSION_STORAGE_KEY)
        const migrated = normalizeProgressionData(JSON.parse(legacy || 'null'))
        if (legacy) localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(migrated))
        return migrated
    } catch {
        return getInitialProgressionData()
    }
}

export function storeProgressionData(data: ProgressionData): void {
    if (typeof window === 'undefined') return
    const normalized = normalizeProgressionData(data)
    try {
        localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(normalized))
        window.dispatchEvent(new CustomEvent(PROGRESSION_UPDATED_EVENT, { detail: normalized }))
    } catch (error) {
        console.error('Failed to save element progression:', error)
    }
}

export function applyDiscovery(data: ProgressionData, input: DiscoveryInput): { data: ProgressionData; outcome: DiscoveryOutcome } {
    const normalized = normalizeProgressionData(data)
    const existing = normalized.discoveries[input.elementName]
    const eventExists = normalized.legacyEventIds.includes(input.eventId) ||
        normalized.events.some(event => event.id === input.eventId)
    if (eventExists && existing) {
        return { data: normalized, outcome: { discovery: existing, isNew: existing.firstEventId === input.eventId, discoveredCount: Object.keys(normalized.discoveries).length } }
    }

    const event: DiscoveryEvent = {
        id: input.eventId,
        elementName: input.elementName,
        source: input.source,
        attempts: positiveNumber(input.attempts),
        timeTaken: positiveNumber(input.timeTaken),
        discoveredAt: isoDate(input.discoveredAt)
    }
    const events = [...normalized.events, event]
    const discoveries = buildDiscoveries(normalized.baselineDiscoveries, events, normalized.legacyEventIds)
    const discovery = discoveries[input.elementName]
    const next: ProgressionData = {
        ...normalized,
        events,
        discoveries
    }
    return { data: next, outcome: { discovery, isNew: !existing, discoveredCount: Object.keys(next.discoveries).length } }
}

export function recordElementDiscovery(input: DiscoveryInput): DiscoveryOutcome {
    const result = applyDiscovery(getStoredProgressionData(), input)
    storeProgressionData(result.data)
    return result.outcome
}

export function getDiscoveryOutcome(data: ProgressionData, eventId: string, elementName: string): DiscoveryOutcome | null {
    const discovery = data.discoveries[elementName]
    const eventExists = data.legacyEventIds.includes(eventId) || data.events.some(event => event.id === eventId)
    if (!discovery || !eventExists) return null
    return { discovery, isNew: discovery.firstEventId === eventId, discoveredCount: Object.keys(data.discoveries).length }
}

function minimumNullable(left: number | null, right: number | null): number | null {
    if (left === null) return right
    if (right === null) return left
    return Math.min(left, right)
}

export function mergeProgressionData(
    currentValue: ProgressionData,
    importedValue: ProgressionData
): ProgressionData {
    const current = normalizeProgressionData(currentValue)
    const imported = normalizeProgressionData(importedValue)
    const baselineDiscoveries = { ...current.baselineDiscoveries }

    for (const [elementName, importedDiscovery] of Object.entries(imported.baselineDiscoveries)) {
        const currentDiscovery = baselineDiscoveries[elementName]
        if (!currentDiscovery) {
            baselineDiscoveries[elementName] = importedDiscovery
            continue
        }
        baselineDiscoveries[elementName] = mergeDiscoveryRecords(currentDiscovery, importedDiscovery)
    }

    const legacyEventIds = Array.from(new Set([
        ...current.legacyEventIds,
        ...imported.legacyEventIds
    ])).slice(-500)
    const events = Array.from(new Map([
        ...current.events,
        ...imported.events
    ].map(event => [event.id, event])).values())

    return {
        version: VERSION,
        baselineDiscoveries,
        legacyEventIds,
        events,
        discoveries: buildDiscoveries(baselineDiscoveries, events, legacyEventIds)
    }
}

export function getPeriodicPositions(): PeriodicPosition[] {
    const positions: PeriodicPosition[] = []
    for (const element of Object.values(elementsData) as Element[]) {
        const atomicNumber = Number(element.classic.atomic_number)
        if (atomicNumber >= 57 && atomicNumber <= 71) {
            positions.push({ atomicNumber, row: 9, column: atomicNumber - 54, series: 'lanthanide' })
        } else if (atomicNumber >= 89 && atomicNumber <= 103) {
            positions.push({ atomicNumber, row: 10, column: atomicNumber - 86, series: 'actinide' })
        } else {
            positions.push({ atomicNumber, row: Number(element.classic.period) + 1, column: Number(element.classic.group) })
        }
    }
    positions.push({ row: 7, column: 3, placeholder: 'lanthanide' })
    positions.push({ row: 8, column: 3, placeholder: 'actinide' })
    return positions
}
