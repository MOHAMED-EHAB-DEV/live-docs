'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string, message?: string, }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className='w-full min-h-screen h-full flex items-center justify-center gap-3 flex-col'>
            <div className="error-box">
                <Image 
                    src="/assets/icons/error.svg"
                    alt="Error Icon"
                    width={24}
                    height={24}
                />
                <h2>{error.message}</h2>
            </div>
            <Button
                onClick={
                    () => reset()
                }
                variant="destructive"
            >
                Try again
            </Button>
        </div>
    )
}