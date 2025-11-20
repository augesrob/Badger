"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, Home } from 'lucide-react'
import Link from 'next/link'

type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 
                   'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 
                   'End' | 'Gap' | 'Transfer'

interface TruckData {
  id: string
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  batch: number
  truckType: TruckType
  status: TruckStatus
  doorStatus: DoorStatus
  ignored: boolean
  lastUpdated: number
}

const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const doorStatuses: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
const truckStatuses: TruckStatus[] = [
  'On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back',
  'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B',
  'End', 'Gap', 'Transfer'
]

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

const statusColors: Record<TruckStatus, string> = {
  'On Route': 'bg-blue-600',
  'In Door': 'bg-green-600',
  'Put Away': 'bg-gray-600',
  'In Front': 'bg-yellow-600',
  'Ready': 'bg-cyan-600',
  'In Back': 'bg-indigo-600',
  'The Rock': 'bg-stone-600',
  'Yard': 'bg-lime-600',
  'Missing': 'bg-red-600',
  'Doors 8-11': 'bg-pink-600',
  'Doors 12A-15B': 'bg-teal-600',
  'End': 'bg-violet-600',
  'Gap': 'bg-amber-600',
  'Transfer': 'bg-fuchsia-600'
}

export default function MovementPage() {
  const [trucks, setTrucks] = useState<TruckData[]>([])
  const [filterRoute, setFilterRoute] = useState<Route | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TruckStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const updateTruck = (id: string, updates: Partial<TruckData>) => {
    setTrucks(trucks.map(t => 
      t.id === id ? { ...t, ...updates, lastUpdated: Date.now() } : t
    ))
  }

  const filteredTrucks = trucks.filter(truck => {
    if (filterRoute !== 'all' && truck.route !== filterRoute) return false
    if (filterStatus !== 'all' && truck.status !== filterStatus) return false
    if (searchTerm && !truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Live Movement</h1>
                <p className="text-sm text-gray-500">Real-time truck tracking and status updates</p>
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
        {/* Filters */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-700">Search Truck Number</Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="bg-white text-gray-900"
                />
              </div>
              <div>
                <Label className="text-gray-700">Filter by Route</Label>
                <Select value={filterRoute} onValueChange={(value: Route | 'all') => setFilterRoute(value)}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Routes</SelectItem>
                    {routes.map(route => (
                      <SelectItem key={route} value={route}>{route}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={(value: TruckStatus | 'all') => setFilterStatus(value)}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {truckStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Movement Dashboard */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Live Truck Movement Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTrucks.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Trucks Found</h3>
                <p className="text-gray-500">Add trucks in Print Room or PreShift to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrucks.map(truck => (
                  <div key={truck.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`${routeColors[truck.route]} text-white rounded px-4 py-2 font-bold text-lg`}>
                          {truck.truckNumber || 'New'}
                        </div>
                        <div className={`${statusColors[truck.status]} text-white rounded px-3 py-1 text-sm font-medium`}>
                          {truck.status}
                        </div>
                        <div className="text-sm text-gray-600">Door {truck.door}</div>
                        <div className="text-sm text-gray-600">{truck.route}</div>
                        <div className="text-sm text-gray-600">{truck.truckType}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateTruck(truck.id, { ignored: !truck.ignored })}
                          variant={truck.ignored ? "default" : "outline"}
                          size="sm"
                        >
                          {truck.ignored ? 'Unignore' : 'Ignore'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700">Truck Status</Label>
                        <Select
                          value={truck.status}
                          onValueChange={(value: TruckStatus) => updateTruck(truck.id, { status: value })}
                        >
                          <SelectTrigger className="bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {truckStatuses.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-gray-700">Door Status</Label>
                        <Select
                          value={truck.doorStatus}
                          onValueChange={(value: DoorStatus) => updateTruck(truck.id, { doorStatus: value })}
                        >
                          <SelectTrigger className="bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {doorStatuses.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm text-gray-600">Pods</div>
                        <div className="text-xl font-bold text-blue-700">{truck.pods}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm text-gray-600">Pallets</div>
                        <div className="text-xl font-bold text-green-700">{truck.pallets}</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-sm text-gray-600">Batch</div>
                        <div className="text-xl font-bold text-purple-700">{truck.batch}</div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-400">
                      Last updated: {new Date(truck.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Quick Status Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {truckStatuses.slice(0, 8).map(status => (
                <Button
                  key={status}
                  onClick={() => {
                    const selectedTrucks = filteredTrucks.filter(t => !t.ignored)
                    if (selectedTrucks.length > 0 && window.confirm(`Update ${selectedTrucks.length} trucks to ${status}?`)) {
                      selectedTrucks.forEach(truck => updateTruck(truck.id, { status }))
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className={`${statusColors[status]} text-white hover:opacity-80`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
