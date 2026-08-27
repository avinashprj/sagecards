import type { ReactElement } from 'react'

export default function HomePage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">SageCards</h1>
      <p className="text-base opacity-70">One tap — share who you are.</p>
    </main>
  )
}
