'use client'

import React, { useState } from 'react'
import { LoginScreen } from '@/components/organisms/LoginScreen'
import { DashboardScreenV2 } from '@/components/organisms/DashboardScreenV2'
import { SOWDetailScreen } from '@/components/organisms/SOWDetailScreen'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'

type AppView = 'dashboard' | 'sow-detail' | 'sow-detail-v2'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('ashika.jain@company.com')
  const [view, setView] = useState<AppView>('dashboard')
  const [sowFiles, setSOWFiles] = useState<UploadedFile[]>([])

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={(email) => {
          if (email) setUserEmail(email)
          setIsLoggedIn(true)
        }}
      />
    )
  }

  const isNarendra =
    userEmail.toLowerCase().includes('npatel') ||
    userEmail.toLowerCase().includes('narendra') ||
    userEmail.toLowerCase().includes('contributor')
  const displayName = isNarendra ? 'Narendra' : 'Ashika Jain'
  const userRole = isNarendra ? 'Contributor' : 'PMO'
  const userInitials = isNarendra ? 'N' : 'AJ'
  const userImage = '/profile-user.png'

  const isSOWDetail = view === 'sow-detail' || view === 'sow-detail-v2'

  return (
    <DashboardScreenV2
      userName={displayName}
      userRole={userRole}
      userInitials={userInitials}
      userImage={userImage}
      onSignOut={() => setIsLoggedIn(false)}
      activeNav={isSOWDetail ? 'my-sows' : 'dashboard'}
      contentOverride={
        view === 'sow-detail' ? (
          <SOWDetailScreen uploadedFiles={sowFiles} onBack={() => setView('dashboard')} />
        ) : view === 'sow-detail-v2' ? (
          <SOWDetailScreen
            sowName="Globex Corp — Digital Transformation"
            sowStatus="In Progress"
            showGenerateDraft
            sowVariant="v2"
            onBack={() => setView('dashboard')}
          />
        ) : undefined
      }
      onProceedToSOW={(files: UploadedFile[]) => {
        setSOWFiles(files)
        setView('sow-detail')
      }}
      onNavHome={() => setView('dashboard')}
      onNavAllSOWs={() => setView('dashboard')}
      onNavAuditLog={() => setView('dashboard')}
      onOpenSOWV2={() => setView('sow-detail-v2')}
    />
  )
}
