'use client'

import { useLearningCopy } from '@/lib/learning-copy'
import LanSwitcher from '@/components/lan-switcher'

export default function LearningLanguageSwitcher() {
    const t = useLearningCopy()
    return <LanSwitcher label={t('Language')} />
}
