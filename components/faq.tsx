import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { useTranslations } from 'next-intl'
interface FAQ {
    question: string
    answer: string
}
const Faq = () => {
    // use a loop to loop in
    const t = useTranslations('faq')
    const faqs: FAQ[] = Array.from({ length: 12 }, (_, index) => ({
        question: t(`questions.${index}.question`),
        answer: t(`questions.${index}.answer`)
    }))
    return (
        <div className="max-w-lg mx-auto mt-4">
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-[#9CCAD3] border rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#9CCAD3]">{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-700 pb-4">
                                <div className="w-full text-left font-semibold text-lg mb-2 text-red-300">
                                    {faq.question}
                                </div>
                                <p className="text-[#CCCCCC]">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Faq