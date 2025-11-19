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
  ignored: boolean
  trailerNumber?: string
  lastUpdated: number
}

interface Driver {
  id: string
  name: string
  phone: string
  tractorNumber: string
  trailer1: string
  trailer2: string
  trailer3: string
  notes: string
  active: boolean
}

interface VanSemiNumber {
  id: string
  number: string
  type: 'Van' | 'Semi'
}

interface AppData {
  printRoomTrucks: PrintRoomTruck[]
  preShiftTrucks: PreShiftTruck[]
  movementTrucks: Record<string, MovementTruck>
  doorStatuses: Record<string, DoorStatus>
  drivers: Driver[]
  vanSemiNumbers: VanSemiNumber[]
  lastSync: number
}

// Initial data
const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const receivingDoors = ['8', '9', '10', '11']
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
const doorStatusOptions: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
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

const STORAGE_KEY = 'badger-truck-mover-data'

export default function TruckManagementSystem() {
  const [activeTab, setActiveTab] = useState<'print' | 'preshift' | 'movement'>('print')
  const [printRoomTrucks, setPrintRoomTrucks] = useState<PrintRoomTruck[]>([])
  const [preShiftTrucks, setPreShiftTrucks] = useState<PreShiftTruck[]>([])
  const [movementTrucks, setMovementTrucks] = useState<Record<string, MovementTruck>>({})
  const [doorStatuses, setDoorStatuses] = useState<Record<string, DoorStatus>>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vanSemiNumbers, setVanSemiNumbers] = useState<VanSemiNumber[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [newVanSemiForm, setNewVanSemiForm] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected')
  const [lastSync, setLastSync] = useState<number>(Date.now())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: AppData = JSON.parse(stored)
          setPrintRoomTrucks(data.printRoomTrucks || [])
          setPreShiftTrucks(data.preShiftTrucks || [])
          setMovementTrucks(data.movementTrucks || {})
          setDoorStatuses(data.doorStatuses || {})
          setDrivers(data.drivers || [])
          setVanSemiNumbers(data.vanSemiNumbers || [])
          setLastSync(data.lastSync || Date.now())
        } else {
          // Initialize door statuses if no data
          const initialStatuses: Record<string, DoorStatus> = {}
          loadingDoors.forEach(door => {
            initialStatuses[door] = 'Loading'
          })
          setDoorStatuses(initialStatuses)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
      setIsLoaded(true)
    }

    loadData()
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return

    const saveData = () => {
      try {
        const data: AppData = {
          printRoomTrucks,
          preShiftTrucks,
          movementTrucks,
          doorStatuses,
          drivers,
          vanSemiNumbers,
          lastSync: Date.now()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setLastSync(Date.now())
      } catch (error) {
        console.error('Error saving data:', error)
      }
    }

    saveData()
  }, [printRoomTrucks, preShiftTrucks, movementTrucks, doorStatuses, drivers, vanSemiNumbers, isLoaded])

  // Poll for changes from other tabs/devices
  useEffect(() => {
    const checkForUpdates = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: AppData = JSON.parse(stored)
          if (data.lastSync > lastSync) {
            setSyncStatus('syncing')
            setPrintRoomTrucks(data.printRoomTrucks || [])
            setPreShiftTrucks(data.preShiftTrucks || [])
            setMovementTrucks(data.movementTrucks || {})
            setDoorStatuses(data.doorStatuses || {})
            setDrivers(data.drivers || [])
            setVanSemiNumbers(data.vanSemiNumbers || [])
            setLastSync(data.lastSync)
            setTimeout(() => setSyncStatus('connected'), 500)
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }

    const interval = setInterval(checkForUpdates, 2000)
    return () => clearInterval(interval)
  }, [lastSync])

  // Sync Print Room and PreShift to Movement
  useEffect(() => {
    if (!isLoaded) return

    const newMovementTrucks: Record<string, MovementTruck> = {}
    
    printRoomTrucks.forEach(printTruck => {
      const preShiftTruck = preShiftTrucks.find(pt => pt.truckNumber === printTruck.truckNumber)
      const existingMovement = movementTrucks[printTruck.truckNumber]
      
      // Extract trailer number from truck number (e.g., "151-1" -> "-1")
      const trailerMatch = printTruck.truckNumber.match(/-(\d+)$/)
      const trailerNumber = trailerMatch ? `-${trailerMatch[1]}` : undefined
      
      // Get base truck number without trailer (e.g., "151-1" -> "151")
      const baseTruckNumber = printTruck.truckNumber.replace(/-\d+$/, '')
      
      newMovementTrucks[printTruck.truckNumber] = {
        truckNumber: printTruck.truckNumber,
        door: printTruck.door,
        route: printTruck.route,
        pods: printTruck.pods,
        pallets: printTruck.pallets,
        notes: printTruck.notes,
        batch: printTruck.batch,
        truckType: determineTruckType(baseTruckNumber),
        status: existingMovement?.status || (preShiftTruck ? 'Ready' : 'Missing'),
        ignored: existingMovement?.ignored || false,
        trailerNumber: trailerNumber,
        lastUpdated: Date.now()
      }
    })
    
    setMovementTrucks(newMovementTrucks)
  }, [printRoomTrucks, preShiftTrucks, drivers, isLoaded])

  // Determine truck type based on number
  const determineTruckType = (truckNumber: string): TruckType => {
    // Remove any trailer suffix for type determination
    const baseTruckNumber = truckNumber.replace(/-\d+$/, '')
    const num = parseInt(baseTruckNumber)
    
    // Check if it's in van/semi list (these are exceptions)
    const vanSemi = vanSemiNumbers.find(vs => vs.number === baseTruckNumber)
    if (vanSemi) {
      return vanSemi.type
    }
    
    // Check if it's in the driver database (Semi with trailers)
    const driver = drivers.find(d => 
      d.tractorNumber === baseTruckNumber || 
      d.trailer1 === baseTruckNumber || 
      d.trailer2 === baseTruckNumber || 
      d.trailer3 === baseTruckNumber
    )
    if (driver) {
      return 'Semi'
    }
    
    // Default logic:
    // Doors 18-28 (staging) are mostly Box Trucks
    // Below 170 is Box Truck
    // 170 and above is Semi Trailer
    if (!isNaN(num) && num < 170) {
      return 'Box Truck'
    }
    
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

  const updateDoorStatus = (door: string, status: DoorStatus) => {
    setDoorStatuses(prev => ({
      ...prev,
      [door]: status
    }))
  }

  // Driver functions
  const addDriver = () => {
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      tractorNumber: '',
      trailer1: '',
      trailer2: '',
      trailer3: '',
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
                            <Label className="text-gray-700">Truck Number (e.g., 151-1)</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updatePrintRoomTruck(truck.id, { truckNumber: e.target.value })}
                              placeholder="Enter truck # (151-1)"
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
              <CardTitle className="text-gray-900">Van & Semi Number Registry (Exceptions)</CardTitle>
              <Button onClick={() => setNewVanSemiForm(!newVanSemiForm)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Van/Semi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Doors 18-28 are mostly Box Trucks. Use this registry only for exceptions (Vans or Semis in staging).
              </p>
            </div>
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
                No exceptions registered. Most staging trucks are Box Trucks by default.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Management */}
        <Card className="bg-white border-gray-200">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Driver & Equipment Database (Semis & Trailers)</CardTitle>
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
                          placeholder="Tractor # (e.g., 151)"
                          className="border-gray-300 text-gray-900 bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Trailer Assignments</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            value={driver.trailer1}
                            onChange={(e) => updateDriver(driver.id, { trailer1: e.target.value })}
                            placeholder="Trailer 1 (e.g., 123)"
                            className="border-gray-300 text-gray-900 bg-white"
                          />
                          <Input
                            value={driver.trailer2}
                            onChange={(e) => updateDriver(driver.id, { trailer2: e.target.value })}
                            placeholder="Trailer 2"
                            className="border-gray-300 text-gray-900 bg-white"
                          />
                          <Input
                            value={driver.trailer3}
                            onChange={(e) => updateDriver(driver.id, { trailer3: e.target.value })}
                            placeholder="Trailer 3"
                            className="border-gray-300 text-gray-900 bg-white"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Print Room uses format: 151-1 (Tractor 151 with Trailer 1)
                        </p>
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
                            Trailers: {[driver.trailer1, driver.trailer2, driver.trailer3].filter(Boolean).join(', ') || 'None'}
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
                <div className="text-sm font-medium text-orange-600">Exceptions</div>
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
            const currentDoorStatus = doorStatuses[door] || 'Loading'
            
            return (
              <Card key={door} className="bg-white border-gray-200">
                <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
                  <div className="space-y-2">
                    <CardTitle className="text-gray-900 text-xl font-bold">Door {door}</CardTitle>
                    <div>
                      <Select
                        value={currentDoorStatus}
                        onValueChange={(value: DoorStatus) => updateDoorStatus(door, value)}
                      >
                        <SelectTrigger className={`h-9 text-sm border-2 ${doorStatusColors[currentDoorStatus]} text-white font-bol
