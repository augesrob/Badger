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
import { Truck, Users, Activity, Plus, Trash, Edit, Save, X, ChevronRight, ChevronLeft, Menu } from 'lucide-react'

// Types
type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 
                   'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 
                   'End' | 'Gap' | 'Transfer'

interface PrintRoomTruck {
  id: string
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  lastUpdated: number
}

interface PreShiftTruck {
  id: string
  truckNumber: string
  stagingDoor: string
  stagingPosition: number
  trailer1?: string
  trailer2?: string
  trailer3?: string
  lastUpdated: number
}

interface MovementTruck {
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  truckType: TruckType
  status: TruckStatus
  doorStatus: DoorStatus
  ignored: boolean
  trailer1?: string
  trailer2?: string
  trailer3?: string
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

interface VanSemiNumber {
  id: string
  number: string
  type: 'Van' | 'Semi'
}

// Initial data
const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const receivingDoors = ['8', '9', '10', '11']
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
const doorStatuses: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
const truckStatuses: TruckStatus[] = [
  'On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back',
  'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B',
  'End', 'Gap', 'Transfer'
]

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-600 hover:bg-blue-700',
  '2-Green Bay': 'bg-green-600 hover:bg-green-700',
  '3-Wausau': 'bg-purple-600 hover:bg-purple-700',
  '4-Caledonia': 'bg-orange-600 hover:bg-orange-700',
  '5-Chippewa Falls': 'bg-red-600 hover:bg-red-700'
}

const statusColors: Record<TruckStatus, string> = {
  'On Route': 'bg-blue-700 hover:bg-blue-800',
  'In Door': 'bg-green-700 hover:bg-green-800',
  'Put Away': 'bg-gray-700 hover:bg-gray-800',
  'In Front': 'bg-yellow-700 hover:bg-yellow-800',
  'Ready': 'bg-cyan-700 hover:bg-cyan-800',
  'In Back': 'bg-indigo-700 hover:bg-indigo-800',
  'The Rock': 'bg-stone-700 hover:bg-stone-800',
  'Yard': 'bg-lime-700 hover:bg-lime-800',
  'Missing': 'bg-red-700 hover:bg-red-800',
  'Doors 8-11': 'bg-pink-700 hover:bg-pink-800',
  'Doors 12A-15B': 'bg-teal-700 hover:bg-teal-800',
  'End': 'bg-violet-700 hover:bg-violet-800',
  'Gap': 'bg-amber-700 hover:bg-amber-800',
  'Transfer': 'bg-fuchsia-700 hover:bg-fuchsia-800'
}

const doorStatusColors: Record<DoorStatus, string> = {
  'Loading': 'bg-green-600',
  'EOT': 'bg-yellow-600',
  'EOT+1': 'bg-orange-600',
  'Change Truck/Trailer': 'bg-blue-600',
  'Waiting': 'bg-gray-600',
  'Done For Night': 'bg-red-600'
}

