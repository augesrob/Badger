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
import { Truck, Users, Activity, Plus, Trash, Edit, Save, X } from 'lucide-react'

// Types
type Route = '1-Fond Du Lac' | '2-Green Bay' | '3-Wausau' | '4-Caledonia' | '5-Chippewa Falls'
type TruckType = 'Van' | 'Box Truck' | 'Semi Trailer' | 'Semi'
type DoorStatus = 'Loading' | 'EOT' | 'EOT+1' | 'Change Truck/Trailer' | 'Waiting' | 'Done For Night'
type TruckStatus = 'On Route' | 'In Door' | 'Put Away' | 'In Front' | 'Ready' | 'In Back' | 
                   'The Rock' | 'Yard' | 'Missing' | 'Doors 8-11' | 'Doors 12A-15B' | 
                   'End' | 'Gap' | 'Transfer'

interface PrintRoomTruck {
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

interface PreShiftTruck {
  id: string
  truckNumber: string
  stagingDoor: string
  stagingPosition: number
  lastUpdated: number
}

interface MovementTruck {
  truckNumber: string
  door: string
  route: Route
  pods: number
  pallets: number
  notes: string
  batch: number
  truckType: TruckType
  status: TruckStatus
  ignored: boolean
  trailerNumber?: string
  lastUpdated: number
}

interface Driver {
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

interface VanSemiNumber {
  id: string
  number: string
  type: 'Van' | 'Semi'
}

interface AppData {
  printRoomTrucks: PrintRoomTruck[]
  preShiftTrucks: PreShiftTruck[]
  movementTrucks: Record<string, MovementTruck>
  doorStatuses: Record<string, DoorStatus>
  drivers: Driver[]
  vanSemiNumbers: VanSemiNumber[]
  lastSync: number
}

const loadingDoors = ['13A', '13B', '14A', '14B', '15A', '15B']
const stagingDoors = Array.from({ length: 11 }, (_, i) => (18 + i).toString())
const routes: Route[] = ['1-Fond Du Lac', '2-Green Bay', '3-Wausau', '4-Caledonia', '5-Chippewa Falls']
const doorStatusOptions: DoorStatus[] = ['Loading', 'EOT', 'EOT+1', 'Change Truck/Trailer', 'Waiting', 'Done For Night']
const truckStatuses: TruckStatus[] = [
  'On Route', 'In Door', 'Put Away', 'In Front', 'Ready', 'In Back',
  'The Rock', 'Yard', 'Missing', 'Doors 8-11', 'Doors 12A-15B',
  'End', 'Gap', 'Transfer'
]

const routeColors: Record<Route, string> = {
  '1-Fond Du Lac': 'bg-blue-600',
  '2-Green Bay': 'bg-green-600',
  '3-Wausau': 'bg-purple-600',
  '4-Caledonia': 'bg-orange-600',
  '5-Chippewa Falls': 'bg-red-600'
}

const doorStatusColors: Record<DoorStatus, string> = {
  'Loading': 'bg-green-600',
  'EOT': 'bg-yellow-600',
  'EOT+1': 'bg-orange-600',
  'Change Truck/Trailer': 'bg-blue-600',
  'Waiting': 'bg-gray-600',
  'Done For Night': 'bg-red-600'
}

const STORAGE_KEY = 'badger-truck-mover-data'

export default function TruckManagementSystem() {
  const [activeTab, setActiveTab] = useState<'print' | 'preshift' | 'movement'>('print')
  const [printRoomTrucks, setPrintRoomTrucks] = useState<PrintRoomTruck[]>([])
  const [preShiftTrucks, setPreShiftTrucks] = useState<PreShiftTruck[]>([])
  const [movementTrucks, setMovementTrucks] = useState<Record<string, MovementTruck>>({})
  const [doorStatuses, setDoorStatuses] = useState<Record<string, DoorStatus>>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vanSemiNumbers, setVanSemiNumbers] = useState<VanSemiNumber[]>([])
  const [editingTruck, setEditingTruck] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [newDriverForm, setNewDriverForm] = useState(false)
  const [newVanSemiForm, setNewVanSemiForm] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing'>('connected')
  const [lastSync, setLastSync] = useState<number>(Date.now())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: AppData = JSON.parse(stored)
          setPrintRoomTrucks(data.printRoomTrucks || [])
          setPreShiftTrucks(data.preShiftTrucks || [])
          setMovementTrucks(data.movementTrucks || {})
          setDoorStatuses(data.doorStatuses || {})
          setDrivers(data.drivers || [])
          setVanSemiNumbers(data.vanSemiNumbers || [])
          setLastSync(data.lastSync || Date.now())
        } else {
          const initialStatuses: Record<string, DoorStatus> = {}
          loadingDoors.forEach(door => {
            initialStatuses[door] = 'Loading'
          })
          setDoorStatuses(initialStatuses)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
      setIsLoaded(true)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    const saveData = () => {
      try {
        const data: AppData = {
          printRoomTrucks,
          preShiftTrucks,
          movementTrucks,
          doorStatuses,
          drivers,
          vanSemiNumbers,
          lastSync: Date.now()
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setLastSync(Date.now())
      } catch (error) {
        console.error('Error saving data:', error)
      }
    }
    saveData()
  }, [printRoomTrucks, preShiftTrucks, movementTrucks, doorStatuses, drivers, vanSemiNumbers, isLoaded])

