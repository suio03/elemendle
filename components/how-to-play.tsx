import React from 'react'
import { Info } from 'lucide-react'
import Arrow from "@/public/images/arrow.svg"
import ArrowUp from "@/public/images/arrow-up.svg"
import { useTranslations } from "next-intl"

const HowToPlay = () => {
    const t = useTranslations('how-to-play')
    return (
        <div id="how-to-play">
            <div className="max-w-lg mx-auto space-y-6 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl border border-[#9CCAD3]">
                <h1 className="text-3xl font-bold text-[#9CCAD3] py-4 text-center">
                    {t('h1')}
                </h1>

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white py-4">{t('title')}</h2>
                    <p className="text-gray-400">{t('description')}</p>
                </div>
                {/* Main Game Rules */}
                <div className="border-none">
                    <div className="p-6 text-gray-300 space-y-4">
                        <div className="flex gap-3 items-start">
                            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                            <p>{t('notes')}</p>
                        </div>
                    </div>
                </div>

                {/* Color Indicators */}
                <div className="border-none">
                    <div className="p-6 space-y-4">
                        <h3 className="text-xl font-semibold text-white mb-4">{t('color-indicators')}</h3>
                        <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-600 rounded"></div>
                                <span className="text-gray-300">{t('correct')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-600 rounded"></div>
                                <span className="text-gray-300">{t('incorrect')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <img src={Arrow.src} alt="Arrow Up" className="w-6 h-6 " />
                                    <img src={ArrowUp.src} alt="Arrow Down" className="w-6 h-6 " />
                                </div>
                                <span className="text-gray-300">{t('higher')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Properties Section */}
                <div className="border-none">
                    <div className="p-6">
                        <h3 className="text-2xl font-semibold text-white mb-4">{t('properties')}</h3>
                        <div className="grid gap-4 text-gray-300">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('period.label')}: </p>
                                    <p>{t('period.value')}</p>
                                    <p>{t('period.description')}</p>
                                </div>
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('group.label')}: </p>
                                    <p>{t('group.value')}</p>
                                    <p>{t('group.description')}</p>
                                </div>
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('block.label')}: </p>
                                    <p>{t('block.value')}</p>
                                    <p>{t('block.description')}</p>
                                </div>
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('type.label')}: </p>
                                    <p>{t('type.value')}</p>
                                    <p>{t('type.description')}</p>
                                </div>
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('phase.label')}: </p>
                                    <p>{t('phase.value')}</p>
                                    <p>{t('phase.description')}</p>
                                </div>
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('mass.label')}: </p>
                                    <p>{t('mass.value')}</p>
                                    <p>{t('mass.description')}</p>
                                </div>
                                <div className="items-center">
                                    <p className='font-semibold text-red-300 text-xl'>{t('atomic.label')}: </p>
                                    <p>{t('atomic.value')}</p>
                                    <p>{t('atomic.description')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowToPlay