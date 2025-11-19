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
import { Truck, Users, Activity, Plus, Trash, Edit, Save, Menu } from 'lucide-react'

// Types
type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 
                   'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 
                   'End' | 'Gap' | 'Transfer'

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
  status: TruckStatus
  doorStatus?: DoorStatus
  ignored: boolean
  lastUpdated: number
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

// Initial data
const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
const doorStatuses: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
const truckStatuses: TruckStatus[] = [
  'On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back',
  'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B',
  'End', 'Gap', 'Transfer'
]

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

const statusColors: Record<TruckStatus, string> = {
  'On Route': 'bg-blue-600',
  'In Door': 'bg-green-600',
  'Put Away': 'bg-gray-600',
  'In Front': 'bg-yellow-600',
  'Ready': 'bg-cyan-600',
  'In Back': 'bg-indigo-600',
  'The Rock': 'bg-stone-600',
  'Yard': 'bg-lime-600',
  'Missing': 'bg-red-600',
  'Doors 8-11': 'bg-pink-600',
  'Doors 12A-15B': 'bg-teal-600',
  'End': 'bg-violet-600',
  'Gap': 'bg-amber-600',
  'Transfer': 'bg-fuchsia-600'
}

export default function TruckManagementSystem() {
  const [activeTab, setActiveTab] = useState<'print' | 'preshift' | 'movement'>('print')
  const [trucks, setTrucks] = useState<TruckData[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [filterRoute, setFilterRoute] = useState<Route | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TruckStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected')

  // Simulate real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('connected'), 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Add new truck
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
      truckType: 'Van',
      status: 'Ready',
      ignored: false,
      lastUpdated: Date.now()
    }
    setTrucks([...trucks, newTruck])
    setEditingTruck(newTruck.id)
  }

  // Update truck
  const updateTruck = (id: string, updates: Partial<TruckData>) => {
    setTrucks(trucks.map(t => 
      t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t
    ))
  }

  // Delete truck
  const deleteTruck = (id: string) => {
    setTrucks(trucks.filter(t => t.id !== id))
  }

  // Add driver
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

  // Update driver
  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(drivers.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ))
  }

  // Delete driver
  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id))
  }

  // Filter trucks
  const filteredTrucks = trucks.filter(truck => {
    if (truck.ignored && activeTab !== 'movement') return false
    if (filterRoute !== 'all' && truck.route !== filterRoute) return false
    if (filterStatus !== 'all' && truck.status !== filterStatus) return false
    if (searchTerm && !truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Get trucks by batch
  const getTrucksByBatch = (batch: number) => {
    return filteredTrucks.filter(t => t.batch === batch)
  }

  // Get route statistics
  const getRouteStats = () => {
    const stats: Record<Route, number> = {
      '1-Fond Du Lac': 0,
      '2-Green Bay': 0,
      '3-Wausau': 0,
      '4-Caledonia': 0,
      '5-Chippewa Falls': 0
    }
    trucks.forEach(truck => {
      if (!truck.ignored) stats[truck.route]++
    })
    return stats
  }

  // Render Print Room
  const renderPrintRoom = () => {
    const routeStats = getRouteStats()
    const totalPods = trucks.reduce((sum, t) => sum + t.pods, 0)
    const totalPallets = trucks.reduce((sum, t) => sum + t.pallets, 0)

    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Shift Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {routes.map(route => (
                <div key={route} className="text-center">
                  <div className={`${routeColors[route]} text-white rounded-lg p-3 mb-2`}>
                    <div className="text-2xl font-bold">{routeStats[route]}</div>
                  </div>
                  <div className="text-sm font-medium">{route}</div>
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
        <Card>
          <CardHeader>
            <CardTitle>Loading Doors (13A - 15B)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loadingDoors.map(door => {
                const doorTrucks = trucks.filter(t => t.door === door)
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="text-center font-bold mb-2 text-lg">Door {door}</div>
                    {doorTrucks.length === 0 ? (
                      <Button 
                        onClick={() => addTruck(door)}
                        variant="outline"
                        className="w-full"
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
          <Card key={batch}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Batch {batch}</CardTitle>
                <Button onClick={() => addTruck(loadingDoors[0], batch)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Truck
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTrucksByBatch(batch).map(truck => (
                  <div key={truck.id} className="border rounded-lg p-4">
                    {editingTruck === truck.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updateTruck(truck.id, { truckNumber: e.target.value })}
                              placeholder="Enter truck #"
                            />
                          </div>
                          <div>
                            <Label>Door</Label>
                            <Select
                              value={truck.door}
                              onValueChange={(value) => updateTruck(truck.id, { door: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingDoors.map(door => (
                                  <SelectItem key={door} value={door}>{door}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Route</Label>
                            <Select
                              value={truck.route}
                              onValueChange={(value: Route) => updateTruck(truck.id, { route: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {routes.map(route => (
                                  <SelectItem key={route} value={route}>{route}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Truck Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruck(truck.id, { truckType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {truckTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Pods</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pods: Math.max(0, truck.pods - 1) })}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pods}
                                onChange={(e) => updateTruck(truck.id, { pods: parseInt(e.target.value) || 0 })}
                                className="text-center"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pods: truck.pods + 1 })}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Pallets/Trays</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pallets: Math.max(0, truck.pallets - 1) })}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pallets}
                                onChange={(e) => updateTruck(truck.id, { pallets: parseInt(e.target.value) || 0 })}
                                className="text-center"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pallets: truck.pallets + 1 })}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea
                            value={truck.notes}
                            onChange={(e) => updateTruck(truck.id, { notes: e.target.value })}
                            placeholder="Tray types, pallet specs, special instructions..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingTruck(null)} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={() => deleteTruck(truck.id)} variant="destructive" size="sm">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 flex-wrap">
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
                        <Button onClick={() => setEditingTruck(truck.id)} variant="outline" size="sm">
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
    )
  }

  // Render PreShift
  const renderPreShift = () => {
    return (
      <div className="space-y-6">
        {/* Driver Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Driver & Equipment Database</CardTitle>
              <Button onClick={() => setNewDriverForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {newDriverForm && (
              <div className="mb-4">
                <Button onClick={addDriver} className="w-full">
                  Create New Driver Profile
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {drivers.map(driver => (
                <div key={driver.id} className="border rounded-lg p-4">
                  {editingDriver === driver.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            value={driver.name}
                            onChange={(e) => updateDriver(driver.id, { name: e.target.value })}
                            placeholder="Driver name"
                          />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            value={driver.phone}
                            onChange={(e) => updateDriver(driver.id, { phone: e.target.value })}
                            placeholder="(555) 555-5555"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Tractor Number</Label>
                        <Input
                          value={driver.tractorNumber}
                          onChange={(e) => updateDriver(driver.id, { tractorNumber: e.target.value })}
                          placeholder="Tractor #"
                        />
                      </div>
                      <div>
                        <Label>Trailer Numbers (comma separated)</Label>
                        <Input
                          value={driver.trailerNumbers.join(', ')}
                          onChange={(e) => updateDriver(driver.id, { 
                            trailerNumbers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="Trailer1, Trailer2, Trailer3..."
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={driver.notes}
                          onChange={(e) => updateDriver(driver.id, { notes: e.target.value })}
                          placeholder="Availability, time off, special circumstances..."
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setEditingDriver(null)} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => updateDriver(driver.id, { active: !driver.active })}
                          variant={driver.active ? "outline" : "default"}
                          size="sm"
                        >
                          {driver.active ? 'Set Inactive' : 'Set Active'}
                        </Button>
                        <Button onClick={() => deleteDriver(driver.id)} variant="destructive" size="sm">
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 flex-wrap">
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
                      <Button onClick={() => setEditingDriver(driver.id)} variant="outline" size="sm">
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
        <Card>
          <CardHeader>
            <CardTitle>Staging Doors (18-28) - Position Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stagingDoors.map(door => {
                const doorTrucks = trucks
                  .filter(t => t.stagingDoor === door)
                  .sort((a, b) => (a.stagingPosition || 0) - (b.stagingPosition || 0))
                
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="text-center font-bold mb-3 text-lg">Door {door}</div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(position => {
                        const truck = doorTrucks.find(t => t.stagingPosition === position)
                        return (
                          <div key={position} className="border rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">Position {position} {position === 1 ? '(Front)' : position === 4 ? '(Back)' : ''}</div>
                            {truck ? (
                              <div className={`${routeColors[truck.route]} text-white rounded p-2 text-center text-sm font-bold`}>
                                {truck.truckNumber} - {truck.truckType}
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
                      onClick={() => {
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
                          stagingPosition: doorTrucks.length + 1,
                          status: 'Ready',
                          ignored: false,
                          lastUpdated: Date.now()
                        }
                        setTrucks([...trucks, newTruck])
                        setEditingTruck(newTruck.id)
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
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
        <Card>
          <CardHeader>
            <CardTitle>PreShift Status Summary</CardTitle>
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
    )
  }

  // Render Movement
  const renderMovement = () => {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Search Truck Number</Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                />
              </div>
              <div>
                <Label>Filter by Route</Label>
                <Select value={filterRoute} onValueChange={(value: Route | 'all') => setFilterRoute(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routes</SelectItem>
                    {routes.map(route => (
                      <SelectItem key={route} value={route}>{route}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Filter by Status</Label>
                <Select value={filterStatus} onValueChange={(value: TruckStatus | 'all') => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {truckStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movement Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Live Truck Movement Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTrucks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No trucks to display. Add trucks in the Print Room or PreShift tabs.
                </div>
              ) : (
                filteredTrucks.map(truck => (
                  <div key={truck.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className={`${routeColors[truck.route]} text-white rounded px-4 py-2 font-bold text-lg`}>
                          {truck.truckNumber || 'New'}
                        </div>
                        <div className={`${statusColors[truck.status]} text-white rounded px-3 py-1 text-sm font-medium`}>
                          {truck.status}
                        </div>
                        <div className="text-sm text-gray-600">Door {truck.door}</div>
                        <div className="text-sm text-gray-600">{truck.route}</div>
                        <div className="text-sm text-gray-600">{truck.truckType}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateTruck(truck.id, { ignored: !truck.ignored })}
                          variant={truck.ignored ? "default" : "outline"}
                          size="sm"
                        >
                          {truck.ignored ? 'Unignore' : 'Ignore'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Truck Status</Label>
                        <Select
                          value={truck.status}
                          onValueChange={(value: TruckStatus) => updateTruck(truck.id, { status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {truckStatuses.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Door Status</Label>
                        <Select
                          value={truck.doorStatus || 'Loading'}
                          onValueChange={(value: DoorStatus) => updateTruck(truck.id, { doorStatus: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {doorStatuses.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm text-gray-600">Pods</div>
                        <div className="text-xl font-bold text-blue-700">{truck.pods}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm text-gray-600">Pallets</div>
                        <div className="text-xl font-bold text-green-700">{truck.pallets}</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-sm text-gray-600">Batch</div>
                        <div className="text-xl font-bold text-purple-700">{truck.batch}</div>
                      </div>
                    </div>

                    {truck.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                        <div className="text-sm text-gray-600">{truck.notes}</div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-400">
                      Last updated: {new Date(truck.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {filteredTrucks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Status Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {truckStatuses.slice(0, 8).map(status => (
                  <Button
                    key={status}
                    onClick={() => {
                      const selectedTrucks = filteredTrucks.filter(t => !t.ignored)
                      if (selectedTrucks.length > 0 && window.confirm(`Update ${selectedTrucks.length} trucks to ${status}?`)) {
                        selectedTrucks.forEach(truck => updateTruck(truck.id, { status }))
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className={`${statusColors[status]} text-white hover:opacity-80`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Truck Management System</h1>
                <p className="text-sm text-gray-500">Real-time synchronized warehouse operations</p>
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
              <div className="text-sm text-gray-600">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('print')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'print'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4" />
                Print Room
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preshift')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'preshift'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                PreShift Setup
              </div>
            </button>
            <button
              onClick={() => setActiveTab('movement')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'movement'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Movement
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'print' && renderPrintRoom()}
        {activeTab === 'preshift' && renderPreShift()}
        {activeTab === 'movement' && renderMovement()}
      </div>
    </div>
  )
}

// END OF FILE