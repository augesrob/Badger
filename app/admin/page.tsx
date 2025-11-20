"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Menu, Home, X, Users, Activity, Truck, Shield, Trash, Clock, Save } from 'lucide-react'
import Link from 'next/link'

interface Settings {
  autoResetEnabled: boolean
  autoResetTime: string
  autoResetPrintRoom: boolean
  autoResetStaging: boolean
}

export default function AdminPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    autoResetEnabled: false,
    autoResetTime: '00:00',
    autoResetPrintRoom: false,
    autoResetStaging: false
  })
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('connected')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string>('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/trucks')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
        setSyncStatus('connected')
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSyncStatus('error')
    }
  }

  const saveSettings = async () => {
    try {
      setSyncStatus('syncing')
      setSaveMessage('')
      
      const response = await fetch('/api/trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSyncStatus('connected')
        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSyncStatus('error')
        setSaveMessage('Failed to save settings: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSyncStatus('error')
      setSaveMessage('Failed to save settings: Network error')
    }
  }

  const handleDelete = async (target: 'all' | 'printroom' | 'staging') => {
    if (confirmDelete !== target) {
      setConfirmDelete(target)
      setTimeout(() => setConfirmDelete(null), 5000)
      return
    }

    try {
      setSyncStatus('syncing')
      const response = await fetch(`/api/trucks?target=${target}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSyncStatus('connected')
        setConfirmDelete(null)
        
        let message = ''
        switch (target) {
          case 'all':
            message = 'Entire database deleted successfully!'
            break
          case 'printroom':
            message = 'Print Room data deleted successfully!'
            break
          case 'staging':
            message = 'Staging doors (18-28) data deleted successfully!'
            break
        }
        alert(message)
      } else {
        setSyncStatus('error')
        alert('Failed to delete data')
      }
    } catch (error) {
      console.error('Error deleting data:', error)
      setSyncStatus('error')
      alert('Failed to delete data')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                <p className="text-sm text-gray-500">System configuration and data management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                syncStatus === 'connected' ? 'bg-green-100 text-green-700' :
                syncStatus === 'syncing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected' ? 'bg-green-500' :
                  syncStatus === 'syncing' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <span className="text-sm font-medium capitalize">{syncStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Navigation</h2>
              <nav className="space-y-2">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Home className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Home</span>
                  </div>
                </Link>
                <Link href="/printroom" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Print Room</span>
                  </div>
                </Link>
                <Link href="/preshift" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">PreShift Setup</span>
                  </div>
                </Link>
                <Link href="/movement" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Live Movement</span>
                  </div>
                </Link>
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 transition-colors cursor-pointer">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">Admin Settings</span>
                  </div>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Warning Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-red-900">Administrator Access Only</h3>
              <p className="text-sm text-red-700">These settings can permanently delete data. Use with caution.</p>
            </div>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`rounded-lg p-4 ${
            saveMessage.includes('success') 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              saveMessage.includes('success') ? 'text-green-800' : 'text-red-800'
            }`}>
              {saveMessage}
            </p>
          </div>
        )}

        {/* Daily Auto-Reset Settings */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-gray-900">Daily Auto-Reset Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoResetEnabled"
                checked={settings.autoResetEnabled}
                onChange={(e) => setSettings({ ...settings, autoResetEnabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <Label htmlFor="autoResetEnabled" className="text-gray-900 font-medium cursor-pointer">
                Enable Daily Auto-Reset
              </Label>
            </div>

            {settings.autoResetEnabled && (
              <div className="ml-8 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-700">Reset Time (24-hour format)</Label>
                  <Input
                    type="time"
                    value={settings.autoResetTime}
                    onChange={(e) => setSettings({ ...settings, autoResetTime: e.target.value })}
                    className="bg-white text-gray-900 border-gray-300 max-w-xs"
                  />
                  <p className="text-sm text-gray-500 mt-1">System will automatically reset at this time daily</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">What to Reset:</Label>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoResetPrintRoom"
                      checked={settings.autoResetPrintRoom}
                      onChange={(e) => setSettings({ ...settings, autoResetPrintRoom: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <Label htmlFor="autoResetPrintRoom" className="text-gray-700 cursor-pointer">
                      Print Room Data (all truck assignments and batches)
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoResetStaging"
                      checked={settings.autoResetStaging}
                      onChange={(e) => setSettings({ ...settings, autoResetStaging: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <Label htmlFor="autoResetStaging" className="text-gray-700 cursor-pointer">
                      Staging Doors 18-28 (box trucks, vans, tandems only)
                    </Label>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Protected:</strong> Semi Tractor & Trailer Database will NEVER be auto-deleted. 
                      This data must be manually managed from the PreShift page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={saveSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={syncStatus === 'syncing'}
            >
              <Save className="w-4 h-4 mr-2" />
              {syncStatus === 'syncing' ? 'Saving...' : 'Save Auto-Reset Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Data Deletion */}
        <Card className="bg-white border-2 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Trash className="w-6 h-6 text-red-600" />
              <CardTitle className="text-gray-900">Manual Data Deletion</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Warning: These actions cannot be undone. Click twice to confirm deletion.
              </p>
            </div>

            {/* Delete Entire Database */}
            <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-bold text-red-900 mb-2">Delete Entire Database</h3>
              <p className="text-sm text-red-700 mb-3">
                Removes ALL data including Print Room, Staging Doors, and Semi Tractor & Trailer Database. 
                This is a complete system reset.
              </p>
              <Button
                onClick={() => handleDelete('all')}
                className={`${
                  confirmDelete === 'all' 
                    ? 'bg-red-700 hover:bg-red-800' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                <Trash className="w-4 h-4 mr-2" />
                {confirmDelete === 'all' ? 'Click Again to Confirm' : 'Delete Entire Database'}
              </Button>
            </div>

            {/* Delete Print Room Data */}
            <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
              <h3 className="text-lg font-bold text-orange-900 mb-2">Delete Print Room Data</h3>
              <p className="text-sm text-orange-700 mb-3">
                Removes all truck assignments, batches, routes, pods, and pallets from Print Room. 
                Does not affect PreShift data.
              </p>
              <Button
                onClick={() => handleDelete('printroom')}
                className={`${
                  confirmDelete === 'printroom' 
                    ? 'bg-orange-700 hover:bg-orange-800' 
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                <Trash className="w-4 h-4 mr-2" />
                {confirmDelete === 'printroom' ? 'Click Again to Confirm' : 'Delete Print Room Data'}
              </Button>
            </div>

            {/* Delete Staging Doors Only */}
            <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Delete Staging Doors (18-28)</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Removes only box trucks, vans, and tandems from staging doors 18-28. 
                <strong> Semi Tractor & Trailer Database is protected and will NOT be deleted.</strong>
              </p>
              <Button
                onClick={() => handleDelete('staging')}
                className={`${
                  confirmDelete === 'staging' 
                    ? 'bg-yellow-700 hover:bg-yellow-800' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } text-white`}
              >
                <Trash className="w-4 h-4 mr-2" />
                {confirmDelete === 'staging' ? 'Click Again to Confirm' : 'Delete Staging Doors Data'}
              </Button>
            </div>

            {/* Protected Data Notice */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-900 mb-2">🛡️ Protected Data</h3>
              <p className="text-sm text-green-700">
                <strong>Semi Tractor & Trailer Database</strong> is permanently protected from auto-deletion 
                and cannot be deleted from this admin page. To manage driver and trailer data, 
                use the PreShift Setup page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Database Location:</span>
                <span className="text-gray-900 font-mono">/data/trucks.json</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-Reset Status:</span>
                <span className={`font-medium ${settings.autoResetEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {settings.autoResetEnabled ? `Enabled (${settings.autoResetTime})` : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Protected Data:</span>
                <span className="text-green-600 font-medium">Semi Tractor & Trailer Database</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
