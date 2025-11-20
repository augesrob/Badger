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

const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

export default function PrintRoomPage() {
  const [trucks, setTrucks] = useState<TruckData[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (trucks.length > 0) {
      const timeoutId = setTimeout(() => {
        saveData()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [trucks])

  const loadData = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/trucks')
      if (response.ok) {
        const data = await response.json()
        setTrucks(data.trucks || [])
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
        body: JSON.stringify({ trucks })
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

  const addTruck = (door: string, batch: number = 1) => {
    const newTruck: TruckData = {
      id: Date.now().toString(),
      truckNumber: '',
      door,
      route: '1-Fond Du Lac',
      pods: 0,
      pallets: 0,
      notes: '',
      batch,
      truckType: 'Van'
    }
    setTrucks([...trucks, newTruck])
    setEditingTruck(newTruck.id)
  }

  const updateTruck = (id: string, updates: Partial<TruckData>) => {
    setTrucks(trucks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTruck = (id: string) => {
    if (confirm('Are you sure you want to delete this truck?')) {
      setTrucks(trucks.filter(t => t.id !== id))
      setEditingTruck(null)
    }
  }

  const getTrucksByBatch = (batch: number) => {
    return trucks.filter(t => t.batch === batch && !t.stagingDoor)
  }

  const getRouteStats = () => {
    const stats: Record<Route, number> = {
      '1-Fond Du Lac': 0,
      '2-Green Bay': 0,
      '3-Wausau': 0,
      '4-Caledonia': 0,
      '5-Chippewa Falls': 0
    }
    trucks.forEach(truck => {
      if (!truck.stagingDoor) stats[truck.route]++
    })
    return stats
  }

  const routeStats = getRouteStats()
  const totalPods = trucks.filter(t => !t.stagingDoor).reduce((sum, t) => sum + t.pods, 0)
  const totalPallets = trucks.filter(t => !t.stagingDoor).reduce((sum, t) => sum + t.pallets, 0)

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
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Print Room</h1>
                <p className="text-sm text-gray-500">Route planning and batch organization</p>
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 transition-colors cursor-pointer">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">Print Room</span>
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
        {/* Summary Statistics */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Shift Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {routes.map(route => (
                <div key={route} className="text-center">
                  <div className={`${routeColors[route]} text-white rounded-lg p-3 mb-2`}>
                    <div className="text-2xl font-bold">{routeStats[route]}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{route}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{totalPods}</div>
                <div className="text-sm font-medium text-blue-600">Total Pods</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{totalPallets}</div>
                <div className="text-sm font-medium text-green-600">Total Pallets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Door Grid */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Loading Doors (13A - 15B)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loadingDoors.map(door => {
                const doorTrucks = trucks.filter(t => t.door === door && !t.stagingDoor)
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <div className="text-center font-bold mb-2 text-lg text-gray-900">Door {door}</div>
                    {doorTrucks.length === 0 ? (
                      <Button 
                        onClick={() => addTruck(door)}
                        variant="outline"
                        className="w-full text-gray-900 border-gray-300 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Truck
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {doorTrucks.map(truck => (
                          <div key={truck.id} className={`${routeColors[truck.route]} text-white rounded p-2 text-center font-bold`}>
                            {truck.truckNumber || 'New'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Batch Management */}
        {[1, 2, 3, 4].map(batch => (
          <Card key={batch} className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Batch {batch}</CardTitle>
                <Button 
                  onClick={() => addTruck(loadingDoors[0], batch)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Truck
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTrucksByBatch(batch).map(truck => (
                  <div key={truck.id} className="border rounded-lg p-4 bg-white">
                    {editingTruck === truck.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-900">Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updateTruck(truck.id, { truckNumber: e.target.value })}
                              placeholder="Enter truck #"
                              className="bg-white text-gray-900 border-gray-300"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-900">Door</Label>
                            <Select
                              value={truck.door}
                              onValueChange={(value) => updateTruck(truck.id, { door: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-300">
                                {loadingDoors.map(door => (
                                  <SelectItem 
                                    key={door} 
                                    value={door}
                                    className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                                  >
                                    {door}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-900">Route</Label>
                            <Select
                              value={truck.route}
                              onValueChange={(value: Route) => updateTruck(truck.id, { route: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-300">
                                {routes.map(route => (
                                  <SelectItem 
                                    key={route} 
                                    value={route}
                                    className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                                  >
                                    {route}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-900">Truck Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruck(truck.id, { truckType: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-gray-300">
                                <SelectItem value="Van" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Van</SelectItem>
                                <SelectItem value="Box Truck" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Box Truck</SelectItem>
                                <SelectItem value="Tandem" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer">Tandem</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-900">Pods</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pods: Math.max(0, truck.pods - 1) })}
                                className="text-gray-900 border-gray-300 hover:bg-gray-100"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pods}
                                onChange={(e) => updateTruck(truck.id, { pods: parseInt(e.target.value) || 0 })}
                                className="text-center bg-white text-gray-900 border-gray-300"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pods: truck.pods + 1 })}
                                className="text-gray-900 border-gray-300 hover:bg-gray-100"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-900">Pallets/Trays</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pallets: Math.max(0, truck.pallets - 1) })}
                                className="text-gray-900 border-gray-300 hover:bg-gray-100"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pallets}
                                onChange={(e) => updateTruck(truck.id, { pallets: parseInt(e.target.value) || 0 })}
                                className="text-center bg-white text-gray-900 border-gray-300"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pallets: truck.pallets + 1 })}
                                className="text-gray-900 border-gray-300 hover:bg-gray-100"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-900">Notes</Label>
                          <Textarea
                            value={truck.notes}
                            onChange={(e) => updateTruck(truck.id, { notes: e.target.value })}
                            placeholder="Tray types, pallet specs, special instructions..."
                            rows={3}
                            className="bg-white text-gray-900 border-gray-300"
                          />
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
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className={`${routeColors[truck.route]} text-white rounded px-3 py-1 font-bold`}>
                              {truck.truckNumber || 'New'}
                            </div>
                            <div className="text-sm text-gray-600">Door {truck.door}</div>
                            <div className="text-sm text-gray-600">{truck.route}</div>
                            <div className="text-sm text-gray-600">{truck.truckType}</div>
                            <div className="text-sm text-gray-600">Pods: {truck.pods}</div>
                            <div className="text-sm text-gray-600">Pallets: {truck.pallets}</div>
                          </div>
                          {truck.notes && (
                            <div className="text-sm text-gray-500 mt-2">{truck.notes}</div>
                          )}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
