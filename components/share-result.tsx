import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useTranslations } from 'next-intl'

interface ShareResultProps {
    attempts: number
    timeTaken: number
}

const ShareCard = ({ attempts, timeTaken }: ShareResultProps) => {
    const t = useTranslations('share')
    const { toast } = useToast()
    
    const shareText = `I found #Bleachdle character in ${attempts} attempts (${timeTaken}s) ⚔️\n\nhttps://bleachdle.com`

    const handleShare = async () => {
        // Copy to clipboard
        await navigator.clipboard.writeText(shareText)
        
        // Open Twitter share dialog
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
        window.open(twitterUrl, '_blank')
        
        toast({
            description: "Copied to clipboard!",
            duration: 2000,
        })
    }

    return (
        <div className="flex justify-center items-center mt-12">
            <Card className="w-full max-w-lg bg-gradient-to-br from-blue-900 to-gray-900 text-white border-[#9CCAD3] border rounded-xl">
                <CardContent className="p-8">
                    <div className="text-center space-y-6">
                        <p className="text-2xl font-semibold leading-relaxed font-serif">
                            {t('description', { attempts, timeTaken })}
                        </p>    

                        <p className="text-lg text-gray-300">
                            https://bleachdle.app
                        </p>

                        <Button 
                            onClick={handleShare}
                            className="bg-[#145075] hover:bg-[#1a8cd8] text-white"
                        >
                            <X className="w-5 h-5 mr-2" />
                            {t('btn')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ShareCard