export default function TruckManagementSystem() {
  const [activeTab, setActiveTab] = useState<'print' | 'preshift' | 'movement'>('print')
  const [printRoomTrucks, setPrintRoomTrucks] = useState<PrintRoomTruck[]>([])
  const [preShiftTrucks, setPreShiftTrucks] = useState<PreShiftTruck[]>([])
  const [movementTrucks, setMovementTrucks] = useState<Record<string, MovementTruck>>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vanSemiNumbers, setVanSemiNumbers] = useState<VanSemiNumber[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [newVanSemiForm, setNewVanSemiForm] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected')

  // Simulate real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing')
      setTimeout(() => setSyncStatus('connected'), 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Sync Print Room and PreShift to Movement
  useEffect(() => {
    const newMovementTrucks: Record<string, MovementTruck> = {}
    
    printRoomTrucks.forEach(printTruck => {
      const preShiftTruck = preShiftTrucks.find(pt => pt.truckNumber === printTruck.truckNumber)
      const existingMovement = movementTrucks[printTruck.truckNumber]
      
      newMovementTrucks[printTruck.truckNumber] = {
        truckNumber: printTruck.truckNumber,
        door: printTruck.door,
        route: printTruck.route,
        pods: printTruck.pods,
        pallets: printTruck.pallets,
        notes: printTruck.notes,
        batch: printTruck.batch,
        truckType: determineTruckType(printTruck.truckNumber),
        status: existingMovement?.status || (preShiftTruck ? 'Ready' : 'Missing'),
        doorStatus: existingMovement?.doorStatus || 'Loading',
        ignored: existingMovement?.ignored || false,
        trailer1: preShiftTruck?.trailer1,
        trailer2: preShiftTruck?.trailer2,
        trailer3: preShiftTruck?.trailer3,
        lastUpdated: Date.now()
      }
    })
    
    setMovementTrucks(newMovementTrucks)
  }, [printRoomTrucks, preShiftTrucks, vanSemiNumbers])

  // Determine truck type based on number
  const determineTruckType = (truckNumber: string): TruckType => {
    const num = parseInt(truckNumber)
    
    // Check if it's in van/semi list
    const vanSemi = vanSemiNumbers.find(vs => vs.number === truckNumber)
    if (vanSemi) {
      return vanSemi.type
    }
    
    // Below 170 is manual (Box Truck)
    if (!isNaN(num) && num < 170) {
      return 'Box Truck'
    }
    
    // 170 and above is Semi Trailer
    return 'Semi Trailer'
  }

  // Print Room functions
  const addPrintRoomTruck = (door: string, batch: number = 1) => {
    const newTruck: PrintRoomTruck = {
      id: Date.now().toString(),
      truckNumber: '',
      door,
      route: '1-Fond Du Lac',
      pods: 0,
      pallets: 0,
      notes: '',
      batch,
      lastUpdated: Date.now()
    }
    setPrintRoomTrucks([...printRoomTrucks, newTruck])
    setEditingTruck(newTruck.id)
  }

  const updatePrintRoomTruck = (id: string, updates: Partial<PrintRoomTruck>) => {
    setPrintRoomTrucks(printRoomTrucks.map(t => 
      t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t
    ))
  }

  const deletePrintRoomTruck = (id: string) => {
    setPrintRoomTrucks(printRoomTrucks.filter(t => t.id !== id))
    if (editingTruck === id) {
      setEditingTruck(null)
    }
  }

  // PreShift functions
  const addPreShiftTruck = (door: string, position: number) => {
    const newTruck: PreShiftTruck = {
      id: Date.now().toString(),
      truckNumber: '',
      stagingDoor: door,
      stagingPosition: position,
      lastUpdated: Date.now()
    }
    setPreShiftTrucks([...preShiftTrucks, newTruck])
    return newTruck.id
  }

  const updatePreShiftTruck = (id: string, updates: Partial<PreShiftTruck>) => {
    setPreShiftTrucks(preShiftTrucks.map(t => 
      t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t
    ))
  }

  const deletePreShiftTruck = (id: string) => {
    setPreShiftTrucks(preShiftTrucks.filter(t => t.id !== id))
  }

  // Movement functions
  const updateMovementTruck = (truckNumber: string, updates: Partial<MovementTruck>) => {
    setMovementTrucks(prev => ({
      ...prev,
      [truckNumber]: {
        ...prev[truckNumber],
        ...updates,
        lastUpdated: Date.now()
      }
    }))
  }

  // Driver functions
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
    setDrivers(drivers.map(d => 
      d.id === id ? { ...d, ...updates } : d
    ))
  }

  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id))
  }

  // Van/Semi functions
  const addVanSemiNumber = (number: string, type: 'Van' | 'Semi') => {
    const newVanSemi: VanSemiNumber = {
      id: Date.now().toString(),
      number,
      type
    }
    setVanSemiNumbers([...vanSemiNumbers, newVanSemi])
  }

  const deleteVanSemiNumber = (id: string) => {
    setVanSemiNumbers(vanSemiNumbers.filter(vs => vs.id !== id))
  }

  // Get trucks by batch
  const getPrintRoomTrucksByBatch = (batch: number) => {
    return printRoomTrucks.filter(t => t.batch === batch)
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
    printRoomTrucks.forEach(truck => {
      stats[truck.route]++
    })
    return stats
  }

  // Get trucks by door for movement view
  const getMovementTrucksByDoor = (door: string) => {
    return Object.values(movementTrucks).filter(t => t.door === door && !t.ignored)
  }

  // Render Print Room
  const renderPrintRoom = () => {
    const routeStats = getRouteStats()
    const totalPods = printRoomTrucks.reduce((sum, t) => sum + t.pods, 0)
    const totalPallets = printRoomTrucks.reduce((sum, t) => sum + t.pallets, 0)

    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-gray-900">Shift Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {routes.map(route => (
                <div key={route} className="text-center">
                  <div className={`${routeColors[route]} text-white rounded-lg p-3 mb-2 shadow-md`}>
                    <div className="text-2xl font-bold">{routeStats[route]}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{route}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{totalPods}</div>
                <div className="text-sm font-medium text-blue-600">Total Pods</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{totalPallets}</div>
                <div className="text-sm font-medium text-green-600">Total Pallets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Door Grid */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-gray-900">Loading Doors (13A - 15B)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loadingDoors.map(door => {
                const doorTrucks = printRoomTrucks.filter(t => t.door === door)
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="text-center font-bold mb-2 text-lg text-gray-900">Door {door}</div>
                    {doorTrucks.length === 0 ? (
                      <Button 
                        onClick={() => addPrintRoomTruck(door)}
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Truck
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {doorTrucks.map(truck => (
                          <div key={truck.id} className={`${routeColors[truck.route]} text-white rounded p-2 text-center font-bold shadow-sm`}>
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
          <Card key={batch} className="bg-white border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Batch {batch}</CardTitle>
                <Button onClick={() => addPrintRoomTruck(loadingDoors[0], batch)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Truck
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {getPrintRoomTrucksByBatch(batch).map(truck => (
                  <div key={truck.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    {editingTruck === truck.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-700">Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updatePrintRoomTruck(truck.id, { truckNumber: e.target.value })}
                              placeholder="Enter truck #"
                              className="border-gray-300 text-gray-900 bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700">Door</Label>
                            <Select
                              value={truck.door}
                              onValueChange={(value) => updatePrintRoomTruck(truck.id, { door: value })}
                            >
                              <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-300 z-50">
                                {loadingDoors.map(door => (
                                  <SelectItem key={door} value={door} className="text-gray-900 bg-white hover:bg-gray-100">{door}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700">Route</Label>
                            <Select
                              value={truck.route}
                              onValueChange={(value: Route) => updatePrintRoomTruck(truck.id, { route: value })}
                            >
                              <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-300 z-50">
                                {routes.map(route => (
                                  <SelectItem key={route} value={route} className="text-gray-900 bg-white hover:bg-gray-100">{route}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700">Pods</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePrintRoomTruck(truck.id, { pods: Math.max(0, truck.pods - 1) })}
                                className="border-gray-300 text-gray-700 bg-white"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pods}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { pods: parseInt(e.target.value) || 0 })}
                                className="text-center border-gray-300 text-gray-900 bg-white"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePrintRoomTruck(truck.id, { pods: truck.pods + 1 })}
                                className="border-gray-300 text-gray-700 bg-white"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-gray-700">Pallets/Trays</Label>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePrintRoomTruck(truck.id, { pallets: Math.max(0, truck.pallets - 1) })}
                                className="border-gray-300 text-gray-700 bg-white"
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pallets}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { pallets: parseInt(e.target.value) || 0 })}
                                className="text-center border-gray-300 text-gray-900 bg-white"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePrintRoomTruck(truck.id, { pallets: truck.pallets + 1 })}
                                className="border-gray-300 text-gray-700 bg-white"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700">Notes</Label>
                          <Textarea
                            value={truck.notes}
                            onChange={(e) => updatePrintRoomTruck(truck.id, { notes: e.target.value })}
                            placeholder="Tray types, pallet specs, special instructions..."
                            rows={3}
                            className="border-gray-300 text-gray-900 bg-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingTruck(null)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={() => deletePrintRoomTruck(truck.id)} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className={`${routeColors[truck.route]} text-white rounded px-3 py-1 font-bold shadow-sm`}>
                              {truck.truckNumber || 'New'}
                            </div>
                            <div className="text-sm text-gray-700">Door {truck.door}</div>
                            <div className="text-sm text-gray-700">{truck.route}</div>
                            <div className="text-sm text-gray-700">Pods: {truck.pods}</div>
                            <div className="text-sm text-gray-700">Pallets: {truck.pallets}</div>
                          </div>
                          {truck.notes && (
                            <div className="text-sm text-gray-600 mt-2">{truck.notes}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingTruck(truck.id)} variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => deletePrintRoomTruck(truck.id)} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
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
        {/* Van/Semi Number Management */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Van & Semi Number Registry</CardTitle>
              <Button onClick={() => setNewVanSemiForm(!newVanSemiForm)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Van/Semi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {newVanSemiForm && (
              <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label className="text-gray-700">Truck Number</Label>
                    <Input
                      id="newVanSemiNumber"
                      placeholder="Enter truck number"
                      className="border-gray-300 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Type</Label>
                    <Select onValueChange={(value: 'Van' | 'Semi') => {
                      const input = document.getElementById('newVanSemiNumber') as HTMLInputElement
                      if (input && input.value) {
                        addVanSemiNumber(input.value, value)
                        input.value = ''
                        setNewVanSemiForm(false)
                      }
                    }}>
                      <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-300 z-50">
                        <SelectItem value="Van" className="text-gray-900 bg-white hover:bg-gray-100">Van</SelectItem>
                        <SelectItem value="Semi" className="text-gray-900 bg-white hover:bg-gray-100">Semi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vanSemiNumbers.map(vs => (
                <div key={vs.id} className={`${vs.type === 'Van' ? 'bg-blue-100 border-blue-300' : 'bg-purple-100 border-purple-300'} border-2 rounded-lg p-3 flex items-center justify-between`}>
                  <div>
                    <div className="font-bold text-gray-900">{vs.number}</div>
                    <div className="text-xs text-gray-600">{vs.type}</div>
                  </div>
                  <Button onClick={() => deleteVanSemiNumber(vs.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {vanSemiNumbers.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No van or semi numbers registered. Add some above.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Management */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Driver & Equipment Database</CardTitle>
              <Button onClick={() => setNewDriverForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {newDriverForm && (
              <div className="mb-4">
                <Button onClick={addDriver} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Create New Driver Profile
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {drivers.map(driver => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  {editingDriver === driver.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700">Full Name</Label>
                          <Input
                            value={driver.name}
                            onChange={(e) => updateDriver(driver.id, { name: e.target.value })}
                            placeholder="Driver name"
                            className="border-gray-300 text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700">Phone Number</Label>
                          <Input
                            value={driver.phone}
                            onChange={(e) => updateDriver(driver.id, { phone: e.target.value })}
                            placeholder="(555) 555-5555"
                            className="border-gray-300 text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-700">Tractor Number</Label>
                        <Input
                          value={driver.tractorNumber}
                          onChange={(e) => updateDriver(driver.id, { tractorNumber: e.target.value })}
                          placeholder="Tractor #"
                          className="border-gray-300 text-gray-900 bg-white"
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
                          className="border-gray-300 text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Notes</Label>
                        <Textarea
                          value={driver.notes}
                          onChange={(e) => updateDriver(driver.id, { notes: e.target.value })}
                          placeholder="Availability, time off, special circumstances..."
                          rows={2}
                          className="border-gray-300 text-gray-900 bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setEditingDriver(null)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => updateDriver(driver.id, { active: !driver.active })}
                          variant={driver.active ? "outline" : "default"}
                          size="sm"
                          className={driver.active ? "border-gray-300 text-gray-700 bg-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
                        >
                          {driver.active ? 'Set Inactive' : 'Set Active'}
                        </Button>
                        <Button onClick={() => deleteDriver(driver.id)} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className={`${driver.active ? 'bg-green-600' : 'bg-gray-500'} text-white rounded px-3 py-1 font-bold shadow-sm`}>
                            {driver.name || 'New Driver'}
                          </div>
                          <div className="text-sm text-gray-700">{driver.phone}</div>
                          <div className="text-sm text-gray-700">Tractor: {driver.tractorNumber}</div>
                          <div className="text-sm text-gray-700">
                            Trailers: {driver.trailerNumbers.length > 0 ? driver.trailerNumbers.join(', ') : 'None'}
                          </div>
                        </div>
                        {driver.notes && (
                          <div className="text-sm text-gray-600 mt-2">{driver.notes}</div>
                        )}
                      </div>
                      <Button onClick={() => setEditingDriver(driver.id)} variant="outline" size="sm" className="border-gray-300 text-gray-700 bg-white">
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
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-gray-900">Staging Doors (18-28) - Position Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stagingDoors.map(door => {
                const doorTrucks = preShiftTrucks
                  .filter(t => t.stagingDoor === door)
                  .sort((a, b) => a.stagingPosition - b.stagingPosition)
                
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="text-center font-bold mb-3 text-lg text-gray-900">Door {door}</div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(position => {
                        const truck = doorTrucks.find(t => t.stagingPosition === position)
                        return (
                          <div key={position} className="border border-gray-300 rounded p-2 bg-white">
                            <div className="text-xs text-gray-600 mb-1">Position {position} {position === 1 ? '(Front)' : position === 4 ? '(Back)' : ''}</div>
                            {truck ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={truck.truckNumber}
                                    onChange={(e) => updatePreShiftTruck(truck.id, { truckNumber: e.target.value })}
                                    placeholder="Truck #"
                                    className="flex-1 text-sm border-gray-300 text-gray-900 bg-white"
                                  />
                                  <Button 
                                    onClick={() => deletePreShiftTruck(truck.id)}
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                  <Input
                                    value={truck.trailer1 || ''}
                                    onChange={(e) => updatePreShiftTruck(truck.id, { trailer1: e.target.value })}
                                    placeholder="-1"
                                    className="text-xs border-gray-300 text-gray-900 bg-white p-1 h-7"
                                  />
                                  <Input
                                    value={truck.trailer2 || ''}
                                    onChange={(e) => updatePreShiftTruck(truck.id, { trailer2: e.target.value })}
                                    placeholder="-2"
                                    className="text-xs border-gray-300 text-gray-900 bg-white p-1 h-7"
                                  />
                                  <Input
                                    value={truck.trailer3 || ''}
                                    onChange={(e) => updatePreShiftTruck(truck.id, { trailer3: e.target.value })}
                                    placeholder="-3"
                                    className="text-xs border-gray-300 text-gray-900 bg-white p-1 h-7"
                                  />
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => addPreShiftTruck(door, position)}
                                variant="outline"
                                size="sm"
                                className="w-full border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* PreShift Status Board */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-gray-900">PreShift Status Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{preShiftTrucks.length}</div>
                <div className="text-sm font-medium text-blue-600">Staged Trucks</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">
                  {preShiftTrucks.filter(t => t.truckNumber).length}
                </div>
                <div className="text-sm font-medium text-green-600">Verified Trucks</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-700">{drivers.filter(d => d.active).length}</div>
                <div className="text-sm font-medium text-purple-600">Active Drivers</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-700">
                  {vanSemiNumbers.length}
                </div>
                <div className="text-sm font-medium text-orange-600">Van/Semi Numbers</div>
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
      <div className="space-y-4">
        {/* Door-by-Door View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingDoors.map(door => {
            const doorTrucks = getMovementTrucksByDoor(door)
            return (
              <Card key={door} className="bg-white border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
                  <CardTitle className="text-gray-900 text-xl font-bold">Door {door}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {doorTrucks.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 text-sm">No trucks assigned</div>
                  ) : (
                    <div className="space-y-3">
                      {doorTrucks.map(truck => (
                        <div key={truck.truckNumber} className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`${routeColors[truck.route]} text-white rounded px-3 py-1 font-bold text-base shadow-sm`}>
                              {truck.truckNumber}
                            </div>
                            <div className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {truck.truckType}
                            </div>
                          </div>
                          
                          {(truck.trailer1 || truck.trailer2 || truck.trailer3) && (
                            <div className="mb-2 flex gap-1 text-xs">
                              {truck.trailer1 && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{truck.trailer1}</span>}
                              {truck.trailer2 && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{truck.trailer2}</span>}
                              {truck.trailer3 && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{truck.trailer3}</span>}
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-gray-600 font-medium">Truck Status</Label>
                              <Select
                                value={truck.status}
                                onValueChange={(value: TruckStatus) => updateMovementTruck(truck.truckNumber, { status: value })}
                              >
                                <SelectTrigger className="h-9 text-sm border-gray-300 bg-white mt-1 text-gray-900">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-300 z-50">
                                  {truckStatuses.map(status => (
                                    <SelectItem key={status} value={status} className="text-sm text-gray-900 bg-white hover:bg-gray-100">{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-gray-600 font-medium">Door Status</Label>
                              <Select
                                value={truck.doorStatus}
                                onValueChange={(value: DoorStatus) => updateMovementTruck(truck.truckNumber, { doorStatus: value })}
                              >
                                <SelectTrigger className="h-9 text-sm border-gray-300 bg-white mt-1 text-gray-900">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-300 z-50">
                                  {doorStatuses.map(status => (
                                    <SelectItem key={status} value={status} className="text-sm text-gray-900 bg-white hover:bg-gray-100">{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-1">
                            <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded">
                              <div className="text-xs text-gray-600">Pods</div>
                              <div className="text-base font-bold text-blue-700">{truck.pods}</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 border border-green-200 rounded">
                              <div className="text-xs text-gray-600">Pallets</div>
                              <div className="text-base font-bold text-green-700">{truck.pallets}</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 border border-purple-200 rounded">
                              <div className="text-xs text-gray-600">Batch</div>
                              <div className="text-base font-bold text-purple-700">{truck.batch}</div>
                            </div>
                          </div>

                          {truck.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="text-xs text-gray-700">{truck.notes}</div>
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {new Date(truck.lastUpdated).toLocaleTimeString()}
                            </div>
                            <Button
                              onClick={() => updateMovementTruck(truck.truckNumber, { ignored: !truck.ignored })}
                              variant="ghost"
                              size="sm"
                              className={`text-xs h-7 px-2 ${truck.ignored ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {truck.ignored ? 'Unignore' : 'Ignore'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Badger Truck Mover</h1>
                <p className="text-sm text-gray-600">Real-time synchronized warehouse operations</p>
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
              <div className="text-sm text-gray-700">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('print')}
              className={`px-6 py-3 font-medium transition-colors ${
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
              className={`px-6 py-3 font-medium transition-colors ${
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
              className={`px-6 py-3 font-medium transition-colors ${
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
