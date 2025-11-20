import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

const BLOB_FILENAME = 'truck-data.json'

async function getBlobData() {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME })
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.log('No existing data, returning defaults')
  }
  
  return {
    printRoomTrucks: [],
    preShiftTrucks: [],
    movementTrucks: {},
    doorStatuses: {
      '13A': 'Loading',
      '13B': 'Loading',
      '14A': 'Loading',
      '14B': 'Loading',
      '15A': 'Loading',
      '15B': 'Loading'
    },
    drivers: [],
    vanSemiNumbers: [],
    lastSync: Date.now()
  }
}

export async function GET() {
  try {
    const data = await getBlobData()
    return NextResponse.json({
      ...data,
      lastSync: Date.now()
    })
  } catch (error) {
    console.error('Blob error:', error)
    return NextResponse.json({ 
      error: 'Storage error', 
      details: String(error) 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const updatedData = {
      printRoomTrucks: data.printRoomTrucks || [],
      preShiftTrucks: data.preShiftTrucks || [],
      movementTrucks: data.movementTrucks || {},
      doorStatuses: data.doorStatuses || {},
      drivers: data.drivers || [],
      vanSemiNumbers: data.vanSemiNumbers || [],
      lastSync: Date.now()
    }
    
    const blob = await put(BLOB_FILENAME, JSON.stringify(updatedData), {
      access: 'public',
      contentType: 'application/json'
    })
    
    return NextResponse.json({ 
      success: true, 
      lastSync: updatedData.lastSync,
      url: blob.url
    })
  } catch (error) {
    console.error('Blob error:', error)
    return NextResponse.json({ 
      error: 'Storage error', 
      details: String(error) 
    }, { status: 500 })
  }
}
