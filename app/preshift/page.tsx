"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Trash, Edit, Save, X } from 'lucide-react'
import Header from '../components/Header'
import Navigation from '../components/Navigation'
import { PreShiftTruck, Driver, VanSemiNumber, PrintRoomTruck, stagingDoors, truckTypes } from '@/lib/types'
import type { TruckType } from '@/lib/types'

export default function PreShiftPage() {
  const [preShiftTrucks, setPreShiftTrucks] = useState<PreShiftTruck[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vanSemiNumbers, setVanSemiNumbers] = useState<VanSemiNumber[]>([])
  const [printRoomTrucks, setPrintRoomTrucks] = useState<PrintRoomTruck[]>([])
  const [editingPreShiftTruck, setEditingPreShiftTruck] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [newVanSemiForm, setNewVanSemiForm] = useState(false)
  const [newVanSemiNumber, setNewVanSemiNumber] = useState('')
  const [newVanSemiType, setNewVanSemiType] = useState<'Van' | 'Semi'>('Van')
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('syncing')
  const [isLoaded, setIsLoaded] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  const loadFromServer = async () => {
    try {
      setSyncStatus('syncing')
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to load data')
      
      const data = await response.json()
      setPreShiftTrucks(data.preShiftTrucks || [])
      setDrivers(data.drivers || [])
      setVanSemiNumbers(data.vanSemiNumbers || [])
      setPrintRoomTrucks(data.printRoomTrucks || [])
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
          preShiftTrucks,
          drivers,
          vanSemiNumbers
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
  }, [preShiftTrucks, drivers, vanSemiNumbers, isLoaded])

  useEffect(() => {
    const interval = setInterval(() => {
      loadFromServer()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const addPreShiftTruck = (door: string, position: number) => {
    const newTruck: PreShiftTruck = {
      id: Date.now().toString(),
      truckNumber: '',
      stagingDoor: door,
      stagingPosition: position,
      truckType: 'Van',
      lastUpdated: Date.now()
    }
    setPreShiftTrucks([...preShiftTrucks, newTruck])
    setEditingPreShiftTruck(newTruck.id)
  }

  const updatePreShiftTruck = (id: string, updates: Partial<PreShiftTruck>) => {
    setPreShiftTrucks(preShiftTrucks.map(t => 
      t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t
    ))
  }

  const deletePreShiftTruck = (id: string) => {
    setPreShiftTrucks(preShiftTrucks.filter(t => t.id !== id))
    if (editingPreShiftTruck === id) setEditingPreShiftTruck(null)
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
    if (editingDriver === id) setEditingDriver(null)
  }

  const addVanSemiNumber = () => {
    if (!newVanSemiNumber.trim()) return
    const newVanSemi: VanSemiNumber = {
      id: Date.now().toString(),
      number: newVanSemiNumber.trim(),
      type: newVanSemiType
    }
    setVanSemiNumbers([...vanSemiNumbers, newVanSemi])
    setNewVanSemiNumber('')
    setNewVanSemiForm(false)
  }

  const deleteVanSemiNumber = (id: string) => {
    setVanSemiNumbers(vanSemiNumbers.filter(vs => vs.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827' }}>
      <Header syncStatus={syncStatus} />
      <Navigation />
      
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Driver Management */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Driver & Equipment Database</h2>
              <button
                onClick={() => setNewDriverForm(true)}
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
                Add Driver
              </button>
            </div>
            {newDriverForm && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                <button
                  onClick={addDriver}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Create New Driver Profile
                </button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {drivers.map(driver => (
                <div key={driver.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                  {editingDriver === driver.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Full Name</label>
                          <input
                            type="text"
                            value={driver.name}
                            onChange={(e) => updateDriver(driver.id, { name: e.target.value })}
                            placeholder="John Doe"
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
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Phone</label>
                          <input
                            type="text"
                            value={driver.phone}
                            onChange={(e) => updateDriver(driver.id, { phone: e.target.value })}
                            placeholder="(555) 555-5555"
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
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Tractor #</label>
                          <input
                            type="text"
                            value={driver.tractorNumber}
                            onChange={(e) => updateDriver(driver.id, { tractorNumber: e.target.value })}
                            placeholder="T-123"
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Trailer 1</label>
                          <input
                            type="text"
                            value={driver.trailer1}
                            onChange={(e) => updateDriver(driver.id, { trailer1: e.target.value })}
                            placeholder="TR-001"
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
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Trailer 2</label>
                          <input
                            type="text"
                            value={driver.trailer2}
                            onChange={(e) => updateDriver(driver.id, { trailer2: e.target.value })}
                            placeholder="TR-002"
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
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Trailer 3</label>
                          <input
                            type="text"
                            value={driver.trailer3}
                            onChange={(e) => updateDriver(driver.id, { trailer3: e.target.value })}
                            placeholder="TR-003"
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
                          value={driver.notes}
                          onChange={(e) => updateDriver(driver.id, { notes: e.target.value })}
                          rows={2}
                          placeholder="Availability, time off, special circumstances..."
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
                          onClick={() => setEditingDriver(null)}
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
                          onClick={() => updateDriver(driver.id, { active: !driver.active })}
                          style={{
                            backgroundColor: driver.active ? '#6b7280' : '#16a34a',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          {driver.active ? 'Set Inactive' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => deleteDriver(driver.id)}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{
                          backgroundColor: driver.active ? '#16a34a' : '#6b7280',
                          color: 'white',
                          borderRadius: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {driver.name || 'New Driver'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{driver.phone}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tractor: {driver.tractorNumber}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Trailers: {[driver.trailer1, driver.trailer2, driver.trailer3].filter(Boolean).join(', ') || 'None'}
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingDriver(driver.id)}
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

          {/* Van/Semi Classification */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Van/Semi Number Classification</h2>
              <button
                onClick={() => setNewVanSemiForm(true)}
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
                Add Number
              </button>
            </div>
            {newVanSemiForm && (
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Truck Number</label>
                    <input
                      type="text"
                      value={newVanSemiNumber}
                      onChange={(e) => setNewVanSemiNumber(e.target.value)}
                      placeholder="151"
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }}>Type</label>
                    <select
                      value={newVanSemiType}
                      onChange={(e) => setNewVanSemiType(e.target.value as 'Van' | 'Semi')}
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
                      <option value="Van">Van</option>
                      <option value="Semi">Semi</option>
                    </select>
                  </div>
                  <button
                    onClick={addVanSemiNumber}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {vanSemiNumbers.map(vs => (
                <div key={vs.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  backgroundColor: vs.type === 'Van' ? '#dbeafe' : '#fef3c7',
                  borderRadius: '0.375rem'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{vs.number} ({vs.type})</span>
                  <button
                    onClick={() => deleteVanSemiNumber(vs.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '0.25rem'
                    }}
                  >
                    <X style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Staging Doors */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Staging Doors (18-28)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {stagingDoors.map(door => {
                const doorTrucks = preShiftTrucks
                  .filter(t => t.stagingDoor === door)
                  .sort((a, b) => a.stagingPosition - b.stagingPosition)
                
                return (
                  <div key={door} style={{ border: '2px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1.125rem', color: '#111827' }}>
                      Door {door}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[1, 2, 3, 4].map(position => {
                        const truck = doorTrucks.find(t => t.stagingPosition === position)
                        return (
                          <div key={position} style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                              Position {position} {position === 1 ? '(Front)' : position === 4 ? '(Back)' : ''}
                            </div>
                            {truck ? (
                              editingPreShiftTruck === truck.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <input
                                    type="text"
                                    value={truck.truckNumber}
                                    onChange={(e) => updatePreShiftTruck(truck.id, { truckNumber: e.target.value })}
                                    placeholder="Truck #"
                                    style={{
                                      width: '100%',
                                      padding: '0.375rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.75rem',
                                      color: '#111827',
                                      backgroundColor: 'white'
                                    }}
                                  />
                                  <select
                                    value={truck.truckType}
                                    onChange={(e) => updatePreShiftTruck(truck.id, { truckType: e.target.value as TruckType })}
                                    style={{
                                      width: '100%',
                                      padding: '0.375rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '0.25rem',
                                      fontSize: '0.75rem',
                                      color: '#111827',
                                      backgroundColor: 'white'
                                    }}
                                  >
                                    {truckTypes.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button
                                      onClick={() => setEditingPreShiftTruck(null)}
                                      style={{
                                        flex: 1,
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        padding: '0.25rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => deletePreShiftTruck(truck.id)}
                                      style={{
                                        backgroundColor: '#dc2626',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      <Trash style={{ width: '0.75rem', height: '0.75rem' }} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#111827' }}>
                                      {truck.truckNumber}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                      {truck.truckType}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setEditingPreShiftTruck(truck.id)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: '1px solid #d1d5db',
                                      padding: '0.25rem',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer',
                                      color: '#6b7280'
                                    }}
                                  >
                                    <Edit style={{ width: '0.75rem', height: '0.75rem' }} />
                                  </button>
                                </div>
                              )
                            ) : (
                              <button
                                onClick={() => addPreShiftTruck(door, position)}
                                style={{
                                  width: '100%',
                                  backgroundColor: '#f3f4f6',
                                  color: '#6b7280',
                                  padding: '0.5rem',
                                  borderRadius: '0.25rem',
                                  border: '1px dashed #d1d5db',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem'
                                }}
                              >
                                + Add Truck
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>PreShift Status Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#dbeafe', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>{printRoomTrucks.length}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af' }}>Total Trucks</div>
              </div>
              <div style={{ backgroundColor: '#dcfce7', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d' }}>{preShiftTrucks.length}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#15803d' }}>Staged Trucks</div>
              </div>
              <div style={{ backgroundColor: '#fae8ff', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7e22ce' }}>{drivers.filter(d => d.active).length}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#7e22ce' }}>Active Drivers</div>
              </div>
              <div style={{ backgroundColor: '#fed7aa', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#c2410c' }}>
                  {drivers.reduce((sum, d) => sum + [d.trailer1, d.trailer2, d.trailer3].filter(Boolean).length, 0)}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#c2410c' }}>Total Trailers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
