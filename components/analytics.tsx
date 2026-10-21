'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { trackPageView } from '@/lib/analytics'

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ZD8C67DLYH'
const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID || 'qfrwrld0of'
const plausibleScriptUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL || 'https://actone.app/js/script.js'

const Analytics = () => {
    const pathname = usePathname()
    const lastTrackedPath = useRef(pathname)

    useEffect(() => {
        if (lastTrackedPath.current === pathname) return

        trackPageView(pathname)
        lastTrackedPath.current = pathname
    }, [pathname])

    return (
        <>
            <script
                id="analytics-consent-defaults"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        window.gtag = gtag;
                        gtag('consent', 'default', {
                            analytics_storage: 'denied',
                            ad_storage: 'denied',
                            ad_user_data: 'denied',
                            ad_personalization: 'denied',
                            wait_for_update: 500
                        });
                        gtag('set', 'ads_data_redaction', true);
                        gtag('set', 'url_passthrough', false);
                    `
                }}
            />
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
            />
            <Script
                id="anonymous-google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        gtag('js', new Date());
                        gtag('config', '${measurementId}', {
                            send_page_view: false,
                            allow_google_signals: false,
                            allow_ad_personalization_signals: false
                        });
                        gtag('event', 'page_view', {
                            page_location: window.location.href,
                            page_path: window.location.pathname,
                            page_title: document.title
                        });
                    `
                }}
            />
            <Script
                id="microsoft-clarity"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        (function(c,l,a,r,i,t,y){
                            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                        })(window, document, "clarity", "script", "${clarityId}");
                    `
                }}
            />
            <Script
                id="plausible-analytics"
                defer
                data-domain="elemendle.com"
                src={plausibleScriptUrl}
                strategy="afterInteractive"
            />
        </>
    )
}

export default Analytics
