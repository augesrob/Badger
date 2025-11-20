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
import { Truck, Plus, Trash, Edit, Save, Menu, Home } from 'lucide-react'
import Link from 'next/link'

type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'

interface TruckData {
  id: string
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  truckType: TruckType
}

const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

export default function PrintRoomPage() {
  const [trucks, setTrucks] = useState<TruckData[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)

  const addTruck = (door: string, batch: number = 1) => {
    const newTruck: TruckData = {
      id: Date.now().toString(),
      truckNumber: '',
      door,
      route: '1-Fond Du Lac',
      pods: 0,
      pallets: 0,
      notes: '',
      batch,
      truckType: 'Van'
    }
    setTrucks([...trucks, newTruck])
    setEditingTruck(newTruck.id)
  }

  const updateTruck = (id: string, updates: Partial<TruckData>) => {
    setTrucks(trucks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTruck = (id: string) => {
    setTrucks(trucks.filter(t => t.id !== id))
  }

  const getTrucksByBatch = (batch: number) => {
    return trucks.filter(t => t.batch === batch)
  }

  const getRouteStats = () => {
    const stats: Record<Route, number> = {
      '1-Fond Du Lac': 0,
      '2-Green Bay': 0,
      '3-Wausau': 0,
      '4-Caledonia': 0,
      '5-Chippewa Falls': 0
    }
    trucks.forEach(truck => stats[truck.route]++)
    return stats
  }

  const routeStats = getRouteStats()
  const totalPods = trucks.reduce((sum, t) => sum + t.pods, 0)
  const totalPallets = trucks.reduce((sum, t) => sum + t.pallets, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Menu className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Print Room</h1>
                <p className="text-sm text-gray-500">Route planning and batch organization</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Statistics */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Shift Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {routes.map(route => (
                <div key={route} className="text-center">
                  <div className={`${routeColors[route]} text-white rounded-lg p-3 mb-2`}>
                    <div className="text-2xl font-bold">{routeStats[route]}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">{route}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-700">{totalPods}</div>
                <div className="text-sm font-medium text-blue-600">Total Pods</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{totalPallets}</div>
                <div className="text-sm font-medium text-green-600">Total Pallets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Door Grid */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Loading Doors (13A - 15B)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loadingDoors.map(door => {
                const doorTrucks = trucks.filter(t => t.door === door)
                return (
                  <div key={door} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <div className="text-center font-bold mb-2 text-lg text-gray-900">Door {door}</div>
                    {doorTrucks.length === 0 ? (
                      <Button 
                        onClick={() => addTruck(door)}
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Truck
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {doorTrucks.map(truck => (
                          <div key={truck.id} className={`${routeColors[truck.route]} text-white rounded p-2 text-center font-bold`}>
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
          <Card key={batch} className="bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Batch {batch}</CardTitle>
                <Button onClick={() => addTruck(loadingDoors[0], batch)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Truck
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTrucksByBatch(batch).map(truck => (
                  <div key={truck.id} className="border rounded-lg p-4 bg-white">
                    {editingTruck === truck.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-gray-700">Truck Number</Label>
                            <Input
                              value={truck.truckNumber}
                              onChange={(e) => updateTruck(truck.id, { truckNumber: e.target.value })}
                              placeholder="Enter truck #"
                              className="bg-white text-gray-900"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700">Door</Label>
                            <Select
                              value={truck.door}
                              onValueChange={(value) => updateTruck(truck.id, { door: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {loadingDoors.map(door => (
                                  <SelectItem key={door} value={door}>{door}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700">Route</Label>
                            <Select
                              value={truck.route}
                              onValueChange={(value: Route) => updateTruck(truck.id, { route: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {routes.map(route => (
                                  <SelectItem key={route} value={route}>{route}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700">Truck Type</Label>
                            <Select
                              value={truck.truckType}
                              onValueChange={(value: TruckType) => updateTruck(truck.id, { truckType: value })}
                            >
                              <SelectTrigger className="bg-white text-gray-900">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {truckTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
                                onClick={() => updateTruck(truck.id, { pods: Math.max(0, truck.pods - 1) })}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pods}
                                onChange={(e) => updateTruck(truck.id, { pods: parseInt(e.target.value) || 0 })}
                                className="text-center bg-white text-gray-900"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pods: truck.pods + 1 })}
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
                                onClick={() => updateTruck(truck.id, { pallets: Math.max(0, truck.pallets - 1) })}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={truck.pallets}
                                onChange={(e) => updateTruck(truck.id, { pallets: parseInt(e.target.value) || 0 })}
                                className="text-center bg-white text-gray-900"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTruck(truck.id, { pallets: truck.pallets + 1 })}
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
                            onChange={(e) => updateTruck(truck.id, { notes: e.target.value })}
                            placeholder="Tray types, pallet specs, special instructions..."
                            rows={3}
                            className="bg-white text-gray-900"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingTruck(null)} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={() => deleteTruck(truck.id)} variant="destructive" size="sm">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className={`${routeColors[truck.route]} text-white rounded px-3 py-1 font-bold`}>
                              {truck.truckNumber || 'New'}
                            </div>
                            <div className="text-sm text-gray-600">Door {truck.door}</div>
                            <div className="text-sm text-gray-600">{truck.route}</div>
                            <div className="text-sm text-gray-600">{truck.truckType}</div>
                            <div className="text-sm text-gray-600">Pods: {truck.pods}</div>
                            <div className="text-sm text-gray-600">Pallets: {truck.pallets}</div>
                          </div>
                          {truck.notes && (
                            <div className="text-sm text-gray-500 mt-2">{truck.notes}</div>
                          )}
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
    </div>
  )
}
