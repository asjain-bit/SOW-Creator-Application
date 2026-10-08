'use client'

import React, { useState } from 'react'
import { LoginScreen } from '@/components/organisms/LoginScreen'
import { DashboardScreenV2 } from '@/components/organisms/DashboardScreenV2'
import { SOWDetailScreen } from '@/components/organisms/SOWDetailScreen'
import type { UploadedFile } from '@/components/molecules/CreateSOWModal'
import type { SOWItem } from '@/components/organisms/DashboardScreenV2/DashboardScreenV2.types'

type AppView = 'dashboard' | 'sow-detail' | 'sow-detail-v2' | 'sow-detail-meridian' | 'sow-detail-deactivated'

const CONTRIBUTOR_SOWS: SOWItem[] = [
  {
    id: 'sow-meridian',
    name: 'Procurement Platform Modernization',
    client: 'Meridian Healthcare',
    createdBy: 'Ashika Jain',
    createdDate: 'Sep 02, 2026',
    lastUpdated: 'Today, 9:10 AM',
    status: 'At Risk',
    readiness: 75,
    openQuestions: 3,
    overdueQuestions: 1,
    reviewComments: 11,
    approval: 'Awaiting Contributor',
  },
  {
    id: 'sow-2',
    name: 'Digital Workplace Enablement',
    client: 'Globex Inc',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 10, 2026',
    lastUpdated: 'Aug 28, 2026',
    status: 'On Track',
    readiness: 75,
    openQuestions: 1,
    overdueQuestions: 0,
    reviewComments: 5,
    approval: 'Awaiting Client',
  },
  {
    id: 'sow-1',
    name: 'Customer Transformation Program',
    client: 'Acme Corp',
    createdBy: 'Ashika Jain',
    createdDate: 'Aug 01, 2026',
    lastUpdated: 'Today, 10:24 AM',
    status: 'On Track',
    readiness: 85,
    openQuestions: 2,
    overdueQuestions: 0,
    reviewComments: 8,
    approval: 'Reviewer',
  },
  {
    id: 'sow-3',
    name: 'Cloud Modernization Initiative',
    client: 'TechSphere',
    createdBy: 'Rohan Mehta',
    createdDate: 'Aug 05, 2026',
    lastUpdated: 'Aug 18, 2026',
    status: 'Deactivated',
    readiness: 35,
    openQuestions: 4,
    overdueQuestions: 2,
    reviewComments: 2,
    approval: 'Reviewer',
  },
]

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('ashika.jain@company.com')
  const [view, setView] = useState<AppView>('dashboard')
  const [sowFiles, setSOWFiles] = useState<UploadedFile[]>([])
  const [createdSowName, setCreatedSowName] = useState('Meridian Healthcare — Procurement Platform')
  const [createdSowDeadline, setCreatedSowDeadline] = useState('2026-10-31')
  const [createdTokenConsumption, setCreatedTokenConsumption] = useState(20000)
  const [hasLoggedOut, setHasLoggedOut] = useState(false)
  const [pmoPreviewRole, setPmoPreviewRole] = useState<'PMO' | 'Contributor' | 'Reviewer' | 'Client'>('PMO')

  if (!isLoggedIn) {
    return (
      <LoginScreen
        initialStep={hasLoggedOut ? 'email' : 'choose'}
        onLoginSuccess={(email) => {
          if (email) setUserEmail(email)
          setPmoPreviewRole('PMO')
          setView('dashboard')
          setIsLoggedIn(true)
        }}
      />
    )
  }

  const isParag = userEmail.toLowerCase().includes('parag')
  const isRiza = userEmail.toLowerCase().includes('riza')
  const isNarendra =
    userEmail.toLowerCase().includes('npatel') ||
    userEmail.toLowerCase().includes('narendra') ||
    userEmail.toLowerCase().includes('contributor')
  const isIshita =
    userEmail.toLowerCase().includes('ishita') ||
    userEmail.toLowerCase().includes('ishitawork')
  const isClientOrContributor = isNarendra || isRiza

  const displayName = isParag ? 'Parag' : isRiza ? 'Riza' : isNarendra ? 'Narendra' : isIshita ? 'Ishita' : 'Ashika Jain'
  const userRole = isParag ? 'Admin' : isRiza ? 'Client' : isNarendra ? 'Contributor' : isIshita ? 'Reviewer' : 'PMO'
  const userInitials = isParag ? 'P' : isRiza ? 'R' : isNarendra ? 'N' : isIshita ? 'IS' : 'AJ'
  const userImage = isParag
    ? '/profile-male.png'
    : isRiza
    ? '/profile-female.png'
    : isNarendra ? '/profile-male.png' : isIshita ? '/profile-female.png' : '/profile-user.png'

  const isSOWDetail =
    view === 'sow-detail' || view === 'sow-detail-v2' || view === 'sow-detail-meridian' || view === 'sow-detail-deactivated'

  // One role mapping for every entry point (direct login and the PMO role preview)
  const detailViewerRole = isParag
    ? ('admin' as const)
    : isIshita
    ? ('reviewer' as const)
    : isNarendra
    ? ('contributor' as const)
    : isRiza
    ? ('client' as const)
    : ('pmo' as const)

  const activePMORoleForSOW =
    userRole === 'PMO'
      ? pmoPreviewRole === 'Contributor'
        ? ('contributor' as const)
        : pmoPreviewRole === 'Reviewer'
        ? ('reviewer' as const)
        : pmoPreviewRole === 'Client'
        ? ('client' as const)
        : ('pmo' as const)
      : undefined

  const handleActiveViewerRoleChange = (r: 'pmo' | 'contributor' | 'reviewer' | 'client') => {
    if (userRole === 'PMO') {
      setPmoPreviewRole(r === 'contributor' ? 'Contributor' : r === 'reviewer' ? 'Reviewer' : r === 'client' ? 'Client' : 'PMO')
    }
  }

  return (
    <DashboardScreenV2
      userName={displayName}
      userRole={userRole}
      userInitials={userInitials}
      userImage={userImage}
      initialSOWs={
        isClientOrContributor || isIshita || (userRole === 'PMO' && pmoPreviewRole !== 'PMO')
          ? CONTRIBUTOR_SOWS
          : undefined
      }
      previewRole={userRole === 'PMO' ? pmoPreviewRole : undefined}
      onPreviewRoleChange={(r) => {
        if (userRole === 'PMO') setPmoPreviewRole(r)
      }}
      onSignOut={() => {
        setIsLoggedIn(false)
        setHasLoggedOut(true)
        setPmoPreviewRole('PMO')
        setView('dashboard')
      }}
      activeNav={isSOWDetail ? 'my-sows' : 'dashboard'}
      contentOverride={
        view === 'sow-detail' ? (
          <SOWDetailScreen
            sowName={createdSowName}
            sowDeadline={createdSowDeadline}
            tokenConsumption={createdTokenConsumption}
            uploadedFiles={sowFiles}
            showGenerateDraft={!isParag}
            viewerRole={detailViewerRole}
            initialActiveRole={activePMORoleForSOW}
            onActiveViewerRoleChange={handleActiveViewerRoleChange}
            onBack={() => setView('dashboard')}
          />
        ) : view === 'sow-detail-v2' ? (
          <SOWDetailScreen
            sowName="Globex Corp — Digital Transformation"
            sowStatus="In Progress"
            showGenerateDraft={!isParag}
            sowVariant="v2"
            viewerRole={detailViewerRole}
            initialActiveRole={activePMORoleForSOW}
            onActiveViewerRoleChange={handleActiveViewerRoleChange}
            uploadedFiles={[
              { id: '1', name: 'Digital_Transformation_RFP.pdf', size: '2.8 MB', type: 'application/pdf', status: 'complete', progress: 100 },
              { id: '2', name: 'Enterprise_Architecture_Specs.pdf', size: '1.4 MB', type: 'application/pdf', status: 'complete', progress: 100 },
              { id: '3', name: 'Workplace_Requirements_Matrix.pdf', size: '920 KB', type: 'application/pdf', status: 'complete', progress: 100 }
            ]}
            onBack={() => setView('dashboard')}
          />
        ) : view === 'sow-detail-meridian' ? (
          <SOWDetailScreen
            sowName="Meridian Healthcare — Procurement Platform Modernization"
            sowStatus="In Progress"
            sowVariant="meridian"
            viewerRole={detailViewerRole}
            initialActiveRole={activePMORoleForSOW}
            onActiveViewerRoleChange={handleActiveViewerRoleChange}
            currentMemberId={isIshita ? 'm4' : isNarendra ? 'm5' : 'm1'}
            showGenerateDraft={!isParag && !isNarendra}
            uploadedFiles={[
              { id: '1', name: 'Meridian_RFP.pdf', size: '2.4 MB', type: 'application/pdf', status: 'complete', progress: 100 },
              { id: '2', name: 'Vendor_MSA_Template.docx', size: '1.2 MB', type: 'application/msword', status: 'complete', progress: 100 },
              { id: '3', name: 'Procurement_Requirements.pdf', size: '845 KB', type: 'application/pdf', status: 'complete', progress: 100 }
            ]}
            onBack={() => setView('dashboard')}
          />
        ) : view === 'sow-detail-deactivated' ? (
          <SOWDetailScreen
            sowName="TechSphere — Cloud Modernization Initiative"
            sowStatus="Deactivated"
            showGenerateDraft={false}
            sowVariant="v1"
            viewerRole={detailViewerRole}
            initialActiveRole={activePMORoleForSOW}
            onActiveViewerRoleChange={handleActiveViewerRoleChange}
            uploadedFiles={[
              { id: '1', name: 'TechSphere_Cloud_Spec.pdf', size: '3.1 MB', type: 'application/pdf', status: 'complete', progress: 100 },
              { id: '2', name: 'Security_Compliance_Review.docx', size: '1.1 MB', type: 'application/msword', status: 'complete', progress: 100 }
            ]}
            onBack={() => setView('dashboard')}
          />
        ) : undefined
      }
      onProceedToSOW={(files: UploadedFile[], details) => {
        setSOWFiles(files)
        if (details?.clientName) setCreatedSowName(details.clientName)
        if (details?.sowDeadline) setCreatedSowDeadline(details.sowDeadline)
        if (details?.tokenConsumption) setCreatedTokenConsumption(details.tokenConsumption)
        setView('sow-detail')
      }}
      onNavHome={() => setView('dashboard')}
      onNavAllSOWs={() => setView('dashboard')}
      onNavAuditLog={() => setView('dashboard')}
      onOpenSOWV2={() => setView('sow-detail-v2')}
      onOpenSOWContributor={() => setView('sow-detail-meridian')}
      onOpenSOWDeactivated={() => setView('sow-detail-deactivated')}
    />
  )
}
