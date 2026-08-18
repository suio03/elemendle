'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { DatabaseBackup, Download, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { downloadGameData, importGameData } from '@/lib/data-transfer'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from 'next-intl'
export function DataTransferUI({ open, onOpenChange }: { 
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations('header.data-control')
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.json')) {
            toast.error(t('invalid-file'))
            return
        }

        setIsImporting(true)
        try {
            const success = await importGameData(file)
            if (success) {
                toast.success(t('import-success'))
                window.location.reload()
            } else {
                toast.error(t('import-failed'))
            }
        } catch (error) {
            console.error('Import error:', error)
            toast.error(t('invalid-format'))
        } finally {
            setIsImporting(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleExport = () => {
        try {
            downloadGameData()
            toast.success(t('export-success'))
        } catch {
            toast.error(t('export-failed'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden border-[#9CCAD3]/35 bg-gradient-to-br from-[#101820] to-[#1C2730] text-white shadow-2xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-[#D7EEF2]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                            <DatabaseBackup className="h-5 w-5" aria-hidden="true" />
                        </span>
                        {t('name')}
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-5">
                    <p className="text-sm leading-relaxed text-slate-300">
                        {t('description')}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Button
                            onClick={handleExport}
                            className="h-12 justify-center rounded-xl bg-[#73B9FF] font-bold text-[#071319] hover:bg-[#8BC8E4]"
                        >
                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                            {t('btn01')}
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                                disabled={isImporting}
                                aria-label={t('btn02')}
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="h-12 w-full justify-center rounded-xl border-[#9CCAD3]/35 bg-white/5 font-bold text-[#C8E6EC] hover:bg-white/10 hover:text-white"
                                disabled={isImporting}
                            >
                                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                                {t('btn02')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