  useEffect(() => {
    const checkForUpdates = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data: AppData = JSON.parse(stored)
          if (data.lastSync > lastSync) {
            setSyncStatus('syncing')
            setPrintRoomTrucks(data.printRoomTrucks || [])
            setPreShiftTrucks(data.preShiftTrucks || [])
            setMovementTrucks(data.movementTrucks || {})
            setDoorStatuses(data.doorStatuses || {})
            setDrivers(data.drivers || [])
            setVanSemiNumbers(data.vanSemiNumbers || [])
            setLastSync(data.lastSync)
            setTimeout(() => setSyncStatus('connected'), 500)
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }
    const interval = setInterval(checkForUpdates, 2000)
    return () => clearInterval(interval)
  }, [lastSync])

  useEffect(() => {
    if (!isLoaded) return
    const newMovementTrucks: Record<string, MovementTruck> = {}
    printRoomTrucks.forEach(printTruck => {
      const preShiftTruck = preShiftTrucks.find(pt => pt.truckNumber === printTruck.truckNumber)
      const existingMovement = movementTrucks[printTruck.truckNumber]
      const trailerMatch = printTruck.truckNumber.match(/-(\d+)$/)
      const trailerNumber = trailerMatch ? `-${trailerMatch[1]}` : undefined
      const baseTruckNumber = printTruck.truckNumber.replace(/-\d+$/, '')
      newMovementTrucks[printTruck.truckNumber] = {
        truckNumber: printTruck.truckNumber,
        door: printTruck.door,
        route: printTruck.route,
        pods: printTruck.pods,
        pallets: printTruck.pallets,
        notes: printTruck.notes,
        batch: printTruck.batch,
        truckType: determineTruckType(baseTruckNumber),
        status: existingMovement?.status || (preShiftTruck ? 'Ready' : 'Missing'),
        ignored: existingMovement?.ignored || false,
        trailerNumber: trailerNumber,
        lastUpdated: Date.now()
      }
    })
    setMovementTrucks(newMovementTrucks)
  }, [printRoomTrucks, preShiftTrucks, drivers, isLoaded])

  const determineTruckType = (truckNumber: string): TruckType => {
    const baseTruckNumber = truckNumber.replace(/-\d+$/, '')
    const num = parseInt(baseTruckNumber)
    const vanSemi = vanSemiNumbers.find(vs => vs.number === baseTruckNumber)
    if (vanSemi) return vanSemi.type
    const driver = drivers.find(d => 
      d.tractorNumber === baseTruckNumber || 
      d.trailer1 === baseTruckNumber || 
      d.trailer2 === baseTruckNumber || 
      d.trailer3 === baseTruckNumber
    )
    if (driver) return 'Semi'
    if (!isNaN(num) && num < 170) return 'Box Truck'
    return 'Semi Trailer'
  }
