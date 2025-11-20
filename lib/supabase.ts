import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface TruckData {
  id: string
  truck_number: string
  door: string
  route: string
  pods: number
  pallets: number
  notes: string
  batch: number
  truck_type: string
  staging_door?: string
  staging_position?: number
  status: string
  door_status?: string
  ignored: boolean
  last_updated: number
  created_at?: string
}

export interface Driver {
  id: string
  name: string
  phone: string
  tractor_number: string
  trailer_numbers: string[]
  notes: string
  active: boolean
  created_at?: string
}

export interface TruckDatabase {
  id: string
  truck_number: string
  truck_type: string
  transmission: string
  notes: string
  active: boolean
  created_at?: string
}
