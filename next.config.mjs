import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig = {
  images: { unoptimized: true },
}

export default withNextIntl(nextConfig)

initOpenNextCloudflareForDev()
