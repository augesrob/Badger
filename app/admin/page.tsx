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
import { Truck, Users, Activity, Plus, Trash, Edit, Save, Clock, Settings, Menu } from 'lucide-react'

type TruckType = 'Van' | 'Box Truck' | 'Tandem' | 'Semi Trailer' | 'Semi'

interface TruckDatabaseEntry {
  id: string
  truckNumber: string
  truckType: TruckType
  transmission?: 'Automatic' | 'Manual'
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

const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Tandem', 'Semi Trailer', 'Semi']

export default function AdminPage() {
  const [truckDatabase, setTruckDatabase] = useState<TruckDatabaseEntry[]>([])
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    dailyResetEnabled: false,
    resetTime: '00:00'
  })
  const [customResetTime, setCustomResetTime] = useState('')
  const [editingTruckDb, setEditingTruckDb] = useState<string | null>(null)
  const [newTruckDbForm, setNewTruckDbForm] = useState(false)

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
    setTruckDatabase(truckDatabase.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates }
        // Remove transmission if truck type is Semi Trailer
        if (updated.truckType === 'Semi Trailer') {
          delete updated.transmission
        } else if (!updated.transmission) {
          // Add default transmission if not a trailer and no transmission set
          updated.transmission = 'Automatic'
        }
        return updated
      }
      return t
    }))
  }

  // Delete truck from database
  const deleteTruckFromDatabase = (id: string) => {
    setTruckDatabase(truckDatabase.filter(t => t.id !== id))
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
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Clock className="w-5 h-5 text-blue-600" />
              Daily Reset Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <div>
                <div className="font-semibold text-lg text-gray-900">Enable Daily Reset</div>
                <div className="text-sm text-gray-700 mt-1">
                  Automatically clear Print Room, PreShift, and Live View data at scheduled time
                </div>
                <div className="text-xs text-red-700 font-medium mt-2 bg-red-50 px-2 py-1 rounded inline-block">
                  ⚠️ Semi Tractor & Trailer Database on PreShift page is protected
                </div>
              </div>
              <Button
                onClick={() => setAdminSettings({
                  ...adminSettings,
                  dailyResetEnabled: !adminSettings.dailyResetEnabled
                })}
                className={`min-w-[120px] font-bold text-white ${
                  adminSettings.dailyResetEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                size="lg"
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
                      <Label className="text-gray-900 font-medium mb-2 block">Hour</Label>
                      <Select
                        value={hours12.toString()}
                        onValueChange={(value) => {
                          const newTime = convertTo24Hour(parseInt(value), minutes, period)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger className="border-2 border-gray-300 bg-white text-gray-900">
                          <SelectValue className="text-gray-900" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-gray-300">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <SelectItem key={h} value={h.toString()} className="text-gray-900 hover:bg-blue-50">
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-gray-900 font-medium mb-2 block">Minute</Label>
                      <Select
                        value={minutes.toString()}
                        onValueChange={(value) => {
                          const newTime = convertTo24Hour(hours12, parseInt(value), period)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger className="border-2 border-gray-300 bg-white text-gray-900">
                          <SelectValue className="text-gray-900" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-gray-300 max-h-60">
                          {Array.from({ length: 60 }, (_, i) => i).map(m => (
                            <SelectItem key={m} value={m.toString()} className="text-gray-900 hover:bg-blue-50">
                              {m.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-gray-900 font-medium mb-2 block">Period</Label>
                      <Select
                        value={period}
                        onValueChange={(value: 'AM' | 'PM') => {
                          const newTime = convertTo24Hour(hours12, minutes, value)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger className="border-2 border-gray-300 bg-white text-gray-900">
                          <SelectValue className="text-gray-900" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-2 border-gray-300">
                          <SelectItem value="AM" className="text-gray-900 hover:bg-blue-50">AM</SelectItem>
                          <SelectItem value="PM" className="text-gray-900 hover:bg-blue-50">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-gray-900 font-medium mb-2 block">Or Enter Custom Time</Label>
                    <p className="text-xs text-gray-600 mb-2">Format: HH:MM AM/PM or HH:MM (24-hour)</p>
                    <div className="flex gap-2">
                      <Input
                        value={customResetTime}
                        onChange={(e) => setCustomResetTime(e.target.value)}
                        placeholder="e.g., 11:30 PM or 23:30"
                        className="border-2 border-gray-300 bg-white text-gray-900"
                      />
                      <Button 
                        onClick={handleSetCustomTime}
                        className="min-w-[100px] border-2 font-bold bg-blue-600 hover:bg-blue-700 text-white"
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
                className="w-full font-bold bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                Reset Print Room
              </Button>
              {adminSettings.lastPrintRoomReset && (
                <p className="text-xs text-gray-700 text-center">
                  Last reset: {new Date(adminSettings.lastPrintRoomReset).toLocaleString()}
                </p>
              )}

              <Button
                onClick={() => {
                  if (window.confirm('Reset PreShift data? This will clear all staging door positions.\n\nSemi Tractor & Trailer Database will NOT be affected.')) {
                    setAdminSettings({ ...adminSettings, lastPreShiftReset: Date.now() })
                    alert('PreShift data has been reset!\n\nSemi Tractor & Trailer Database preserved.')
                  }
                }}
                className="w-full font-bold bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                Reset PreShift Setup
              </Button>
              {adminSettings.lastPreShiftReset && (
                <p className="text-xs text-gray-700 text-center">
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
                className="w-full font-bold bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                Reset Live Movement
              </Button>
              {adminSettings.lastLiveViewReset && (
                <p className="text-xs text-gray-700 text-center">
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
                  className="w-full font-bold bg-red-700 hover:bg-red-800 text-white"
                  size="lg"
                >
                  ⚠️ RESET ALL (Except Semi Database)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Truck Database Management */}
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Truck Database (Vans, Box Trucks & Tandems)</CardTitle>
              <Button 
                onClick={() => setNewTruckDbForm(true)} 
                className="font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Truck
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {newTruckDbForm && (
              <div className="mb-4">
                <Button 
                  onClick={addTruckToDatabase} 
                  className="w-full font-bold bg-green-600 hover:bg-green-700 text-white" 
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Truck Entry
                </Button>
              </div>
            )}
            
            {truckDatabase.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">No trucks in database</p>
                <p className="text-sm text-gray-600 mt-1">Click "Add Truck" to create your first entry</p>
              </div>
            ) : (
              <div className="space-y-4">
                {truckDatabase.map(truck => (
                  <div key={truck.id} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    {editingTruckDb === truck.id ? (
                      <div className="space-y-4">
                        <div className={`grid ${truck.truckType === 'Semi Trailer' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                          <div>
                            <Label className="text-gray-900 font-medium mb-2 block">Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updateTruckInDatabase(truck.id, { truckNumber: e.target.value })}
                              placeholder="Truck #"
                              className="border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-900 font-medium mb-2 block">Truck Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruckInDatabase(truck.id, { truckType: value })}
                            >
                              <SelectTrigger className="border-2 border-gray-300 bg-white text-gray-900">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-2 border-gray-300">
                                {truckTypes.map(type => (
                                  <SelectItem key={type} value={type} className="text-gray-900 hover:bg-blue-50 cursor-pointer">
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {truck.truckType !== 'Semi Trailer' && (
                          <div>
                            <Label className="text-gray-900 font-medium mb-2 block">Transmission</Label>
                            <Select
                              value={truck.transmission || 'Automatic'}
                              onValueChange={(value: 'Automatic' | 'Manual') => updateTruckInDatabase(truck.id, { transmission: value })}
                            >
                              <SelectTrigger className="border-2 border-gray-300 bg-white text-gray-900">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-2 border-gray-300">
                                <SelectItem value="Automatic" className="text-gray-900 hover:bg-blue-50 cursor-pointer">Automatic</SelectItem>
                                <SelectItem value="Manual" className="text-gray-900 hover:bg-blue-50 cursor-pointer">Manual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div>
                          <Label className="text-gray-900 font-medium mb-2 block">Notes</Label>
                          <Textarea
                            value={truck.notes}
                            onChange={(e) => updateTruckInDatabase(truck.id, { notes: e.target.value })}
                            placeholder="Additional information..."
                            rows={2}
                            className="border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setEditingTruckDb(null)} 
                            className="font-bold bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            onClick={() => updateTruckInDatabase(truck.id, { active: !truck.active })}
                            className={`font-bold border-2 ${
                              truck.active 
                                ? 'bg-white hover:bg-gray-100 text-gray-900 border-gray-300' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                            }`}
                          >
                            {truck.active ? 'Set Inactive' : 'Set Active'}
                          </Button>
                          <Button 
                            onClick={() => deleteTruckFromDatabase(truck.id)} 
                            className="font-bold bg-red-600 hover:bg-red-700 text-white"
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
                            <div className={`${truck.active ? 'bg-blue-600' : 'bg-gray-500'} text-white rounded px-3 py-1 font-bold`}>
                              {truck.truckNumber || 'New Truck'}
                            </div>
                            <div className="text-sm text-gray-900 font-medium">{truck.truckType}</div>
                            {truck.transmission && (
                              <div className="text-sm text-gray-900 font-medium">{truck.transmission}</div>
                            )}
                          </div>
                          {truck.notes && (
                            <div className="text-sm text-gray-700 mt-2">{truck.notes}</div>
                          )}
                        </div>
                        <Button 
                          onClick={() => setEditingTruckDb(truck.id)} 
                          className="font-bold border-2 bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                        >
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
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-gray-900">System Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <div className="bg-orange-100 rounded-lg p-4 text-center border-2 border-orange-300">
                <div className="text-3xl font-bold text-orange-700">
                  {truckDatabase.filter(t => !t.active).length}
                </div>
                <div className="text-sm font-bold text-orange-900">Inactive Trucks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
