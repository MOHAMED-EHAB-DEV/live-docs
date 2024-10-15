'use client';

import { SessionProvider } from "next-auth/react";

const SessionProviderC = ({ children } : { children: React.ReactNode }) => {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}

export default SessionProviderC;