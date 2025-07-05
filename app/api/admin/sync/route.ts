import { NextRequest, NextResponse } from 'next/server'
import { devSyncService, prodSyncService } from '@/lib/sync-service'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify JWT and check if user is admin
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Parse request body
    const body = await req.json()
    const { 
      environment = 'development', 
      direction = 'bidirectional',
      includeRejected = false 
    } = body
    
    // Select sync service based on environment
    const syncService = environment === 'production' ? prodSyncService : devSyncService
    
    console.log(`Admin sync requested: ${environment} - ${direction}`)
    
    let result
    
    switch (direction) {
      case 'neon-to-sanity':
        result = await syncService.syncNeonToSanity({ includeRejected })
        break
        
      case 'sanity-to-neon':
        result = await syncService.syncSanityToNeon()
        break
        
      case 'bidirectional':
        result = await syncService.syncBidirectional({ includeRejected })
        break
        
      default:
        return NextResponse.json({ error: 'Invalid sync direction' }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      environment,
      direction,
      result
    })
    
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Get sync status for both environments
    const [devStatus, prodStatus] = await Promise.all([
      devSyncService.getSyncStatus(),
      prodSyncService.getSyncStatus()
    ])
    
    return NextResponse.json({
      development: devStatus,
      production: prodStatus
    })
    
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}