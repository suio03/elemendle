'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
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
            toast.error('Please select a valid JSON file')
            return
        }

        setIsImporting(true)
        try {
            const success = await importGameData(file)
            if (success) {
                toast.success('Game data imported successfully!')
                window.location.reload()
            } else {
                toast.error('Failed to import game data. Invalid format.')
            }
        } catch (error) {
            console.error('Import error:', error)
            toast.error(error instanceof Error ? error.message : 'Invalid file format')
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
            toast.success('Game data exported successfully!')
        } catch (error) {
            toast.error('Failed to export game data')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gradient-to-br from-red-950 to-gray-900 border-red-800">
                <DialogHeader>
                    <DialogTitle className="text-pink-200/90">{t('name')}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 items-center">
                    <div className="flex gap-4">
                        <Button
                            onClick={handleExport}
                            className="bg-red-900/50 hover:bg-red-800/50 text-white"
                            size="sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
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
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-red-900/50 hover:bg-red-800/50 text-white"
                                size="sm"
                                disabled={isImporting}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('btn02')}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-red-200/70 text-center">
                        {t('description')}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
} 