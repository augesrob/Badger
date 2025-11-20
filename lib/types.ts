// Route and Truck Types
export type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
export type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
export type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
export type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 
                   'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 
                   'End' | 'Gap' | 'Transfer'

// Truck Data Interfaces
export interface PrintRoomTruck {
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

export interface PreShiftTruck {
  id: string
  truckNumber: string
  stagingDoor: string
  stagingPosition: number
  truckType: TruckType
  route: Route
  notes: string
  lastUpdated: number
}

export interface MovementTruck {
  id: string
  truckNumber: string
  door: string
  route: Route
  truckType: TruckType
  status: TruckStatus
  doorStatus: DoorStatus
  pods: number
  pallets: number
  batch: number
  notes: string
  ignored: boolean
  lastUpdated: number
}

export interface TruckData {
  id: string
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  truckType: TruckType
  stagingDoor?: string
  stagingPosition?: number
  status: TruckStatus
  doorStatus?: DoorStatus
  ignored: boolean
  lastUpdated: number
}

export interface Driver {
  id: string
  name: string
  phone: string
  tractorNumber: string
  trailerNumbers: string[]
  notes: string
  active: boolean
}

export interface VanSemiNumber {
  id: string
  number: string
  type: 'Van' | 'Semi'
  inUse: boolean
  assignedTo?: string
}

// Constants
export const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
export const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
export const receivingDoors = ['8', '9', '10', '11']
export const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
export const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
export const doorStatuses: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
export const doorStatusOptions: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
export const truckStatuses: TruckStatus[] = [
  'On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back',
  'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B',
  'End', 'Gap', 'Transfer'
]

// Color mappings
export const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-500',
  '2-Green Bay': 'bg-green-500',
  '3-Wausau': 'bg-purple-500',
  '4-Caledonia': 'bg-orange-500',
  '5-Chippewa Falls': 'bg-red-500'
}

export const statusColors: Record<TruckStatus, string> = {
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

// Helper functions
export function getRouteColor(route: Route): string {
  return routeColors[route] || 'bg-gray-500'
}

export function getTruckStatusColor(status: TruckStatus): string {
  return statusColors[status] || 'bg-gray-500'
}

export function getDoorStatusColor(status: DoorStatus): string {
  const doorStatusColors: Record<DoorStatus, string> = {
    'Loading': 'bg-blue-500',
    'EOT': 'bg-yellow-500',
    'EOT+1': 'bg-orange-500',
    'Change Truck/Trailer': 'bg-purple-500',
    'Waiting': 'bg-gray-500',
    'Done For Night': 'bg-green-500'
  }
  return doorStatusColors[status] || 'bg-gray-500'
}
