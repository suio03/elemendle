import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import messages from '@/messages/en/i18n.json'
import MoleculeOrdersBoard from '@/components/molecule-orders-board'
import { getStoredMoleculeData } from '@/lib/molecule-storage'

vi.mock('@/i18n/routing', () => ({
    Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => React.createElement('a', props, children)
}))
let container: HTMLDivElement
let root: Root
async function mount() {
    root = createRoot(container)
    await act(async () => root.render(<NextIntlClientProvider locale="en" messages={messages} timeZone="UTC"><MoleculeOrdersBoard /></NextIntlClientProvider>))
}
async function click(text: string) {
    const button = Array.from(container.querySelectorAll('button')).find(el => (el.getAttribute('aria-label') || el.textContent?.trim()) === text)
    expect(button, text).toBeDefined()
    expect(button!.disabled).toBe(false)
    await act(async () => button!.click())
}
async function assemble(atoms: string[]) {
    for (const atom of atoms) await click(`Add ${atom}`)
    await click('Check combination')
}
beforeEach(() => {
    vi.stubGlobal('React', React)
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    localStorage.clear()
    window.gtag = vi.fn()
    container = document.createElement('div')
    document.body.appendChild(container)
})
afterEach(async () => {
    await act(async () => root?.unmount())
    container.remove()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

describe('learning UI', () => {
    it('teaches the formula, gives atom-level feedback, and hides the answer during independent recall', async () => {
        await mount()
        expect(container.textContent).toContain('H₂O')
        expect(container.textContent).toContain(messages['molecule-learning']['formula-rule'])
        await assemble(['H', 'H'])
        expect(container.textContent).toContain('Add 1 × O')
        await assemble(['O'])
        expect(container.textContent).toContain('Each H₂O model contains: H × 2 + O × 1.')
        await click('02Practice')
        expect(container.textContent).not.toContain('H₂O')
        expect(container.textContent).not.toContain('H × 2 + O × 1')
        await assemble(['H', 'H', 'O'])
        expect(getStoredMoleculeData().learning?.independentIds).toEqual(['water'])
        expect(container.textContent).toContain(messages['molecule-learning'].independent)
        expect(vi.mocked(window.gtag!).mock.calls.filter(call => call[1] === 'molecule_learning_checked')).toHaveLength(3)
    })
    it('restores a hinted practice question and never labels its answer independent', async () => {
        await mount()
        await click('02Practice')
        await click('Show formula')
        await click('Add H')
        await act(async () => root.unmount())
        await mount()
        expect(container.textContent).toContain('H₂O')
        expect(getStoredMoleculeData().learning?.selected).toEqual(['H'])
        await assemble(['H', 'O'])
        expect(getStoredMoleculeData().learning?.independentIds).toEqual([])
        expect(container.textContent).toContain(messages['molecule-learning'].assisted)
    })
    it('explains the comparison and lets users clear exploration without losing learning records', async () => {
        await mount()
        await click('03Compare')
        expect(container.textContent).toContain(messages['molecule-learning']['compare-note'])
        await click('04Explore')
        await assemble(['H', 'H', 'O', 'O'])
        expect(container.textContent).toContain('Hydrogen peroxide')
        await click('Clear model')
        expect(getStoredMoleculeData().learning?.selected).toEqual([])
        expect(getStoredMoleculeData().learning?.seenIds).toEqual(['hydrogen-peroxide'])
        expect(container.textContent).not.toContain('Keep molecule')
        expect(container.textContent).not.toContain('Dismantle')
    })
    it('supports learning when local storage is unavailable', async () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Unavailable') })
        await mount()
        expect(container.querySelector('[role="alert"]')?.textContent).toBe(messages.molecules['save-error'])
        await assemble(['H', 'H', 'O'])
        await click('Continue')
        expect(container.textContent).toContain('Build Carbon dioxide')
    })
})
