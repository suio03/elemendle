import { ReactNode } from 'react'

type Props = {
    children: ReactNode
}
function RootLayout({
    children
}: Props) {
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    )
}
export default RootLayout