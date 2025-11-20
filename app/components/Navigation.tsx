"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Users, Activity } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const tabs = [
    { key: '/', label: 'Print Room', icon: Menu },
    { key: '/preshift', label: 'PreShift Setup', icon: Users },
    { key: '/movement', label: 'Live Movement', icon: Activity }
  ]

  return (
    <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <Link
              key={key}
              href={key}
              style={{
                padding: '0.75rem 1.5rem',
                fontWeight: '500',
                color: pathname === key ? '#2563eb' : '#6b7280',
                borderBottom: pathname === key ? '2px solid #2563eb' : 'none',
                backgroundColor: 'transparent',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Icon style={{ width: '1rem', height: '1rem' }} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
