import { NextResponse } from 'next/server'

// In-memory storage (will be replaced with proper database later)
let dataStore = {
  trucks: [],
  drivers: [],
  settings: {
    autoResetEnabled: false,
    autoResetTime: '00:00',
    autoResetPrintRoom: false,
    autoResetStaging: false
  }
}

export async function GET() {
  return NextResponse.json(dataStore)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Update only the fields that are provided
    if (body.trucks !== undefined) {
      dataStore.trucks = body.trucks
    }
    if (body.drivers !== undefined) {
      dataStore.drivers = body.drivers
    }
    if (body.settings !== undefined) {
      dataStore.settings = { ...dataStore.settings, ...body.settings }
    }
    
    return NextResponse.json({ success: true, data: dataStore })
  } catch (error) {
    console.error('Error in POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid request: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const target = searchParams.get('target')
    
    switch (target) {
      case 'all':
        // Delete everything except settings
        dataStore.trucks = []
        dataStore.drivers = []
        break
      case 'printroom':
        // Only delete trucks that are not in staging
        dataStore.trucks = dataStore.trucks.filter((t: any) => t.stagingDoor)
        break
      case 'staging':
        // Only delete trucks in staging doors (18-28), keep drivers and print room trucks
        dataStore.trucks = dataStore.trucks.filter((t: any) => !t.stagingDoor)
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
