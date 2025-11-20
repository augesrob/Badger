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
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading data:', error)
  }
  return { trucks: [], drivers: [], settings: {} }
}

// Write data to file
function writeData(data: any) {
  ensureDataDir()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing data:', error)
    return false
  }
}

export async function GET() {
  const data = readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentData = readData()
    
    // Merge with existing data, preserving what's not being updated
    const newData = {
      trucks: body.trucks !== undefined ? body.trucks : currentData.trucks,
      drivers: body.drivers !== undefined ? body.drivers : currentData.drivers,
      settings: body.settings !== undefined ? body.settings : currentData.settings
    }
    
    const success = writeData(newData)
    
    if (success) {
      return NextResponse.json({ success: true, data: newData })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to write data' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target')
    
    const currentData = readData()
    
    switch (target) {
      case 'all':
        writeData({ trucks: [], drivers: [], settings: currentData.settings })
        break
      case 'printroom':
        writeData({ ...currentData, trucks: [] })
        break
      case 'staging':
        // Only delete trucks in staging doors (18-28), keep drivers
        const filteredTrucks = currentData.trucks.filter((t: any) => !t.stagingDoor)
        writeData({ ...currentData, trucks: filteredTrucks })
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid target' }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 })
  }
}
