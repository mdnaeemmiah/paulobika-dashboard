import SetPass from '@/src/components/auht/SetPass'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPass />
    </Suspense>
  )
}
