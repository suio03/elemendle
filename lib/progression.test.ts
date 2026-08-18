import { beforeEach, describe, expect, it } from 'vitest'
import { applyDiscovery, getInitialProgressionData, getPeriodicPositions, getStoredProgressionData, mergeProgressionData, normalizeProgressionData, PROGRESSION_STORAGE_KEY, recordElementDiscovery } from '@/lib/progression'

describe('element progression', () => {
    beforeEach(() => localStorage.clear())

    it('discovers an element once per settled event', () => {
        const first = applyDiscovery(getInitialProgressionData(), { eventId: 'daily:1', elementName: 'Oxygen', source: 'daily', attempts: 3, timeTaken: 20, discoveredAt: '2026-01-01T00:00:00.000Z' })
        const duplicate = applyDiscovery(first.data, { eventId: 'daily:1', elementName: 'Oxygen', source: 'daily', attempts: 3, timeTaken: 20 })
        expect(first.outcome.isNew).toBe(true)
        expect(duplicate.data.discoveries.Oxygen.successCount).toBe(1)
    })

    it('combines sources while preserving best performance', () => {
        const first = applyDiscovery(getInitialProgressionData(), { eventId: 'daily:1', elementName: 'Oxygen', source: 'daily', attempts: 5, timeTaken: 40 })
        const second = applyDiscovery(first.data, { eventId: 'classic:2', elementName: 'Oxygen', source: 'classic', attempts: 3, timeTaken: 25 })
        expect(second.data.discoveries.Oxygen).toMatchObject({ sources: ['daily', 'classic'], successCount: 2, bestAttempts: 3, bestTime: 25 })
        expect(second.outcome.isNew).toBe(false)
    })

    it('stores independently and recovers from damaged data', () => {
        recordElementDiscovery({ eventId: 'challenge:1', elementName: 'Carbon', source: 'challenge' })
        expect(getStoredProgressionData().discoveries.Carbon).toBeDefined()
        localStorage.setItem(PROGRESSION_STORAGE_KEY, '{broken')
        expect(getStoredProgressionData()).toEqual(getInitialProgressionData())
    })

    it('places all 118 elements exactly once in the periodic layout', () => {
        const elementPositions = getPeriodicPositions().filter(position => position.atomicNumber)
        expect(elementPositions).toHaveLength(118)
        expect(new Set(elementPositions.map(position => position.atomicNumber)).size).toBe(118)
    })

    it('merges imported discoveries without double-counting repeated exports', () => {
        const first = applyDiscovery(getInitialProgressionData(), {
            eventId: 'daily:1',
            elementName: 'Hydrogen',
            source: 'daily',
            attempts: 4,
            timeTaken: 30,
            discoveredAt: '2026-08-17T00:00:00.000Z'
        }).data
        const improved = applyDiscovery(first, {
            eventId: 'classic:1',
            elementName: 'Hydrogen',
            source: 'classic',
            attempts: 2,
            timeTaken: 20,
            discoveredAt: '2026-08-18T00:00:00.000Z'
        }).data
        const merged = mergeProgressionData(first, improved)

        expect(merged.discoveries.Hydrogen).toMatchObject({
            firstSource: 'daily',
            successCount: 2,
            bestAttempts: 2,
            bestTime: 20,
            sources: ['daily', 'classic']
        })
        expect(mergeProgressionData(merged, improved)).toEqual(merged)
    })

    it('unions disjoint discovery events for the same element', () => {
        const firstDevice = applyDiscovery(getInitialProgressionData(), {
            eventId: 'daily:80',
            elementName: 'Hydrogen',
            source: 'daily',
            discoveredAt: '2026-08-17T00:00:00.000Z'
        }).data
        const secondDevice = applyDiscovery(getInitialProgressionData(), {
            eventId: 'classic:80',
            elementName: 'Hydrogen',
            source: 'classic',
            discoveredAt: '2026-08-18T00:00:00.000Z'
        }).data

        const merged = mergeProgressionData(firstDevice, secondDevice)
        expect(merged.discoveries.Hydrogen).toMatchObject({
            successCount: 2,
            sources: ['daily', 'classic']
        })
        expect(mergeProgressionData(merged, firstDevice)).toEqual(merged)
    })

    it('migrates and unions disjoint v1 discovery records', () => {
        const legacyDevice = (eventId: string, source: 'daily' | 'classic') => normalizeProgressionData({
            version: 1,
            discoveries: {
                Hydrogen: {
                    elementName: 'Hydrogen',
                    firstDiscoveredAt: source === 'daily' ? '2026-08-17T00:00:00.000Z' : '2026-08-18T00:00:00.000Z',
                    firstSource: source,
                    sources: [source],
                    successCount: 1,
                    bestAttempts: 3,
                    bestTime: 20,
                    firstEventId: eventId
                }
            },
            settledEvents: [eventId]
        })

        const merged = mergeProgressionData(
            legacyDevice('daily:80', 'daily'),
            legacyDevice('classic:80', 'classic')
        )
        expect(merged.discoveries.Hydrogen.successCount).toBe(2)
    })
})
