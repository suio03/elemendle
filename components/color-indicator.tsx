import { cn } from "@/lib/utils"
import Arrow from "@/public/images/arrow.svg"
import ArrowUp from "@/public/images/arrow-up.svg"
import { useTranslations } from "next-intl"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ColorIndicatorItem {
    color: string
    label: string
    tooltip?: string
}

interface ColorIndicatorProps {
    items: ColorIndicatorItem[]
    className?: string
}

export default function ColorIndicator({ items, className }: ColorIndicatorProps) {
    const t = useTranslations('game-board.color-indicators')
    return (
        <div className={cn(
            "rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm p-6 my-12 max-w-lg mx-auto",
            className
        )}>
            <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold text-white/90">{t('title')}</h3>
                <div className="flex items-center gap-8 justify-center">
                    {items.map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-2">
                            {item.tooltip ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <div
                                                className={cn(
                                                    "h-12 w-12 rounded-lg shadow-lg flex items-center justify-center",
                                                    item.color
                                                )}
                                            >
                                                {item.label === "Higher" && (
                                                    <img src={ArrowUp.src} alt="Arrow Up" className="w-6 h-6 text-white" />
                                                )}
                                                {item.label === "Lower" && (
                                                    <img src={Arrow.src} alt="Arrow Down" className="w-6 h-6 text-white" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <div className={cn("h-12 w-12 rounded-lg shadow-lg flex items-center justify-center", item.color)}>
                                    {item.label === "Higher" && (
                                        <img src={ArrowUp.src} alt="Arrow Up" className="w-6 h-6 text-white" />
                                    )}
                                    {item.label === "Lower" && (
                                        <img src={Arrow.src} alt="Arrow Down" className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            )}
                            <span className="text-sm text-white/70">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}