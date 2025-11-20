"use client"

import React from 'react'
import { Truck } from 'lucide-react'

interface HeaderProps {
  syncStatus: 'connected' | 'syncing' | 'error'
}

export default function Header({ syncStatus }: HeaderProps) {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck style={{ width: '2rem', height: '2rem', color: '#2563eb' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Truck Management System</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Real-time synchronized warehouse operations</p>
            </div>
          </div>
          <div style={{
            backgroundColor: syncStatus === 'connected' ? '#dcfce7' : syncStatus === 'syncing' ? '#fef3c7' : '#fee2e2',
            color: syncStatus === 'connected' ? '#15803d' : syncStatus === 'syncing' ? '#a16207' : '#991b1b',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              backgroundColor: syncStatus === 'connected' ? '#22c55e' : syncStatus === 'syncing' ? '#eab308' : '#ef4444'
            }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{syncStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
