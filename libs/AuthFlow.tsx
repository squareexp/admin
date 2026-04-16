import React from 'react'

// Auth is now handled entirely in proxy.ts (middleware)
// This component is a simple passthrough wrapper
export default async function AuthFlow({children}: {children: React.ReactNode}) {
  return (
    <main>{children}</main>
  )
}
