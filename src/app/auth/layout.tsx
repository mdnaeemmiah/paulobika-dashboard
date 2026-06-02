"use client"

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className='max-w-md mx-auto'>
                <div className="min-h-screen ">
                    <Toaster position="top-center" reverseOrder={false} />
                    {children}
                </div>
            </div>
        </>
    );
}
