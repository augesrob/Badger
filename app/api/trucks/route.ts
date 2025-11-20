"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Truck, Plus, Trash, Edit, Save, Menu, Home, X, Users, Activity, Shield } from 'lucide-react'
import Link from 'next/link'

type TruckType = 'Van' | 'Small Box Truck' | 'Normal Box Truck' | 'Tandem' | 'Other'
type Transmission = 'Manual' | 'Automatic'

interface TruckInfo {
  id: string
  truckNumber: string
  truckType: TruckType
  transmission: Transmission
}

const truckTypes: TruckType[] = ['Van', 'Small Box Truck', 'Normal Box Truck', 'Tandem', 'Other']
const transmissions: Transmission[] = ['Manual', 'Automatic']

const truckTypeColors: Record<TruckType, string> = {
  'Van': 'bg-blue-500',
  'Small Box Truck': 'bg-green-500',
  'Normal Box Truck': 'bg-purple-500',
  'Tandem': 'bg-orange-500',
  'Other': 'bg-gray-500'
}

export default function TrucksPage() {
  const [truckDatabase, setTruckDatabase] = useState<TruckInfo[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (truckDatabase.length > 0) {
      const timeoutId = setTimeout(() => {
        saveData()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [truckDatabase])

  const loadData = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/trucks')
      if (response.ok) {
        const data = await response.json()
        setTruckDatabase(data.truckDatabase || [])
        setSyncStatus('connected')
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setSyncStatus('error')
    }
  }

  const saveData = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truckDatabase })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSyncStatus('connected')
      } else {
        setSyncStatus('error')
        console.error('Save failed:', result.error)
      }
    } catch (error) {
      console.error('Error saving data:', error)
      setSyncStatus('error')
    }
  }

  const addTruck = () => {
    const newTruck: TruckInfo = {
      id: Date.now().toString(),
      truckNumber: '',
      truckType: 'Van',
      transmission: 'Automatic'
    }
    setTruckDatabase([...truckDatabase, newTruck])
    setEditingTruck(newTruck.id)
  }

  const updateTruck = (id: string, updates: Partial<TruckInfo>) => {
    setTruckDatabase(truckDatabase.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTruck = (id: string) => {
    if (confirm('Are you sure you want to delete this truck from the database?')) {
      setTruckDatabase(truckDatabase.filter(t => t.id !== id))
      setEditingTruck(null)
    }
  }

  // Sort trucks numerically by truck number
  const sortedTrucks = [...truckDatabase].sort((a, b) => {
    const numA = parseInt(a.truckNumber) || 0
    const numB = parseInt(b.truckNumber) || 0
    return numA - numB
  })

  // Get statistics
  const getTypeStats = () => {
    const stats: Record<TruckType, number> = {
      'Van': 0,
      'Small Box Truck': 0,
      'Normal Box Truck': 0,
      'Tandem': 0,
      'Other': 0
    }
    truckDatabase.forEach(truck => {
      stats[truck.truckType]++
    })
    return stats
  }

  const typeStats = getTypeStats()
  const manualCount = truckDatabase.filter(t => t.transmission === 'Manual').length
  const automaticCount = truckDatabase.filter(t => t.transmission === 'Automatic').length

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
              <Truck className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Truck Database</h1>
                <p className="text-sm text-gray-500">Permanent truck information - Protected from admin reset</p>
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
                <Link href="/trucks" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 transition-colors cursor-pointer">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">Truck Database</span>
                  </div>
                </Link>
                <Link href="/admin" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Admin Settings</span>
                  </div>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Protection Notice */}
        <Card className="bg-green-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">🛡️ Protected Database</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800">
              This truck database is <strong>permanently protected</strong> and will <strong>NEVER be deleted</strong> by admin reset functions. 
              All truck information can only be managed from this page.
            </p>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Fleet Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {truckTypes.map(type => (
                <div key={type} className="text-center">
                  <div className={`${truckTypeColors[type]} text-white rounded-lg p-3 mb-2`}>
                    <div className="text-2xl font-bold">{typeStats[type]}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{type}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{truckDatabase.length}</div>
                <div className="text-sm font-medium text-blue-600">Total Trucks</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-700">{manualCount}</div>
                <div className="text-sm font-medium text-purple-600">Manual</div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-700">{automaticCount}</div>
                <div className="text-sm font-medium text-orange-600">Automatic</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Truck Button */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <Button 
              onClick={addTruck}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Truck to Database
            </Button>
          </CardContent>
        </Card>

        {/* Truck List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">All Trucks (Sorted Numerically)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedTrucks.map(truck => (
                <div key={truck.id} className="border rounded-lg p-4 bg-white">
                  {editingTruck === truck.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-gray-900">Truck Number</Label>
                          <Input
                            value={truck.truckNumber}
                            onChange={(e) => updateTruck(truck.id, { truckNumber: e.target.value })}
                            placeholder="Enter truck number"
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-900">Type of Truck</Label>
                          <Select
                            value={truck.truckType}
                            onValueChange={(value: TruckType) => updateTruck(truck.id, { truckType: value })}
                          >
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                              <SelectValue className="text-gray-900" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {truckTypes.map(type => (
                                <SelectItem 
                                  key={type} 
                                  value={type}
                                  className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                                >
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-900">Transmission</Label>
                          <Select
                            value={truck.transmission}
                            onValueChange={(value: Transmission) => updateTruck(truck.id, { transmission: value })}
                          >
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                              <SelectValue className="text-gray-900" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {transmissions.map(trans => (
                                <SelectItem 
                                  key={trans} 
                                  value={trans}
                                  className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                                >
                                  {trans}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setEditingTruck(null)} 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => deleteTruck(truck.id)} 
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`${truckTypeColors[truck.truckType]} text-white rounded px-4 py-2 font-bold text-lg min-w-[80px] text-center`}>
                          {truck.truckNumber || 'New'}
                        </div>
                        <div className="text-gray-900 font-medium">{truck.truckType}</div>
                        <div className="text-gray-600 text-sm">{truck.transmission}</div>
                      </div>
                      <Button 
                        onClick={() => setEditingTruck(truck.id)} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {sortedTrucks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No trucks in database. Click "Add New Truck" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
