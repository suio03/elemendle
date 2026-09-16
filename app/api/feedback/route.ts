import { handleFeedback } from '@/lib/feedback'

export async function POST(request: Request) {
  return handleFeedback(request, process.env.DISCORD_FEEDBACK_WEBHOOK_URL)
}
