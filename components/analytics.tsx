import Script from 'next/script'

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ZD8C67DLYH'

const Analytics = () => (
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
                `
            }}
        />
    </>
)

export default Analytics
