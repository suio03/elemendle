import '../globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { getMessages, getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from "react-hot-toast"
import Analytics from '@/components/analytics'

const inter = Inter({ subsets: ['latin'] })


type Props = {
    children: ReactNode
    params: { locale: string }
}
export async function generateMetadata({
    params: { locale }
}: Omit<Props, 'children'>) {
    const t = await getTranslations({ locale, namespace: 'metaData' })
    const cookieStore = cookies()
    let pathName = cookieStore.get('x-pathname')?.value || '/'
    const baseUrl = 'https://bleachdle.app'
    const locales = ['ar', 'ch', 'es', 'fr', 'pt', 'ru', 'ko', 'jp', 'de', 'it', 'hi', 'nl']
    const localePath = locale === 'en' ? '' : `/${locale}`
    // Ensure correct formatting
    if (pathName !== '/' && pathName.endsWith('/')) {
        pathName = pathName.slice(0, -1) // Remove trailing slash from non-root paths
    }
    const site_url = localePath === '' && pathName === '/' ? `${baseUrl}/` : `${baseUrl}${localePath}${pathName === '/' ? '' : pathName}`
    const languages = locales.reduce((acc, locale) => {
        acc[locale as keyof typeof acc] = `${baseUrl}/${locale}${pathName === '/' ? '' : pathName}`
        return acc
    }, {} as Record<string, string>)
    languages['x-default'] = `${baseUrl}${pathName}`
    return {
        title: t('title'),
        description: t('description'),
        alternates: {
            canonical: site_url,
            languages: languages
        }
    }
}
export default async function LocaleLayout({
    children,
    params: { locale }
}: Props) {
    const messages = await getMessages()
    return (
        <html lang={locale}>
            {/* <Analytics /> */}
            <body className={inter.className}>
                <NextIntlClientProvider messages={messages}>
                    <div className="fixed inset-0 bg-[url('/images/background.png')] bg-fixed bg-cover bg-center bg-no-repeat -z-20" />
                    <div className="relative min-h-screen">
                        <div className="absolute inset-0 bg-black/50
                                -z-10" />
                        {children}
                    </div>
                    <Toaster
                        toastOptions={{
                            duration: 3000,
                        }}
                    />
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
