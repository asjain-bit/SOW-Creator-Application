'use client'

import React, { useState } from 'react'
import { LoginScreen } from '@/components/organisms/LoginScreen'
import { DashboardScreenV2 } from '@/components/organisms/DashboardScreenV2'
import { SOWDetailScreen } from '@/components/organisms/SOWDetailScreen'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'
import type { SOWItem } from '@/components/organisms/DashboardScreenV2/DashboardScreenV2.types'

type AppView = 'dashboard' | 'sow-detail' | 'sow-detail-v2' | 'sow-detail-meridian'

const CONTRIBUTOR_SOWS: SOWItem[] = [
  {
    id: 'sow-meridian',
    name: 'Procurement Platform Modernization',
    client: 'Meridian Healthcare',
    createdBy: 'Ashika Jain',
    createdDate: 'Sep 02, 2026',
    lastUpdated: 'Today, 9:10 AM',
    status: 'In Progress',
  },
  {
    id: 'sow-2',
    name: 'Digital Workplace Enablement',
    client: 'Globex Inc',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 10, 2026',
    lastUpdated: 'Aug 28, 2026',
    status: 'In Progress',
  },
]

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

  const isRiza = userEmail.toLowerCase().includes('riza')
  const isNarendra =
    userEmail.toLowerCase().includes('npatel') ||
    userEmail.toLowerCase().includes('narendra') ||
    userEmail.toLowerCase().includes('contributor')
  const isClientOrContributor = isNarendra || isRiza

  const displayName = isRiza ? 'Riza' : isNarendra ? 'Narendra' : 'Ashika Jain'
  const userRole = isRiza ? 'Client' : isNarendra ? 'Contributor' : 'PMO'
  const userInitials = isRiza ? 'R' : isNarendra ? 'N' : 'AJ'
  const userImage = isRiza 
    ? '/profile-female.png' 
    : isNarendra ? '/profile-male.png' : '/profile-user.png'

  const isSOWDetail =
    view === 'sow-detail' || view === 'sow-detail-v2' || view === 'sow-detail-meridian'

  return (
    <DashboardScreenV2
      userName={displayName}
      userRole={userRole}
      userInitials={userInitials}
      userImage={userImage}
      initialSOWs={isClientOrContributor ? CONTRIBUTOR_SOWS : undefined}
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
        ) : view === 'sow-detail-meridian' ? (
          <SOWDetailScreen
            sowName="Meridian Healthcare — Procurement Platform Modernization"
            sowStatus="In Progress"
            sowVariant="meridian"
            viewerRole="contributor"
            currentMemberId="m5"
            uploadedFiles={[
              { id: '1', name: 'Meridian_RFP.pdf', size: '2.4 MB', type: 'application/pdf', status: 'complete', progress: 100 },
              { id: '2', name: 'Vendor_MSA_Template.docx', size: '1.2 MB', type: 'application/msword', status: 'complete', progress: 100 },
              { id: '3', name: 'Procurement_Requirements.xlsx', size: '845 KB', type: 'application/vnd.ms-excel', status: 'complete', progress: 100 }
            ]}
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
      onOpenSOWContributor={() => setView('sow-detail-meridian')}
    />
  )
}
