"use client"

import React, { useState } from 'react'
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
import { Truck, Users, Activity, Plus, Trash, Edit, Save, Clock, Settings, Menu, Home } from 'lucide-react'

type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'

interface TruckDatabaseEntry {
  id: string
  truckNumber: string
  truckType: TruckType
  transmission: 'Automatic' | 'Manual'
  notes: string
  active: boolean
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

interface AdminSettings {
  dailyResetEnabled: boolean
  resetTime: string
  lastReset?: number
  lastPrintRoomReset?: number
  lastPreShiftReset?: number
  lastLiveViewReset?: number
}

const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']

export default function AdminPage() {
  const [truckDatabase, setTruckDatabase] = useState<TruckDatabaseEntry[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    dailyResetEnabled: false,
    resetTime: '00:00'
  })
  const [customResetTime, setCustomResetTime] = useState('')
  const [editingTruckDb, setEditingTruckDb] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newTruckDbForm, setNewTruckDbForm] = useState(false)
  const [newDriverForm, setNewDriverForm] = useState(false)

  // Add truck to database
  const addTruckToDatabase = () => {
    const newTruck: TruckDatabaseEntry = {
      id: Date.now().toString(),
      truckNumber: '',
      truckType: 'Van',
      transmission: 'Automatic',
      notes: '',
      active: true
    }
    setTruckDatabase([...truckDatabase, newTruck])
    setEditingTruckDb(newTruck.id)
    setNewTruckDbForm(false)
  }

  // Update truck in database
  const updateTruckInDatabase = (id: string, updates: Partial<TruckDatabaseEntry>) => {
    setTruckDatabase(truckDatabase.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ))
  }

  // Delete truck from database
  const deleteTruckFromDatabase = (id: string) => {
    setTruckDatabase(truckDatabase.filter(t => t.id !== id))
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

  // Format time for display
  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Convert to 24-hour format
  const convertTo24Hour = (hours12: number, minutes: number, period: 'AM' | 'PM') => {
    let hours24 = hours12
    if (period === 'PM' && hours12 !== 12) hours24 += 12
    if (period === 'AM' && hours12 === 12) hours24 = 0
    return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Parse custom time input
  const parseCustomTime = (input: string) => {
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    const match = input.trim().match(timeRegex)
    
    if (!match) return null
    
    let hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    const period = match[3]?.toUpperCase()
    
    if (minutes > 59) return null
    
    if (period) {
      if (hours > 12 || hours < 1) return null
      if (period === 'PM' && hours !== 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
    } else {
      if (hours > 23) return null
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // Set custom reset time
  const handleSetCustomTime = () => {
    const parsed = parseCustomTime(customResetTime)
    if (parsed) {
      setAdminSettings({ ...adminSettings, resetTime: parsed })
      setCustomResetTime('')
      alert(`Reset time set to ${formatTime12Hour(parsed)}`)
    } else {
      alert('Invalid time format. Use HH:MM AM/PM or HH:MM (24-hour)')
    }
  }

  const [hours, minutes] = adminSettings.resetTime.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Truck Management System</h1>
                <p className="text-sm text-gray-500">Admin Panel - System Configuration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <a
              href="/"
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              Print Room
            </a>
            <a
              href="/preshift"
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              PreShift Setup
            </a>
            <a
              href="/movement"
              className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Live Movement
            </a>
            <a
              href="/admin"
              className="px-6 py-3 font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Admin
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Daily Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Clock className="w-5 h-5" />
              Daily Reset Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div>
                <div className="font-semibold text-lg text-gray-900">Enable Daily Reset</div>
                <div className="text-sm text-gray-700 mt-1">
                  Automatically clear Print Room, PreShift, and Live View data at scheduled time
                </div>
                <div className="text-xs text-red-600 font-medium mt-2">
                  ⚠️ Semi Tractor & Trailer Database will NEVER be deleted
                </div>
              </div>
              <Button
                onClick={() => setAdminSettings({
                  ...adminSettings,
                  dailyResetEnabled: !adminSettings.dailyResetEnabled
                })}
                variant={adminSettings.dailyResetEnabled ? "default" : "outline"}
                size="lg"
                className="min-w-[120px] font-bold"
              >
                {adminSettings.dailyResetEnabled ? 'ENABLED' : 'DISABLED'}
              </Button>
            </div>

            {adminSettings.dailyResetEnabled && (
              <div className="space-y-4 p-4 border-2 border-blue-300 rounded-lg bg-white">
                <div>
                  <Label className="text-lg font-semibold text-gray-900">Reset Time</Label>
                  <p className="text-sm text-gray-700 mb-4">
                    Set the time when truck data will be automatically cleared
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-gray-900 font-medium">Hour</Label>
                      <Select
                        value={hours12.toString()}
                        onValueChange={(value) => {
                          const newTime = convertTo24Hour(parseInt(value), minutes, period)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <SelectItem key={h} value={h.toString()}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-gray-900 font-medium">Minute</Label>
                      <Select
                        value={minutes.toString()}
                        onValueChange={(value) => {
                          const newTime = convertTo24Hour(hours12, parseInt(value), period)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => i).map(m => (
                            <SelectItem key={m} value={m.toString()}>
                              {m.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-gray-900 font-medium">Period</Label>
                      <Select
                        value={period}
                        onValueChange={(value: 'AM' | 'PM') => {
                          const newTime = convertTo24Hour(hours12, minutes, value)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-gray-900 font-medium">Or Enter Custom Time</Label>
                    <p className="text-xs text-gray-600 mb-2">Format: HH:MM AM/PM or HH:MM (24-hour)</p>
                    <div className="flex gap-2">
                      <Input
                        value={customResetTime}
                        onChange={(e) => setCustomResetTime(e.target.value)}
                        placeholder="e.g., 11:30 PM or 23:30"
                        className="border-2"
                      />
                      <Button 
                        onClick={handleSetCustomTime}
                        variant="outline"
                        className="min-w-[100px] border-2 font-bold"
                      >
                        Set Time
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded border-2 border-green-300">
                    <div className="text-sm font-bold text-green-900">
                      Current Reset Time: {formatTime12Hour(adminSettings.resetTime)}
                    </div>
                    {adminSettings.lastReset && (
                      <div className="text-sm text-green-800 mt-1">
                        Last Automatic Reset: {new Date(adminSettings.lastReset).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Reset Buttons */}
            <div className="space-y-3 p-4 border-2 border-orange-300 rounded-lg bg-orange-50">
              <div className="font-semibold text-lg text-gray-900 mb-3">Manual Reset Options</div>
              
              <Button
                onClick={() => {
                  if (window.confirm('Reset Print Room data? This will clear all truck assignments and batch information.')) {
                    setAdminSettings({ ...adminSettings, lastPrintRoomReset: Date.now() })
                    alert('Print Room data has been reset!')
                  }
                }}
                variant="destructive"
                className="w-full font-bold"
                size="lg"
              >
                Reset Print Room
              </Button>
              {adminSettings.lastPrintRoomReset && (
                <p className="text-xs text-gray-600 text-center">
                  Last reset: {new Date(adminSettings.lastPrintRoomReset).toLocaleString()}
                </p>
              )}

              <Button
                onClick={() => {
                  if (window.confirm('Reset PreShift data? This will clear all staging door positions.')) {
                    setAdminSettings({ ...adminSettings, lastPreShiftReset: Date.now() })
                    alert('PreShift data has been reset!')
                  }
                }}
                variant="destructive"
                className="w-full font-bold"
                size="lg"
              >
                Reset PreShift Setup
              </Button>
              {adminSettings.lastPreShiftReset && (
                <p className="text-xs text-gray-600 text-center">
                  Last reset: {new Date(adminSettings.lastPreShiftReset).toLocaleString()}
                </p>
              )}

              <Button
                onClick={() => {
                  if (window.confirm('Reset Live View data? This will clear all truck statuses and movement tracking.')) {
                    setAdminSettings({ ...adminSettings, lastLiveViewReset: Date.now() })
                    alert('Live View data has been reset!')
                  }
                }}
                variant="destructive"
                className="w-full font-bold"
                size="lg"
              >
                Reset Live Movement
              </Button>
              {adminSettings.lastLiveViewReset && (
                <p className="text-xs text-gray-600 text-center">
                  Last reset: {new Date(adminSettings.lastLiveViewReset).toLocaleString()}
                </p>
              )}

              <div className="pt-3 border-t-2 border-orange-400">
                <Button
                  onClick={() => {
                    if (window.confirm('⚠️ RESET ALL DATA? This will clear Print Room, PreShift, and Live View.\n\nSemi Tractor & Trailer Database will NOT be affected.')) {
                      setAdminSettings({ 
                        ...adminSettings, 
                        lastReset: Date.now(),
                        lastPrintRoomReset: Date.now(),
                        lastPreShiftReset: Date.now(),
                        lastLiveViewReset: Date.now()
                      })
                      alert('All operational data has been reset!\n\nSemi Tractor & Trailer Database preserved.')
                    }
                  }}
                  variant="destructive"
                  className="w-full font-bold bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  ⚠️ RESET ALL (Except Semi Database)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Semi Tractor & Trailer Database */}
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Semi Tractor & Trailer Database
                </CardTitle>
                <p className="text-sm text-purple-700 font-medium mt-1">
                  🔒 Protected - Never deleted by reset operations
                </p>
              </div>
              <Button onClick={() => setNewDriverForm(true)} size="sm" className="font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {newDriverForm && (
              <div className="mb-4">
                <Button onClick={addDriver} className="w-full font-bold" size="lg">
                  Create New Driver Profile
                </Button>
              </div>
            )}
            
            {drivers.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">No drivers in database</p>
                <p className="text-sm text-gray-600 mt-1">Click "Add Driver" to create your first entry</p>
              </div>
            ) : (
              <div className="space-y-4">
                {drivers.map(driver => (
                  <div key={driver.id} className="border-2 rounded-lg p-4 bg-white">
                    {editingDriver === driver.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-900 font-medium">Full Name</Label>
                            <Input
                              value={driver.name}
                              onChange={(e) => updateDriver(driver.id, { name: e.target.value })}
                              placeholder="Driver name"
                              className="border-2"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-900 font-medium">Phone Number</Label>
                            <Input
                              value={driver.phone}
                              onChange={(e) => updateDriver(driver.id, { phone: e.target.value })}
                              placeholder="(555) 555-5555"
                              className="border-2"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-900 font-medium">Tractor Number</Label>
                          <Input
                            value={driver.tractorNumber}
                            onChange={(e) => updateDriver(driver.id, { tractorNumber: e.target.value })}
                            placeholder="Tractor #"
                            className="border-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-900 font-medium">Trailer Numbers (comma separated)</Label>
                          <Input
                            value={driver.trailerNumbers.join(', ')}
                            onChange={(e) => updateDriver(driver.id, { 
                              trailerNumbers: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            })}
                            placeholder="Trailer1, Trailer2, Trailer3..."
                            className="border-2"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-900 font-medium">Notes</Label>
                          <Textarea
                            value={driver.notes}
                            onChange={(e) => updateDriver(driver.id, { notes: e.target.value })}
                            placeholder="Availability, time off, special circumstances..."
                            rows={2}
                            className="border-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingDriver(null)} size="sm" className="font-bold">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            onClick={() => updateDriver(driver.id, { active: !driver.active })}
                            variant={driver.active ? "outline" : "default"}
                            size="sm"
                            className="font-bold border-2"
                          >
                            {driver.active ? 'Set Inactive' : 'Set Active'}
                          </Button>
                          <Button onClick={() => deleteDriver(driver.id)} variant="destructive" size="sm" className="font-bold">
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
                            <div className="text-sm text-gray-700 font-medium">{driver.phone}</div>
                            <div className="text-sm text-gray-700 font-medium">Tractor: {driver.tractorNumber}</div>
                            <div className="text-sm text-gray-700 font-medium">
                              Trailers: {driver.trailerNumbers.length > 0 ? driver.trailerNumbers.join(', ') : 'None'}
                            </div>
                          </div>
                          {driver.notes && (
                            <div className="text-sm text-gray-600 mt-2">{driver.notes}</div>
                          )}
                        </div>
                        <Button onClick={() => setEditingDriver(driver.id)} variant="outline" size="sm" className="font-bold border-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Truck Database Management */}
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Truck Database (Vans & Box Trucks)</CardTitle>
              <Button onClick={() => setNewTruckDbForm(true)} size="sm" className="font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Truck
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {newTruckDbForm && (
              <div className="mb-4">
                <Button onClick={addTruckToDatabase} className="w-full font-bold" size="lg">
                  Create New Truck Entry
                </Button>
              </div>
            )}
            
            {truckDatabase.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">No trucks in database</p>
                <p className="text-sm text-gray-600 mt-1">Click "Add Truck" to create your first entry</p>
              </div>
            ) : (
              <div className="space-y-4">
                {truckDatabase.map(truck => (
                  <div key={truck.id} className="border-2 rounded-lg p-4 bg-white">
                    {editingTruckDb === truck.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-900 font-medium">Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updateTruckInDatabase(truck.id, { truckNumber: e.target.value })}
                              placeholder="Truck #"
                              className="border-2"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-900 font-medium">Truck Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruckInDatabase(truck.id, { truckType: value })}
                            >
                              <SelectTrigger className="border-2">
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
                        <div>
                          <Label className="text-gray-900 font-medium">Transmission</Label>
                          <Select
                            value={truck.transmission}
                            onValueChange={(value: 'Automatic' | 'Manual') => updateTruckInDatabase(truck.id, { transmission: value })}
                          >
                            <SelectTrigger className="border-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Automatic">Automatic</SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-900 font-medium">Notes</Label>
                          <Textarea
                            value={truck.notes}
                            onChange={(e) => updateTruckInDatabase(truck.id, { notes: e.target.value })}
                            placeholder="Additional information..."
                            rows={2}
                            className="border-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingTruckDb(null)} size="sm" className="font-bold">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            onClick={() => updateTruckInDatabase(truck.id, { active: !truck.active })}
                            variant={truck.active ? "outline" : "default"}
                            size="sm"
                            className="font-bold border-2"
                          >
                            {truck.active ? 'Set Inactive' : 'Set Active'}
                          </Button>
                          <Button onClick={() => deleteTruckFromDatabase(truck.id)} variant="destructive" size="sm" className="font-bold">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className={`${truck.active ? 'bg-blue-500' : 'bg-gray-400'} text-white rounded px-3 py-1 font-bold`}>
                              {truck.truckNumber || 'New Truck'}
                            </div>
                            <div className="text-sm text-gray-700 font-medium">{truck.truckType}</div>
                            <div className="text-sm text-gray-700 font-medium">{truck.transmission}</div>
                          </div>
                          {truck.notes && (
                            <div className="text-sm text-gray-600 mt-2">{truck.notes}</div>
                          )}
                        </div>
                        <Button onClick={() => setEditingTruckDb(truck.id)} variant="outline" size="sm" className="font-bold border-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Statistics */}
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="text-gray-900">System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center border-2 border-blue-300">
                <div className="text-3xl font-bold text-blue-700">{truckDatabase.length}</div>
                <div className="text-sm font-bold text-blue-900">Total Trucks</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center border-2 border-green-300">
                <div className="text-3xl font-bold text-green-700">
                  {truckDatabase.filter(t => t.active).length}
                </div>
                <div className="text-sm font-bold text-green-900">Active Trucks</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center border-2 border-purple-300">
                <div className="text-3xl font-bold text-purple-700">{drivers.length}</div>
                <div className="text-sm font-bold text-purple-900">Total Drivers</div>
              </div>
              <div className="bg-orange-100 rounded-lg p-4 text-center border-2 border-orange-300">
                <div className="text-3xl font-bold text-orange-700">
                  {drivers.filter(d => d.active).length}
                </div>
                <div className="text-sm font-bold text-orange-900">Active Drivers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
