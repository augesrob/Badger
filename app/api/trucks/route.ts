import { put, head } from '@vercel/blob'
import { NextResponse } from 'next/server'

const BLOB_FILENAME = 'trucks-data.json'

export async function GET() {
  try {
    // Try to fetch existing data
    const response = await fetch(`${process.env.BLOB_READ_WRITE_TOKEN}/${BLOB_FILENAME}`)
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      // Return empty data if file doesn't exist
      return NextResponse.json({ trucks: [], drivers: [], stagedTrucks: [] })
    }
  } catch (error) {
    console.error('Error reading from blob:', error)
    return NextResponse.json({ trucks: [], drivers: [], stagedTrucks: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Upload to Vercel Blob
    const blob = await put(BLOB_FILENAME, JSON.stringify(body), {
      access: 'public',
      contentType: 'application/json',
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error('Error writing to blob:', error)
    return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 })
  }
}
