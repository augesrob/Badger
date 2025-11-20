import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'trucks.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read data from file
function readData() {
  ensureDataDir()
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading data:', error)
  }
  return {
    trucks: [],
    drivers: [],
    truckDatabase: []
  }
}

// Write data to file
function writeData(data: any) {
  ensureDataDir()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Error writing data:', error)
    return false
  }
}

export async function GET() {
  try {
    const data = readData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentData = readData()
    
    // Merge new data with existing data
    const updatedData = {
      trucks: body.trucks !== undefined ? body.trucks : currentData.trucks,
      drivers: body.drivers !== undefined ? body.drivers : currentData.drivers,
      truckDatabase: body.truckDatabase !== undefined ? body.truckDatabase : currentData.truckDatabase
    }
    
    const success = writeData(updatedData)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to save data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    )
  }
}
