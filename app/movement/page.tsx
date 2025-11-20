"use client"

import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Navigation from '../components/Navigation'
import { 
  PrintRoomTruck, 
  PreShiftTruck, 
  MovementTruck, 
  Driver, 
  VanSemiNumber,
  routes, 
  truckStatuses, 
  doorStatusOptions,
  getRouteColor, 
  getTruckStatusColor 
} from '../lib/types'
import type { Route, TruckStatus, DoorStatus, TruckType } from '../lib/types'
import { ... } from '@/lib/types'

export default function MovementPage() {
  const [printRoomTrucks, setPrintRoomTrucks] = useState<PrintRoomTruck[]>([])
  const [preShiftTrucks, setPreShiftTrucks] = useState<PreShiftTruck[]>([])
  const [movementTrucks, setMovementTrucks] = useState<Record<string, MovementTruck>>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vanSemiNumbers, setVanSemiNumbers] = useState<VanSemiNumber[]>([])
  const [filterRoute, setFilterRoute] = useState<Route | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TruckStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')
  const [isLoaded, setIsLoaded] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

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

  const loadFromServer = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to load data')
      
      const data = await response.json()
      setPrintRoomTrucks(data.printRoomTrucks || [])
      setPreShiftTrucks(data.preShiftTrucks || [])
      setMovementTrucks(data.movementTrucks || {})
      setDrivers(data.drivers || [])
      setVanSemiNumbers(data.vanSemiNumbers || [])
      setSyncStatus('connected')
      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
      setSyncStatus('error')
      if (!isLoaded) setIsLoaded(true)
    }
  }

  const saveToServer = async () => {
    if (pendingSave) return
    
    try {
      setPendingSave(true)
      setSyncStatus('syncing')
      
      const currentData = await fetch('/api/data').then(r => r.json())
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentData,
          movementTrucks
        })
      })
      
      if (!response.ok) throw new Error('Failed to save data')
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
  }, [movementTrucks, isLoaded])

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
        truckType: preShiftTruck?.truckType || determineTruckType(baseTruckNumber),
        status: existingMovement?.status || (preShiftTruck ? 'Ready' : 'Missing'),
        doorStatus: existingMovement?.doorStatus || 'Loading',
        ignored: existingMovement?.ignored || false,
        trailerNumber: trailerNumber,
        lastUpdated: Date.now()
      }
    })
    
    setMovementTrucks(newMovementTrucks)
  }, [printRoomTrucks, preShiftTrucks, drivers, vanSemiNumbers, isLoaded])

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

  const getFilteredMovementTrucks = () => {
    return Object.values(movementTrucks).filter(truck => {
      if (filterRoute !== 'all' && truck.route !== filterRoute) return false
      if (filterStatus !== 'all' && truck.status !== filterStatus) return false
      if (searchTerm && !truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
  }

  const filteredTrucks = getFilteredMovementTrucks()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827' }}>
      <Header syncStatus={syncStatus} />
      <Navigation />
      
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filters */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Filters & Search</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Search Truck</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search truck number..."
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
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Filter by Route</label>
                <select
                  value={filterRoute}
                  onChange={(e) => setFilterRoute(e.target.value as Route | 'all')}
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
                  <option value="all">All Routes</option>
                  {routes.map(route => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TruckStatus | 'all')}
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
                  <option value="all">All Statuses</option>
                  {truckStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Movement Dashboard */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
              Live Truck Movement Dashboard ({filteredTrucks.length} trucks)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTrucks.map(truck => (
                <div key={truck.truckNumber} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{
                        backgroundColor: getRouteColor(truck.route),
                        color: 'white',
                        borderRadius: '0.25rem',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        fontSize: '1.125rem'
                      }}>
                        {truck.truckNumber}
                      </div>
                      <div style={{
                        backgroundColor: getTruckStatusColor(truck.status),
                        color: 'white',
                        borderRadius: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {truck.status}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Door {truck.door}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{truck.truckType}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Batch {truck.batch}</div>
                    </div>
                    <button
                      onClick={() => updateMovementTruck(truck.truckNumber, { ignored: !truck.ignored })}
                      style={{
                        backgroundColor: truck.ignored ? '#2563eb' : 'transparent',
                        color: truck.ignored ? 'white' : '#6b7280',
                        border: '1px solid #d1d5db',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {truck.ignored ? 'Unignore' : 'Ignore'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Truck Status</label>
                      <select
                        value={truck.status}
                        onChange={(e) => updateMovementTruck(truck.truckNumber, { status: e.target.value as TruckStatus })}
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
                        {truckStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Door Status</label>
                      <select
                        value={truck.doorStatus}
                        onChange={(e) => updateMovementTruck(truck.truckNumber, { doorStatus: e.target.value as DoorStatus })}
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
                        {doorStatusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#dbeafe', borderRadius: '0.375rem', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>Pods</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{truck.pods}</div>
                    </div>
                    <div style={{ backgroundColor: '#dcfce7', borderRadius: '0.375rem', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#15803d', marginBottom: '0.25rem' }}>Pallets</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>{truck.pallets}</div>
                    </div>
                    <div style={{ backgroundColor: '#fae8ff', borderRadius: '0.375rem', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#7e22ce', marginBottom: '0.25rem' }}>Route</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7e22ce' }}>{truck.route.split('-')[0]}</div>
                    </div>
                  </div>

                  {truck.notes && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Notes:</div>
                      <div style={{ fontSize: '0.875rem', color: '#111827' }}>{truck.notes}</div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Last updated: {new Date(truck.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Status Updates */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Quick Status Updates</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Click a status to update all visible trucks (filtered results)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {truckStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    if (window.confirm(`Update ${filteredTrucks.length} visible trucks to "${status}"?`)) {
                      filteredTrucks.forEach(truck => {
                        if (!truck.ignored) {
                          updateMovementTruck(truck.truckNumber, { status })
                        }
                      })
                    }
                  }}
                  style={{
                    backgroundColor: getTruckStatusColor(status),
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Status Summary */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Status Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {truckStatuses.map(status => {
                const count = Object.values(movementTrucks).filter(t => t.status === status && !t.ignored).length
                return (
                  <div 
                    key={status}
                    style={{
                      backgroundColor: getTruckStatusColor(status),
                      color: 'white',
                      borderRadius: '0.375rem',
                      padding: '0.75rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{count}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{status}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
