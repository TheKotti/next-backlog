import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import SessionProvider from "utils/SessionProvider";
// These styles apply to every route in the application
import 'bootstrap/dist/css/bootstrap.css';
import './global.css'

export default async function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    {children}
                    <Analytics />
                    <ToastContainer
                        position='bottom-center'
                        autoClose={3000}
                        hideProgressBar
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss={false}
                        draggable={false}
                        pauseOnHover={false}
                        theme='dark'
                    />
                </SessionProvider>
            </body>
        </html>
    )
}