export type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
export type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
export type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
export type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 
                   'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 
                   'End' | 'Gap' | 'Transfer'

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

export const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
export const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
export const receivingDoors = ['8', '9', '10', '11']
export const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
export const truckTypes: TruckType[] = ['Van', 'Box Truck', 'Semi Trailer', 'Semi']
export const doorStatuses: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
export const truckStatuses: TruckStatus[] = [
  'On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back',
  'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B',
  'End', 'Gap', 'Transfer'
]

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
