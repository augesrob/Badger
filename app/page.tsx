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
import { Truck, Users, Activity, Plus, Trash, Edit, Save, X } from 'lucide-react'

type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 'End' | 'Gap' | 'Transfer'

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

const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const doorStatusOptions: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
const truckStatuses: TruckStatus[] = ['On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back', 'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B', 'End', 'Gap', 'Transfer']

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-600',
  '2-Green Bay': 'bg-green-600',
  '3-Wausau': 'bg-purple-600',
  '4-Caledonia': 'bg-orange-600',
  '5-Chippewa Falls': 'bg-red-600'
}

const doorStatusColors: Record<DoorStatus, string> = {
  'Loading': 'bg-green-600',
  'EOT': 'bg-yellow-600',
  'EOT+1': 'bg-orange-600',
  'Change Truck/Trailer': 'bg-blue-600',
  'Waiting': 'bg-gray-600',
  'Done For Night': 'bg-red-600'
}

const statusColors: Record<TruckStatus, string> = {
  'On Route': 'bg-blue-500',
  'In Door': 'bg-green-500',
  'Put Away': 'bg-gray-500',
  'In Front': 'bg-yellow-500',
  'Ready': 'bg-cyan-500',
  'In Back': 'bg-indigo-500',
  'The Rock': 'bg-stone-500',
  'Yard': 'bg-lime-500',
  'Missing': 'bg-red-500',
  'Doors 8-11': 'bg-pink-500',
  'Doors 12A-15B': 'bg-teal-500',
  'End': 'bg-violet-500',
  'Gap': 'bg-amber-500',
  'Transfer': 'bg-fuchsia-500'
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
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing'>('connected')
  const [lastSync, setLastSync] = useState<number>(Date.now())
  const [isLoaded, setIsLoaded] = useState(false)

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

  useEffect(() => {
    if (!isLoaded) return
    const newMovementTrucks: Record<string, MovementTruck> = {}
    printRoomTrucks.forEach(printTruck => {
      const preShiftTruck = preShiftTrucks.find(pt => pt.truckNumber === printTruck.truckNumber)
      const existingMovement = movementTrucks[printTruck.truckNumber]
      const trailerMatch = printTruck.truckNumber.match(/-(\d+)$/)
      const trailerNumber = trailerMatch ? `-${trailerMatch[1]}` : undefined
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
  }, [printRoomTrucks, preShiftTrucks, drivers, vanSemiNumbers, isLoaded])

  const determineTruckType = (truckNumber: string): TruckType => {
    const baseTruckNumber = truckNumber.replace(/-\d+$/, '')
    const num = parseInt(baseTruckNumber)
    const vanSemi = vanSemiNumbers.find(vs => vs.number === baseTruckNumber)
    if (vanSemi) return vanSemi.type
    const driver = drivers.find(d => 
      d.tractorNumber === baseTruckNumber || 
      d.trailer1 === baseTruckNumber || 
      d.trailer2 === baseTruckNumber || 
      d.trailer3 === baseTruckNumber
    )
    if (driver) return 'Semi'
    if (!isNaN(num) && num < 170) return 'Box Truck'
    return 'Semi Trailer'
  }

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
    if (editingTruck === id) setEditingTruck(null)
  }

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

  const getPrintRoomTrucksByBatch = (batch: number) => {
    return printRoomTrucks.filter(t => t.batch === batch)
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Truck Management System</h1>
                <p className="text-sm text-gray-500">Real-time synchronized warehouse operations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                syncStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-medium capitalize">{syncStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
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
              Print Room
            </button>
            <button
              onClick={() => setActiveTab('preshift')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'preshift'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PreShift Setup
            </button>
            <button
              onClick={() => setActiveTab('movement')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'movement'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Movement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'print' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shift Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {routes.map(route => {
                    const stats = getRouteStats()
                    return (
                      <div key={route} className="text-center">
                        <div className={`${routeColors[route]} text-white rounded-lg p-3 mb-2`}>
                          <div className="text-2xl font-bold">{stats[route]}</div>
                        </div>
                        <div className="text-sm font-medium">{route}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {[1, 2, 3, 4].map(batch => (
              <Card key={batch}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Batch {batch}</CardTitle>
                    <Button onClick={() => addPrintRoomTruck(loadingDoors[0], batch)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Truck
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getPrintRoomTrucksByBatch(batch).map(truck => (
                      <div key={truck.id} className="border rounded-lg p-4">
                        {editingTruck === truck.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Truck Number</Label>
                                <Input
                                  value={truck.truckNumber}
                                  onChange={(e) => updatePrintRoomTruck(truck.id, { truckNumber: e.target.value })}
                                  placeholder="151-1"
                                />
                              </div>
                              <div>
                                <Label>Door</Label>
                                <Select value={truck.door} onValueChange={(value) => updatePrintRoomTruck(truck.id, { door: value })}>
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
                                <Select value={truck.route} onValueChange={(value: Route) => updatePrintRoomTruck(truck.id, { route: value })}>
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Pods</Label>
                                <Input
                                  type="number"
                                  value={truck.pods}
                                  onChange={(e) => updatePrintRoomTruck(truck.id, { pods: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <Label>Pallets</Label>
                                <Input
                                  type="number"
                                  value={truck.pallets}
                                  onChange={(e) => updatePrintRoomTruck(truck.id, { pallets: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea
                                value={truck.notes}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { notes: e.target.value })}
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => setEditingTruck(null)} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button onClick={() => deletePrintRoomTruck(truck.id)} variant="destructive" size="sm">
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`${routeColors[truck.route]} text-white rounded px-3 py-1 font-bold`}>
                                {truck.truckNumber || 'New'}
                              </div>
                              <div className="text-sm text-gray-600">Door {truck.door}</div>
                              <div className="text-sm text-gray-600">{truck.route}</div>
                              <div className="text-sm text-gray-600">Pods: {truck.pods}</div>
                              <div className="text-sm text-gray-600">Pallets: {truck.pallets}</div>
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
        )}

        {activeTab === 'preshift' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Van & Semi Registry</CardTitle>
                  <Button onClick={() => setNewVanSemiForm(!newVanSemiForm)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exception
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {newVanSemiForm && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label>Truck Number</Label>
                        <Input id="newVanSemiNumber" placeholder="Enter number" />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select onValueChange={(value: 'Van' | 'Semi') => {
                          const input = document.getElementById('newVanSemiNumber') as HTMLInputElement
                          if (input && input.value) {
                            addVanSemiNumber(input.value, value)
                            input.value = ''
                            setNewVanSemiForm(false)
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Semi">Semi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-3">
                  {vanSemiNumbers.map(vs => (
                    <div key={vs.id} className="border rounded-lg p-3 flex items-center justify-between bg-white">
                      <div>
                        <div className="font-bold text-gray-900">{vs.number}</div>
                        <div className={`text-xs font-medium ${vs.type === 'Van' ? 'text-blue-600' : 'text-purple-600'}`}>{vs.type}</div>
                      </div>
                      <Button onClick={() => deleteVanSemiNumber(vs.id)} variant="ghost" size="sm">
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                    <Button onClick={addDriver} className="w-full bg-blue-600 hover:bg-blue-700">
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
                              <Label>Name</Label>
                              <Input
                                value={driver.name}
                                onChange={(e) => updateDriver(driver.id, { name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <Input
                                value={driver.phone}
                                onChange={(e) => updateDriver(driver.id, { phone: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Tractor Number</Label>
                            <Input
                              value={driver.tractorNumber}
                              onChange={(e) => updateDriver(driver.id, { tractorNumber: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label>Trailer 1</Label>
                              <Input
                                value={driver.trailer1}
                                onChange={(e) => updateDriver(driver.id, { trailer1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Trailer 2</Label>
                              <Input
                                value={driver.trailer2}
                                onChange={(e) => updateDriver(driver.id, { trailer2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Trailer 3</Label>
                              <Input
                                value={driver.trailer3}
                                onChange={(e) => updateDriver(driver.id, { trailer3: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => setEditingDriver(null)} size="sm">
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={() => deleteDriver(driver.id)} variant="destructive" size="sm">
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{driver.name || 'New Driver'}</div>
                            <div className="text-sm text-gray-600">
                              Tractor: {driver.tractorNumber} | Trailers: {[driver.trailer1, driver.trailer2, driver.trailer3].filter(Boolean).join(', ')}
                            </div>
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

            <Card>
              <CardHeader>
                <CardTitle>Staging Doors (18-28)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {stagingDoors.map(door => {
                    const doorTrucks = preShiftTrucks.filter(t => t.stagingDoor === door).sort((a, b) => a.stagingPosition - b.stagingPosition)
                    return (
                      <div key={door} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                        <div className="text-center font-bold text-lg mb-3 text-gray-900">Door {door}</div>
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map(position => {
                            const truck = doorTrucks.find(t => t.stagingPosition === position)
                            return (
                              <div key={position} className="border border-gray-200 rounded p-2 bg-gray-50">
                                <div className="text-xs text-gray-600 mb-1 font-medium">Position {position}</div>
                                {truck ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={truck.truckNumber}
                                      onChange={(e) => updatePreShiftTruck(truck.id, { truckNumber: e.target.value })}
                                      placeholder="Truck #"
                                      className="text-sm"
                                    />
                                    <Button onClick={() => deletePreShiftTruck(truck.id)} variant="ghost" size="sm">
                                      <X className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button onClick={() => addPreShiftTruck(door, position)} variant="outline" size="sm" className="w-full">
                                    <Plus className="w-4 h-4" />
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
          </div>
        )}

        {activeTab === 'movement' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {loadingDoors.map(door => {
                const doorTrucks = Object.values(movementTrucks).filter(t => t.door === door && !t.ignored)
                const currentDoorStatus = doorStatuses[door] || 'Loading'
                return (
                  <Card key={door} className="border-2">
                    <CardHeader className="py-3 bg-gray-50">
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-bold">Door {door}</CardTitle>
                        <Select value={currentDoorStatus} onValueChange={(value: DoorStatus) => updateDoorStatus(door, value)}>
                          <SelectTrigger className={`h-10 ${doorStatusColors[currentDoorStatus]} text-white font-bold border-0`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {doorStatusOptions.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {doorTrucks.map(truck => (
                          <div key={truck.truckNumber} className="border-2 rounded-lg p-3 bg-white">
                            <div className={`${routeColors[truck.route]} text-white rounded px-3 py-2 text-sm font-bold mb-2`}>
                              {truck.truckNumber}
                              {truck.trailerNumber && <span className="ml-1">({truck.trailerNumber})</span>}
                            </div>
                            <div className="text-xs space-y-1 mb-2 text-gray-700">
                              <div className="font-medium">Type: {truck.truckType}</div>
                              <div>Route: {truck.route}</div>
                              <div>Pods: {truck.pods} | Pallets: {truck.pallets}</div>
                            </div>
                            <Select value={truck.status} onValueChange={(value: TruckStatus) => updateMovementTruck(truck.truckNumber, { status: value })}>
                              <SelectTrigger className={`h-9 text-xs font-medium ${statusColors[truck.status]} text-white border-0`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {truckStatuses.map(status => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
