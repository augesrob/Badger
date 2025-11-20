"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Truck, Plus, Trash, Edit, Save, Menu, Home, X, Users, Activity } from 'lucide-react'
import Link from 'next/link'

type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'

interface TruckData {
  id: string
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  truckType: TruckType
  stagingDoor?: string
  stagingPosition?: number
}

interface Driver {
  id: string
  name: string
  phone: string
  tractorNumber: string
  trailerNumbers: string[]
  notes: string
  active: boolean
}

const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

export default function PreShiftPage() {
  const [trucks, setTrucks] = useState<TruckData[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (trucks.length > 0 || drivers.length > 0) {
      saveData()
    }
  }, [trucks, drivers])

  const loadData = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/trucks')
      if (response.ok) {
        const data = await response.json()
        setTrucks(data.trucks || [])
        setDrivers(data.drivers || [])
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
        body: JSON.stringify({ trucks, drivers })
      })
      if (response.ok) {
        setSyncStatus('connected')
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      setSyncStatus('error')
    }
  }

  const addDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      tractorNumber: '',
      trailerNumbers: [],
      notes: '',
      active: true
    }
    setDrivers([...drivers, newDriver])
    setEditingDriver(newDriver.id)
    setNewDriverForm(false)
  }

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id))
  }

  const addTruckToStaging = (door: string) => {
    const doorTrucks = trucks.filter(t => t.stagingDoor === door)
    const newTruck: TruckData = {
      id: Date.now().toString(),
      truckNumber: '',
      door: loadingDoors[0],
      route: '1-Fond Du Lac',
      pods: 0,
      pallets: 0,
      notes: '',
      batch: 1,
      truckType: 'Van',
      stagingDoor: door,
      stagingPosition: doorTrucks.length + 1
    }
    setTrucks([...trucks, newTruck])
    setEditingTruck(newTruck.id)
  }

  const updateTruck = (id: string, updates: Partial<TruckData>) => {
    setTrucks(trucks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTruck = (id: string) => {
    setTrucks(trucks.filter(t => t.id !== id))
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
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PreShift Setup</h1>
                <p className="text-sm text-gray-500">Driver assignments and staging positions</p>
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 transition-colors cursor-pointer">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">PreShift Setup</span>
                  </div>
                </Link>
                <Link href="/movement" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Live Movement</span>
                  </div>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Driver Management */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Driver & Equipment Database</CardTitle>
              <Button 
                onClick={() => setNewDriverForm(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {newDriverForm && (
              <div className="mb-4">
                <Button 
                  onClick={addDriver} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Create New Driver Profile
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {drivers.map(driver => (
                <div key={driver.id} className="border rounded-lg p-4 bg-white">
                  {editingDriver === driver.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Full Name</Label>
                          <Input
                            value={driver.name}
                            onChange={(e) => updateDriver(driver.id, { name: e.target.value })}
                            placeholder="Driver name"
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Phone Number</Label>
                          <Input
                            value={driver.phone}
                            onChange={(e) => updateDriver(driver.id, { phone: e.target.value })}
                            placeholder="(555) 555-5555"
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700">Tractor Number</Label>
                        <Input
                          value={driver.tractorNumber}
                          onChange={(e) => updateDriver(driver.id, { tractorNumber: e.target.value })}
                          placeholder="Tractor #"
                          className="bg-white text-gray-900 border-gray-300"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Trailer Numbers (comma separated)</Label>
                        <Input
                          value={driver.trailerNumbers.join(', ')}
                          onChange={(e) => updateDriver(driver.id, { 
                            trailerNumbers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="Trailer1, Trailer2, Trailer3..."
                          className="bg-white text-gray-900 border-gray-300"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Notes</Label>
                        <Textarea
                          value={driver.notes}
                          onChange={(e) => updateDriver(driver.id, { notes: e.target.value })}
                          placeholder="Availability, time off, special circumstances..."
                          rows={2}
                          className="bg-white text-gray-900 border-gray-300"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setEditingDriver(null)} 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => updateDriver(driver.id, { active: !driver.active })}
                          className={driver.active ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                        >
                          {driver.active ? 'Set Inactive' : 'Set Active'}
                        </Button>
                        <Button 
                          onClick={() => deleteDriver(driver.id)} 
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className={`${driver.active ? 'bg-green-500' : 'bg-gray-400'} text-white rounded px-3 py-1 font-bold`}>
                            {driver.name || 'New Driver'}
                          </div>
                          <div className="text-sm text-gray-600">{driver.phone}</div>
                          <div className="text-sm text-gray-600">Tractor: {driver.tractorNumber}</div>
                          <div className="text-sm text-gray-600">
                            Trailers: {driver.trailerNumbers.length > 0 ? driver.trailerNumbers.join(', ') : 'None'}
                          </div>
                        </div>
                        {driver.notes && (
                          <div className="text-sm text-gray-500 mt-2">{driver.notes}</div>
                        )}
                      </div>
                      <Button 
                        onClick={() => setEditingDriver(driver.id)} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staging Doors */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Staging Doors (18-28) - Position Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stagingDoors.map(door => {
                const doorTrucks = trucks
                  .filter(t => t.stagingDoor === door)
                  .sort((a, b) => (a.stagingPosition || 0) - (b.stagingPosition || 0))
                
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <div className="text-center font-bold mb-3 text-lg text-gray-900">Door {door}</div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(position => {
                        const truck = doorTrucks.find(t => t.stagingPosition === position)
                        return (
                          <div key={position} className="border rounded p-2 bg-white">
                            <div className="text-xs text-gray-500 mb-1">
                              Position {position} {position === 1 ? '(Front)' : position === 4 ? '(Back)' : ''}
                            </div>
                            {truck ? (
                              <div className={`${routeColors[truck.route]} text-white rounded p-2 text-center text-sm font-bold`}>
                                {truck.truckNumber || 'New'} - {truck.truckType}
                              </div>
                            ) : (
                              <div className="bg-gray-100 rounded p-2 text-center text-sm text-gray-400">
                                Empty
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <Button 
                      onClick={() => addTruckToStaging(door)}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Truck
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* PreShift Status Board */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">PreShift Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{trucks.length}</div>
                <div className="text-sm font-medium text-blue-600">Total Trucks</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">
                  {trucks.filter(t => t.stagingDoor).length}
                </div>
                <div className="text-sm font-medium text-green-600">Staged Trucks</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-700">{drivers.filter(d => d.active).length}</div>
                <div className="text-sm font-medium text-purple-600">Active Drivers</div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-700">
                  {drivers.reduce((sum, d) => sum + d.trailerNumbers.length, 0)}
                </div>
                <div className="text-sm font-medium text-orange-600">Total Trailers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
