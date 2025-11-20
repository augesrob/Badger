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
import { Plus, Trash, Edit, Save, Users, Truck } from 'lucide-react'

// Types
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'

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
  inUse: boolean
}

interface StagedTruck {
  id: string
  truckNumber: string
  door: string
  position: number
  truckType: TruckType
  route: Route
}

const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

export default function PreShiftPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vanSemiNumbers, setVanSemiNumbers] = useState<VanSemiNumber[]>([])
  const [stagedTrucks, setStagedTrucks] = useState<StagedTruck[]>([])
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [newVanSemiNumber, setNewVanSemiNumber] = useState('')
  const [newVanSemiType, setNewVanSemiType] = useState<'Van' | 'Semi'>('Van')

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

  // Add van/semi number
  const addVanSemiNumber = () => {
    if (!newVanSemiNumber.trim()) return
    const newVanSemi: VanSemiNumber = {
      id: Date.now().toString(),
      number: newVanSemiNumber.trim(),
      type: newVanSemiType,
      inUse: false
    }
    setVanSemiNumbers([...vanSemiNumbers, newVanSemi])
    setNewVanSemiNumber('')
  }

  // Delete van/semi number
  const deleteVanSemiNumber = (id: string) => {
    setVanSemiNumbers(vanSemiNumbers.filter(v => v.id !== id))
  }

  // Toggle van/semi in use
  const toggleVanSemiInUse = (id: string) => {
    setVanSemiNumbers(vanSemiNumbers.map(v =>
      v.id === id ? { ...v, inUse: !v.inUse } : v
    ))
  }

  // Add staged truck
  const addStagedTruck = (door: string) => {
    const doorTrucks = stagedTrucks.filter(t => t.door === door)
    const nextPosition = doorTrucks.length + 1
    if (nextPosition > 4) return // Max 4 positions per door

    const newTruck: StagedTruck = {
      id: Date.now().toString(),
      truckNumber: '',
      door,
      position: nextPosition,
      truckType: 'Van',
      route: '1-Fond Du Lac'
    }
    setStagedTrucks([...stagedTrucks, newTruck])
  }

  // Update staged truck
  const updateStagedTruck = (id: string, updates: Partial<StagedTruck>) => {
    setStagedTrucks(stagedTrucks.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ))
  }

  // Delete staged truck
  const deleteStagedTruck = (id: string) => {
    setStagedTrucks(stagedTrucks.filter(t => t.id !== id))
  }

  // Get trucks for a specific door
  const getTrucksForDoor = (door: string) => {
    return stagedTrucks
      .filter(t => t.door === door)
      .sort((a, b) => a.position - b.position)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PreShift Setup</h1>
              <p className="text-sm text-gray-500">Configure initial truck positions and driver assignments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
                      <div className="grid grid-cols-2 gap-4">
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
                        <div className="flex items-center gap-4">
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

        {/* Van/Semi Number Management */}
        <Card>
          <CardHeader>
            <CardTitle>Van & Semi Number Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    value={newVanSemiNumber}
                    onChange={(e) => setNewVanSemiNumber(e.target.value)}
                    placeholder="Enter van or semi number..."
                    onKeyPress={(e) => e.key === 'Enter' && addVanSemiNumber()}
                  />
                </div>
                <Select
                  value={newVanSemiType}
                  onValueChange={(value: 'Van' | 'Semi') => setNewVanSemiType(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Semi">Semi</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addVanSemiNumber}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Vans</h3>
                  <div className="space-y-2">
                    {vanSemiNumbers.filter(v => v.type === 'Van').map(van => (
                      <div key={van.id} className="flex items-center justify-between border rounded p-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${van.inUse ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="font-medium">{van.number}</span>
                          <span className="text-sm text-gray-500">{van.inUse ? 'In Use' : 'Available'}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => toggleVanSemiInUse(van.id)}
                            variant="outline"
                            size="sm"
                          >
                            {van.inUse ? 'Mark Available' : 'Mark In Use'}
                          </Button>
                          <Button
                            onClick={() => deleteVanSemiNumber(van.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Semis</h3>
                  <div className="space-y-2">
                    {vanSemiNumbers.filter(v => v.type === 'Semi').map(semi => (
                      <div key={semi.id} className="flex items-center justify-between border rounded p-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${semi.inUse ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="font-medium">{semi.number}</span>
                          <span className="text-sm text-gray-500">{semi.inUse ? 'In Use' : 'Available'}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => toggleVanSemiInUse(semi.id)}
                            variant="outline"
                            size="sm"
                          >
                            {semi.inUse ? 'Mark Available' : 'Mark In Use'}
                          </Button>
                          <Button
                            onClick={() => deleteVanSemiNumber(semi.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                const doorTrucks = getTrucksForDoor(door)
                
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4">
                    <div className="text-center font-bold mb-3 text-lg">Door {door}</div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(position => {
                        const truck = doorTrucks.find(t => t.position === position)
                        return (
                          <div key={position} className="border rounded p-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Position {position} {position === 1 ? '(Front)' : position === 4 ? '(Back)' : ''}
                            </div>
                            {truck ? (
                              <div className="space-y-2">
                                <Input
                                  value={truck.truckNumber}
                                  onChange={(e) => updateStagedTruck(truck.id, { truckNumber: e.target.value })}
                                  placeholder="Truck #"
                                  className="text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Select
                                    value={truck.truckType}
                                    onValueChange={(value: TruckType) => updateStagedTruck(truck.id, { truckType: value })}
                                  >
                                    <SelectTrigger className="text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {truckTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={truck.route}
                                    onValueChange={(value: Route) => updateStagedTruck(truck.id, { route: value })}
                                  >
                                    <SelectTrigger className="text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {routes.map(route => (
                                        <SelectItem key={route} value={route}>{route.split('-')[0]}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  onClick={() => deleteStagedTruck(truck.id)}
                                  variant="destructive"
                                  size="sm"
                                  className="w-full"
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
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
                      onClick={() => addStagedTruck(door)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      disabled={doorTrucks.length >= 4}
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

        {/* PreShift Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>PreShift Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{stagedTrucks.length}</div>
                <div className="text-sm font-medium text-blue-600">Total Staged Trucks</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">
                  {vanSemiNumbers.filter(v => !v.inUse).length}
                </div>
                <div className="text-sm font-medium text-green-600">Available Vans/Semis</div>
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
    </div>
  )
}
