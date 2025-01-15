import { X } from "lucide-react"
import { Button } from "./ui/button"

interface HintMessageProps {
    hintNumber: number
    hintText: string
    onDismiss: () => void
}

export default function HintMessage({ hintNumber, hintText, onDismiss }: HintMessageProps) {
    return (
        <div 
            key={`${hintNumber}-${hintText}`}
            className="mb-4 p-3 bg-red-600/30 rounded-lg flex items-start justify-between gap-2 animate-hint-bounce"
        >
            <p className="text-red-200 text-sm font-medium">
                Hint: {hintText}
            </p>
            <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-red-900/50"
                onClick={onDismiss}
            >
                <X className="h-4 w-4 text-red-200" />
            </Button>
        </div>
    )
} 