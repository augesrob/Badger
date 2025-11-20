import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('GET request - fetching data from Supabase')
    
    // Fetch all data in parallel
    const [trucksResult, driversResult, truckDbResult] = await Promise.all([
      supabase.from('trucks').select('*').order('last_updated', { ascending: false }),
      supabase.from('drivers').select('*').order('created_at', { ascending: false }),
      supabase.from('truck_database').select('*').order('truck_number', { ascending: true })
    ])
    
    if (trucksResult.error) {
      console.error('Error fetching trucks:', trucksResult.error)
    }
    if (driversResult.error) {
      console.error('Error fetching drivers:', driversResult.error)
    }
    if (truckDbResult.error) {
      console.error('Error fetching truck database:', truckDbResult.error)
    }
    
    const data = {
      trucks: trucksResult.data || [],
      drivers: driversResult.data || [],
      truckDatabase: truckDbResult.data || []
    }
    
    console.log('GET success - data loaded:', {
      trucksCount: data.trucks.length,
      driversCount: data.drivers.length,
      truckDatabaseCount: data.truckDatabase.length
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load data', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('POST request received')
    
    const results = []
    
    // Handle trucks
    if (body.trucks !== undefined) {
      console.log('Saving trucks:', body.trucks.length)
      
      // Delete all existing trucks and insert new ones
      const { error: deleteError } = await supabase.from('trucks').delete().neq('id', '')
      if (deleteError) {
        console.error('Error deleting trucks:', deleteError)
        results.push({ table: 'trucks', success: false, error: deleteError })
      } else {
        // Insert new trucks
        if (body.trucks.length > 0) {
          const { error: insertError } = await supabase.from('trucks').insert(
            body.trucks.map((truck: any) => ({
              id: truck.id,
              truck_number: truck.truckNumber,
              door: truck.door,
              route: truck.route,
              pods: truck.pods,
              pallets: truck.pallets,
              notes: truck.notes,
              batch: truck.batch,
              truck_type: truck.truckType,
              staging_door: truck.stagingDoor,
              staging_position: truck.stagingPosition,
              status: truck.status,
              door_status: truck.doorStatus,
              ignored: truck.ignored,
              last_updated: truck.lastUpdated
            }))
          )
          if (insertError) {
            console.error('Error inserting trucks:', insertError)
            results.push({ table: 'trucks', success: false, error: insertError })
          } else {
            results.push({ table: 'trucks', success: true })
          }
        } else {
          results.push({ table: 'trucks', success: true })
        }
      }
    }
    
    // Handle drivers
    if (body.drivers !== undefined) {
      console.log('Saving drivers:', body.drivers.length)
      
      const { error: deleteError } = await supabase.from('drivers').delete().neq('id', '')
      if (deleteError) {
        console.error('Error deleting drivers:', deleteError)
        results.push({ table: 'drivers', success: false, error: deleteError })
      } else {
        if (body.drivers.length > 0) {
          const { error: insertError } = await supabase.from('drivers').insert(
            body.drivers.map((driver: any) => ({
              id: driver.id,
              name: driver.name,
              phone: driver.phone,
              tractor_number: driver.tractorNumber,
              trailer_numbers: driver.trailerNumbers,
              notes: driver.notes,
              active: driver.active
            }))
          )
          if (insertError) {
            console.error('Error inserting drivers:', insertError)
            results.push({ table: 'drivers', success: false, error: insertError })
          } else {
            results.push({ table: 'drivers', success: true })
          }
        } else {
          results.push({ table: 'drivers', success: true })
        }
      }
    }
    
    // Handle truck database
    if (body.truckDatabase !== undefined) {
      console.log('Saving truck database:', body.truckDatabase.length)
      
      const { error: deleteError } = await supabase.from('truck_database').delete().neq('id', '')
      if (deleteError) {
        console.error('Error deleting truck database:', deleteError)
        results.push({ table: 'truck_database', success: false, error: deleteError })
      } else {
        if (body.truckDatabase.length > 0) {
          const { error: insertError } = await supabase.from('truck_database').insert(
            body.truckDatabase.map((truck: any) => ({
              id: truck.id,
              truck_number: truck.truckNumber,
              truck_type: truck.truckType,
              transmission: truck.transmission,
              notes: truck.notes,
              active: truck.active
            }))
          )
          if (insertError) {
            console.error('Error inserting truck database:', insertError)
            results.push({ table: 'truck_database', success: false, error: insertError })
          } else {
            results.push({ table: 'truck_database', success: true })
          }
        } else {
          results.push({ table: 'truck_database', success: true })
        }
      }
    }
    
    const allSuccess = results.every(r => r.success)
    console.log('POST complete:', results)
    
    return NextResponse.json({ 
      success: allSuccess,
      results 
    })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save data', details: String(error) },
      { status: 500 }
    )
  }
}
