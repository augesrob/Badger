export type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
export type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
export type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
export type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 'End' | 'Gap' | 'Transfer'

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
  lastUpdated: number
}

export interface MovementTruck {
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  truckType: TruckType
  status: TruckStatus
  doorStatus: DoorStatus
  ignored: boolean
  trailerNumber?: string
  lastUpdated: number
}

export interface Driver {
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

export interface VanSemiNumber {
  id: string
  number: string
  type: 'Van' | 'Semi'
}

export const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
export const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
export const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
export const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
export const doorStatusOptions: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
export const truckStatuses: TruckStatus[] = ['On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back', 'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B', 'End', 'Gap', 'Transfer']

export const getRouteColor = (route: Route): string => {
  const colors = {
    '1-Fond Du Lac': '#2563eb',
    '2-Green Bay': '#16a34a',
    '3-Wausau': '#9333ea',
    '4-Caledonia': '#ea580c',
    '5-Chippewa Falls': '#dc2626'
  }
  return colors[route]
}

export const getTruckStatusColor = (status: TruckStatus): string => {
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
