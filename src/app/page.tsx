'use client'

import React, { useState } from 'react'
import { LoginScreen } from '@/components/organisms/LoginScreen'
import { DashboardScreen } from '@/components/organisms/DashboardScreen'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('ashika.jain@company.com')

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

  // Render 1-to-1 SOW Studio Dashboard Screen
  return (
    <DashboardScreen
      userName={userEmail.split('.')[0] ? userEmail.split('.')[0].charAt(0).toUpperCase() + userEmail.split('.')[0].slice(1) : 'Ashika'}
      userRole="PMO"
      userInitials="AJ"
      onSignOut={() => setIsLoggedIn(false)}
    />
  )
}

