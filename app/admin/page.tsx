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
import { Truck, Plus, Trash, Edit, Save, Clock, Settings } from 'lucide-react'

type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'

interface TruckDatabaseEntry {
  id: string
  truckNumber: string
  truckType: TruckType
  transmission: 'Automatic' | 'Manual'
  notes: string
  active: boolean
}

interface AdminSettings {
  dailyResetEnabled: boolean
  resetTime: string
  lastReset?: number
}

const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']

export default function AdminPage() {
  const [truckDatabase, setTruckDatabase] = useState<TruckDatabaseEntry[]>([])
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    dailyResetEnabled: false,
    resetTime: '00:00'
  })
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
    setTruckDatabase(truckDatabase.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ))
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

  const [hours, minutes] = adminSettings.resetTime.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">System configuration and truck database</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Daily Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Reset Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <div className="font-semibold text-lg text-gray-900">Enable Daily Reset</div>
                <div className="text-sm text-gray-700 mt-1">
                  Automatically clear all truck data at a scheduled time each day
                </div>
              </div>
              <Button
                onClick={() => setAdminSettings({
                  ...adminSettings,
                  dailyResetEnabled: !adminSettings.dailyResetEnabled
                })}
                variant={adminSettings.dailyResetEnabled ? "default" : "outline"}
                size="lg"
              >
                {adminSettings.dailyResetEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {adminSettings.dailyResetEnabled && (
              <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-white">
                <div>
                  <Label className="text-lg font-semibold text-gray-900">Reset Time</Label>
                  <p className="text-sm text-gray-700 mb-4">
                    Set the time when all truck data will be automatically cleared
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-900">Hour</Label>
                      <Select
                        value={hours12.toString()}
                        onValueChange={(value) => {
                          const newTime = convertTo24Hour(parseInt(value), minutes, period)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger>
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
                      <Label className="text-gray-900">Minute</Label>
                      <Select
                        value={minutes.toString()}
                        onValueChange={(value) => {
                          const newTime = convertTo24Hour(hours12, parseInt(value), period)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger>
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
                      <Label className="text-gray-900">Period</Label>
                      <Select
                        value={period}
                        onValueChange={(value: 'AM' | 'PM') => {
                          const newTime = convertTo24Hour(hours12, minutes, value)
                          setAdminSettings({ ...adminSettings, resetTime: newTime })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                    <div className="text-sm font-medium text-green-900">
                      Current Reset Time: {formatTime12Hour(adminSettings.resetTime)}
                    </div>
                    {adminSettings.lastReset && (
                      <div className="text-sm text-green-800 mt-1">
                        Last Reset: {new Date(adminSettings.lastReset).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to manually reset all truck data now?')) {
                        setAdminSettings({ ...adminSettings, lastReset: Date.now() })
                        alert('Reset triggered! (In production, this would clear all truck data)')
                      }
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    Manual Reset Now
                  </Button>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    This will immediately clear all truck data
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Truck Database Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Truck Database</CardTitle>
              <Button onClick={() => setNewTruckDbForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Truck
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {newTruckDbForm && (
              <div className="mb-4">
                <Button onClick={addTruckToDatabase} className="w-full">
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
                  <div key={truck.id} className="border rounded-lg p-4 bg-white">
                    {editingTruckDb === truck.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-900">Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updateTruckInDatabase(truck.id, { truckNumber: e.target.value })}
                              placeholder="Truck #"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-900">Truck Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruckInDatabase(truck.id, { truckType: value })}
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
                        <div>
                          <Label className="text-gray-900">Transmission</Label>
                          <Select
                            value={truck.transmission}
                            onValueChange={(value: 'Automatic' | 'Manual') => updateTruckInDatabase(truck.id, { transmission: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Automatic">Automatic</SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-900">Notes</Label>
                          <Textarea
                            value={truck.notes}
                            onChange={(e) => updateTruckInDatabase(truck.id, { notes: e.target.value })}
                            placeholder="Additional information..."
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingTruckDb(null)} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            onClick={() => updateTruckInDatabase(truck.id, { active: !truck.active })}
                            variant={truck.active ? "outline" : "default"}
                            size="sm"
                          >
                            {truck.active ? 'Set Inactive' : 'Set Active'}
                          </Button>
                          <Button onClick={() => deleteTruckFromDatabase(truck.id)} variant="destructive" size="sm">
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
                            <div className="text-sm text-gray-700">{truck.truckType}</div>
                            <div className="text-sm text-gray-700">{truck.transmission}</div>
                          </div>
                          {truck.notes && (
                            <div className="text-sm text-gray-600 mt-2">{truck.notes}</div>
                          )}
                        </div>
                        <Button onClick={() => setEditingTruckDb(truck.id)} variant="outline" size="sm">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{truckDatabase.length}</div>
                <div className="text-sm font-medium text-blue-900">Total Trucks</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-700">
                  {truckDatabase.filter(t => t.active).length}
                </div>
                <div className="text-sm font-medium text-green-900">Active Trucks</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4 text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-700">
                  {truckDatabase.filter(t => !t.active).length}
                </div>
                <div className="text-sm font-medium text-purple-900">Inactive Trucks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// END OF FILE
