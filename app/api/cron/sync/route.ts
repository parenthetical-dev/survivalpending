import { NextRequest, NextResponse } from 'next/server'
import { devSyncService, prodSyncService } from '@/lib/sync-service'

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret (Vercel Cron Jobs)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development'
    const syncService = environment === 'production' ? prodSyncService : devSyncService
    
    console.log(`[CRON] Starting automatic sync for ${environment}`)
    
    // Perform bidirectional sync
    const result = await syncService.syncBidirectional({
      includeRejected: false
    })
    
    console.log(`[CRON] Sync completed:`, result)
    
    return NextResponse.json({
      success: true,
      environment,
      timestamp: new Date().toISOString(),
      result
    })
    
  } catch (error) {
    console.error('[CRON] Sync failed:', error)
    return NextResponse.json(
      { error: 'Cron sync failed', details: error.message },
      { status: 500 }
    )
  }
}