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
import { Truck, Plus, Trash, Edit, Save, Menu, Home, X, Users, Activity, Shield } from 'lucide-react'
import Link from 'next/link'

type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Tandem'

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
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Tandem']

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
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')
  const [expandedTruck, setExpandedTruck] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (trucks.length > 0 || drivers.length > 0) {
      const timeoutId = setTimeout(() => {
        saveData()
      }, 1000)
      return () => clearTimeout(timeoutId)
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

  const addDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      tractorNumber: '',
      trailerNumbers: ['', '', ''],
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

  const updateDriverTrailer = (driverId: string, index: number, value: string) => {
    const driver = drivers.find(d => d.id === driverId)
    if (driver) {
      const newTrailers = [...driver.trailerNumbers]
      newTrailers[index] = value
      updateDriver(driverId, { trailerNumbers: newTrailers })
    }
  }

  const addTrailerSlot = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId)
    if (driver) {
      updateDriver(driverId, { trailerNumbers: [...driver.trailerNumbers, ''] })
    }
  }

  const removeTrailerSlot = (driverId: string, index: number) => {
    const driver = drivers.find(d => d.id === driverId)
    if (driver && driver.trailerNumbers.length > 1) {
      const newTrailers = driver.trailerNumbers.filter((_, i) => i !== index)
      updateDriver(driverId, { trailerNumbers: newTrailers })
    }
  }

  const deleteDriver = (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(d => d.id !== id))
    }
  }

  const updateTruckNumber = (door: string, position: number, truckNumber: string) => {
    const existingTruck = trucks.find(t => t.stagingDoor === door && t.stagingPosition === position)
    
    if (existingTruck) {
      if (truckNumber.trim() === '') {
        setTrucks(trucks.filter(t => t.id !== existingTruck.id))
      } else {
        setTrucks(trucks.map(t => 
          t.id === existingTruck.id ? { ...t, truckNumber } : t
        ))
      }
    } else if (truckNumber.trim() !== '') {
      const newTruck: TruckData = {
        id: Date.now().toString(),
        truckNumber,
        door: loadingDoors[0],
        route: '1-Fond Du Lac',
        pods: 0,
        pallets: 0,
        notes: '',
        batch: 1,
        truckType: 'Van',
        stagingDoor: door,
        stagingPosition: position
      }
      setTrucks([...trucks, newTruck])
    }
  }

  const updateTruck = (id: string, updates: Partial<TruckData>) => {
    setTrucks(trucks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTruck = (id: string) => {
    setTrucks(trucks.filter(t => t.id !== id))
    setExpandedTruck(null)
  }

  // Helper function to get position label
  const getPositionLabel = (position: number) => {
    switch (position) {
      case 1:
        return 'Front Left'
      case 2:
        return 'Back Left'
      case 3:
        return 'Front Right'
      case 4:
        return 'Back Right'
      default:
        return `Position ${position}`
    }
  }

  // Helper function to get position styling
  const getPositionStyle = (position: number) => {
    // Position 1 & 3 are front (lighter background)
    // Position 2 & 4 are back (darker background)
    const isFront = position === 1 || position === 3
    return isFront ? 'bg-blue-50 border-blue-300' : 'bg-gray-100 border-gray-400'
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
                <p className="text-sm text-gray-500">Semi driver assignments and staging positions</p>
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
        {/* Garage Layout Explanation */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Garage Layout Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-blue-800">
                Each staging door represents a 4-vehicle garage with 2 vehicles in front and 2 in back:
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 text-center">
                  <div className="font-bold text-blue-900">Position 1</div>
                  <div className="text-sm text-blue-700">Front Left</div>
                </div>
                <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 text-center">
                  <div className="font-bold text-blue-900">Position 3</div>
                  <div className="text-sm text-blue-700">Front Right</div>
                </div>
                <div className="bg-gray-200 border-2 border-gray-500 rounded-lg p-3 text-center">
                  <div className="font-bold text-gray-900">Position 2</div>
                  <div className="text-sm text-gray-700">Back Left</div>
                </div>
                <div className="bg-gray-200 border-2 border-gray-500 rounded-lg p-3 text-center">
                  <div className="font-bold text-gray-900">Position 4</div>
                  <div className="text-sm text-gray-700">Back Right</div>
                </div>
              </div>
              <p className="text-xs text-blue-700 text-center mt-2">
                Front positions (1 & 3) have lighter background, Back positions (2 & 4) have darker background
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Driver Management - Semi Tractors & Trailers */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Semi Tractor & Trailer Database</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Manage semi drivers, tractors, and trailer assignments</p>
              </div>
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
                  Create New Semi Driver Profile
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
                          <Label className="text-gray-700">Driver Full Name</Label>
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
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-gray-700">Trailer Numbers</Label>
                          <Button
                            onClick={() => addTrailerSlot(driver.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Trailer
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {driver.trailerNumbers.map((trailer, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={trailer}
                                onChange={(e) => updateDriverTrailer(driver.id, index, e.target.value)}
                                placeholder={`Trailer ${index + 1}`}
                                className="flex-1 bg-white text-gray-900 border-gray-300"
                              />
                              {driver.trailerNumbers.length > 1 && (
                                <Button
                                  onClick={() => removeTrailerSlot(driver.id, index)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  size="sm"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
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
                            Trailers: {driver.trailerNumbers.filter(t => t.trim()).length > 0 
                              ? driver.trailerNumbers.filter(t => t.trim()).join(', ') 
                              : 'None'}
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

        {/* Staging Doors - Box Trucks, Vans, Tandems */}
        <Card className="bg-white">
          <CardHeader>
            <div>
              <CardTitle className="text-gray-900">Staging Doors (18-28)</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Box Trucks, Vans, and Tandems - 4-Vehicle Garage Layout</p>
            </div>
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
                    
                    {/* Garage Layout: 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {/* Position 1: Front Left */}
                      {(() => {
                        const truck = doorTrucks.find(t => t.stagingPosition === 1)
                        const isExpanded = expandedTruck === truck?.id
                        
                        return (
                          <div className={`border-2 rounded p-2 ${getPositionStyle(1)}`}>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {getPositionLabel(1)}
                            </div>
                            
                            {truck ? (
                              <div>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={truck.truckNumber}
                                    onChange={(e) => updateTruckNumber(door, 1, e.target.value)}
                                    placeholder="Truck #"
                                    className="flex-1 bg-white text-gray-900 border-gray-300 font-bold text-sm h-8"
                                  />
                                  <Button
                                    onClick={() => setExpandedTruck(isExpanded ? null : truck.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 h-8 w-8"
                                    size="sm"
                                  >
                                    {isExpanded ? <X className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                                  </Button>
                                </div>
                                
                                {!isExpanded && (
                                  <div className={`${routeColors[truck.route]} text-white rounded p-1 text-center text-xs font-medium mt-1`}>
                                    {truck.truckType}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Input
                                placeholder="Truck #"
                                onChange={(e) => updateTruckNumber(door, 1, e.target.value)}
                                className="bg-white text-gray-900 border-gray-300 text-sm h-8"
                              />
                            )}
                          </div>
                        )
                      })()}

                      {/* Position 3: Front Right */}
                      {(() => {
                        const truck = doorTrucks.find(t => t.stagingPosition === 3)
                        const isExpanded = expandedTruck === truck?.id
                        
                        return (
                          <div className={`border-2 rounded p-2 ${getPositionStyle(3)}`}>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {getPositionLabel(3)}
                            </div>
                            
                            {truck ? (
                              <div>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={truck.truckNumber}
                                    onChange={(e) => updateTruckNumber(door, 3, e.target.value)}
                                    placeholder="Truck #"
                                    className="flex-1 bg-white text-gray-900 border-gray-300 font-bold text-sm h-8"
                                  />
                                  <Button
                                    onClick={() => setExpandedTruck(isExpanded ? null : truck.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 h-8 w-8"
                                    size="sm"
                                  >
                                    {isExpanded ? <X className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                                  </Button>
                                </div>
                                
                                {!isExpanded && (
                                  <div className={`${routeColors[truck.route]} text-white rounded p-1 text-center text-xs font-medium mt-1`}>
                                    {truck.truckType}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Input
                                placeholder="Truck #"
                                onChange={(e) => updateTruckNumber(door, 3, e.target.value)}
                                className="bg-white text-gray-900 border-gray-300 text-sm h-8"
                              />
                            )}
                          </div>
                        )
                      })()}

                      {/* Position 2: Back Left */}
                      {(() => {
                        const truck = doorTrucks.find(t => t.stagingPosition === 2)
                        const isExpanded = expandedTruck === truck?.id
                        
                        return (
                          <div className={`border-2 rounded p-2 ${getPositionStyle(2)}`}>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {getPositionLabel(2)}
                            </div>
                            
                            {truck ? (
                              <div>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={truck.truckNumber}
                                    onChange={(e) => updateTruckNumber(door, 2, e.target.value)}
                                    placeholder="Truck #"
                                    className="flex-1 bg-white text-gray-900 border-gray-300 font-bold text-sm h-8"
                                  />
                                  <Button
                                    onClick={() => setExpandedTruck(isExpanded ? null : truck.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 h-8 w-8"
                                    size="sm"
                                  >
                                    {isExpanded ? <X className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                                  </Button>
                                </div>
                                
                                {!isExpanded && (
                                  <div className={`${routeColors[truck.route]} text-white rounded p-1 text-center text-xs font-medium mt-1`}>
                                    {truck.truckType}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Input
                                placeholder="Truck #"
                                onChange={(e) => updateTruckNumber(door, 2, e.target.value)}
                                className="bg-white text-gray-900 border-gray-300 text-sm h-8"
                              />
                            )}
                          </div>
                        )
                      })()}

                      {/* Position 4: Back Right */}
                      {(() => {
                        const truck = doorTrucks.find(t => t.stagingPosition === 4)
                        const isExpanded = expandedTruck === truck?.id
                        
                        return (
                          <div className={`border-2 rounded p-2 ${getPositionStyle(4)}`}>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {getPositionLabel(4)}
                            </div>
                            
                            {truck ? (
                              <div>
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={truck.truckNumber}
                                    onChange={(e) => updateTruckNumber(door, 4, e.target.value)}
                                    placeholder="Truck #"
                                    className="flex-1 bg-white text-gray-900 border-gray-300 font-bold text-sm h-8"
                                  />
                                  <Button
                                    onClick={() => setExpandedTruck(isExpanded ? null : truck.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 h-8 w-8"
                                    size="sm"
                                  >
                                    {isExpanded ? <X className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                                  </Button>
                                </div>
                                
                                {!isExpanded && (
                                  <div className={`${routeColors[truck.route]} text-white rounded p-1 text-center text-xs font-medium mt-1`}>
                                    {truck.truckType}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Input
                                placeholder="Truck #"
                                onChange={(e) => updateTruckNumber(door, 4, e.target.value)}
                                className="bg-white text-gray-900 border-gray-300 text-sm h-8"
                              />
                            )}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Expanded truck details */}
                    {doorTrucks.map(truck => {
                      if (expandedTruck !== truck.id) return null
                      
                      return (
                        <div key={truck.id} className="mt-3 space-y-2 p-3 bg-gray-50 rounded border">
                          <div>
                            <Label className="text-gray-700 text-xs">Route</Label>
                            <Select
                              value={truck.route}
                              onValueChange={(value: Route) => updateTruck(truck.id, { route: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900 border-gray-300 h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {routes.map(route => (
                                  <SelectItem key={route} value={route}>{route}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-gray-700 text-xs">Vehicle Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruck(truck.id, { truckType: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900 border-gray-300 h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {truckTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-gray-700 text-xs">Notes</Label>
                            <Textarea
                              value={truck.notes}
                              onChange={(e) => updateTruck(truck.id, { notes: e.target.value })}
                              placeholder="Special instructions..."
                              rows={2}
                              className="bg-white text-gray-900 border-gray-300 text-sm"
                            />
                          </div>
                          
                          <Button
                            onClick={() => deleteTruck(truck.id)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Remove Vehicle
                          </Button>
                        </div>
                      )
                    })}
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
                <div className="text-sm font-medium text-blue-600">Total Vehicles</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">
                  {trucks.filter(t => t.stagingDoor).length}
                </div>
                <div className="text-sm font-medium text-green-600">Staged Vehicles</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-700">{drivers.filter(d => d.active).length}</div>
                <div className="text-sm font-medium text-purple-600">Active Drivers</div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-700">
                  {drivers.reduce((sum, d) => sum + d.trailerNumbers.filter(t => t.trim()).length, 0)}
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
