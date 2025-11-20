"use client"

import React, { useState, useEffect } from 'react'
import { Truck, Plus, Trash, Edit, Save } from 'lucide-react'

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

const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const doorStatusOptions: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
const truckStatuses: TruckStatus[] = ['On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back', 'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B', 'End', 'Gap', 'Transfer']

const getRouteColor = (route: Route): string => {
  const colors = {
    '1-Fond Du Lac': '#2563eb',
    '2-Green Bay': '#16a34a',
    '3-Wausau': '#9333ea',
    '4-Caledonia': '#ea580c',
    '5-Chippewa Falls': '#dc2626'
  }
  return colors[route]
}

const getDoorStatusColor = (status: DoorStatus): string => {
  const colors = {
    'Loading': '#16a34a',
    'EOT': '#ca8a04',
    'EOT+1': '#ea580c',
    'Change Truck/Trailer': '#2563eb',
    'Waiting': '#6b7280',
    'Done For Night': '#dc2626'
  }
  return colors[status]
}

const getTruckStatusColor = (status: TruckStatus): string => {
  const colors = {
    'On Route': '#3b82f6',
    'In Door': '#22c55e',
    'Put Away': '#6b7280',
    'In Front': '#eab308',
    'Ready': '#06b6d4',
    'In Back': '#6366f1',
    'The Rock': '#78716c',
    'Yard': '#84cc16',
    'Missing': '#ef4444',
    'Doors 8-11': '#ec4899',
    'Doors 12A-15B': '#14b8a6',
    'End': '#8b5cf6',
    'Gap': '#f59e0b',
    'Transfer': '#d946ef'
  }
  return colors[status]
}

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
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')
  const [lastSync, setLastSync] = useState<number>(Date.now())
  const [isLoaded, setIsLoaded] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  const loadFromServer = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to load data')
      
      const data = await response.json()
      setPrintRoomTrucks(data.printRoomTrucks || [])
      setPreShiftTrucks(data.preShiftTrucks || [])
      setMovementTrucks(data.movementTrucks || {})
      setDoorStatuses(data.doorStatuses || {})
      setDrivers(data.drivers || [])
      setVanSemiNumbers(data.vanSemiNumbers || [])
      setLastSync(data.lastSync || Date.now())
      setSyncStatus('connected')
      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
      setSyncStatus('error')
      
      if (!isLoaded) {
        const initialStatuses: Record<string, DoorStatus> = {}
        loadingDoors.forEach(door => {
          initialStatuses[door] = 'Loading'
        })
        setDoorStatuses(initialStatuses)
        setIsLoaded(true)
      }
    }
  }

  const saveToServer = async () => {
    if (pendingSave) return
    
    try {
      setPendingSave(true)
      setSyncStatus('syncing')
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printRoomTrucks,
          preShiftTrucks,
          movementTrucks,
          doorStatuses,
          drivers,
          vanSemiNumbers
        })
      })
      
      if (!response.ok) throw new Error('Failed to save data')
      
      const result = await response.json()
      setLastSync(result.lastSync)
      setSyncStatus('connected')
    } catch (error) {
      console.error('Error saving data:', error)
      setSyncStatus('error')
    } finally {
      setPendingSave(false)
    }
  }

  useEffect(() => {
    loadFromServer()
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    
    const timeoutId = setTimeout(() => {
      saveToServer()
    }, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [printRoomTrucks, preShiftTrucks, movementTrucks, doorStatuses, drivers, vanSemiNumbers, isLoaded])

  useEffect(() => {
    const interval = setInterval(() => {
      loadFromServer()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827' }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Truck style={{ width: '2rem', height: '2rem', color: '#2563eb' }} />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Truck Management System</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Real-time sync with Vercel Blob (500MB free)</p>
              </div>
            </div>
            <div style={{
              backgroundColor: syncStatus === 'connected' ? '#dcfce7' : syncStatus === 'syncing' ? '#fef3c7' : '#fee2e2',
              color: syncStatus === 'connected' ? '#15803d' : syncStatus === 'syncing' ? '#a16207' : '#991b1b',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: syncStatus === 'connected' ? '#22c55e' : syncStatus === 'syncing' ? '#eab308' : '#ef4444'
              }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{syncStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['print', 'preshift', 'movement'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  color: activeTab === tab ? '#2563eb' : '#6b7280',
                  borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  fontSize: '1rem'
                }}
              >
                {tab === 'print' ? 'Print Room' : tab === 'preshift' ? 'PreShift Setup' : 'Live Movement'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        {activeTab === 'print' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Shift Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {routes.map(route => {
                  const stats = getRouteStats()
                  return (
                    <div key={route} style={{ textAlign: 'center' }}>
                      <div style={{
                        backgroundColor: getRouteColor(route),
                        color: 'white',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats[route]}</div>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{route}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {[1, 2, 3, 4].map(batch => (
              <div key={batch} style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Batch {batch}</h2>
                  <button
                    onClick={() => addPrintRoomTruck(loadingDoors[0], batch)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <Plus style={{ width: '1rem', height: '1rem' }} />
                    Add Truck
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {getPrintRoomTrucksByBatch(batch).map(truck => (
                    <div key={truck.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                      {editingTruck === truck.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Truck Number</label>
                              <input
                                type="text"
                                value={truck.truckNumber}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { truckNumber: e.target.value })}
                                placeholder="151-1"
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  backgroundColor: 'white'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Door</label>
                              <select
                                value={truck.door}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { door: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  backgroundColor: 'white'
                                }}
                              >
                                {loadingDoors.map(door => (
                                  <option key={door} value={door}>{door}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Route</label>
                              <select
                                value={truck.route}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { route: e.target.value as Route })}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  backgroundColor: 'white'
                                }}
                              >
                                {routes.map(route => (
                                  <option key={route} value={route}>{route}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Pods</label>
                              <input
                                type="number"
                                value={truck.pods}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { pods: parseInt(e.target.value) || 0 })}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  backgroundColor: 'white'
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Pallets</label>
                              <input
                                type="number"
                                value={truck.pallets}
                                onChange={(e) => updatePrintRoomTruck(truck.id, { pallets: parseInt(e.target.value) || 0 })}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.875rem',
                                  color: '#111827',
                                  backgroundColor: 'white'
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Notes</label>
                            <textarea
                              value={truck.notes}
                              onChange={(e) => updatePrintRoomTruck(truck.id, { notes: e.target.value })}
                              rows={2}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                resize: 'vertical',
                                color: '#111827',
                                backgroundColor: 'white'
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setEditingTruck(null)}
                              style={{
                                backgroundColor: '#2563eb',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                              }}
                            >
                              <Save style={{ width: '1rem', height: '1rem' }} />
                              Save
                            </button>
                            <button
                              onClick={() => deletePrintRoomTruck(truck.id)}
                              style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem'
                              }}
                            >
                              <Trash style={{ width: '1rem', height: '1rem' }} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                              backgroundColor: getRouteColor(truck.route),
                              color: 'white',
                              borderRadius: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              fontWeight: 'bold'
                            }}>
                              {truck.truckNumber || 'New'}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Door {truck.door}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{truck.route}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pods: {truck.pods}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pallets: {truck.pallets}</div>
                          </div>
                          <button
                            onClick={() => setEditingTruck(truck.id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #d1d5db',
                              padding: '0.5rem',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              color: '#6b7280'
                            }}
                          >
                            <Edit style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'preshift' && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fbbf24' }}>
            <p style={{ margin: 0, color: '#92400e', fontWeight: '500' }}>
              PreShift and Movement tabs coming soon. Print Room is fully functional with real-time multi-device sync via Vercel Blob.
            </p>
          </div>
        )}

        {activeTab === 'movement' && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fbbf24' }}>
            <p style={{ margin: 0, color: '#92400e', fontWeight: '500' }}>
              PreShift and Movement tabs coming soon. Print Room is fully functional with real-time multi-device sync via Vercel Blob.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
