'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { UserSettingsDialog } from '@/components/user-settings-dialog'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(true)

  // Get the tab from URL query parameter, default to 'account'
  const tab = searchParams.get('tab') || 'account'

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Redirect back to dashboard when dialog closes
      router.push('/dashboard')
    }
  }

  return (
    <UserSettingsDialog
      open={open}
      onOpenChange={handleOpenChange}
      defaultTab={tab}
    />
  )
}
