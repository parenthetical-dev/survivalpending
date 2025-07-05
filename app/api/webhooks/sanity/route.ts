import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Sanity webhook secret (set in Sanity dashboard and env)
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const body = await req.text()
    const signature = headers().get('sanity-webhook-signature')
    
    if (WEBHOOK_SECRET && signature) {
      const computedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex')
      
      if (computedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    const payload = JSON.parse(body)
    const { _type, storyId, status, moderatorNotes, tags } = payload
    
    // Only process story updates
    if (_type !== 'story' || !storyId) {
      return NextResponse.json({ message: 'Not a story update' }, { status: 200 })
    }
    
    // Find the story in our database
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    })
    
    if (!story) {
      console.error(`Story not found in database: ${storyId}`)
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }
    
    // Update story status in database
    const updateData: any = {}
    
    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      updateData.moderationStatus = status
      
      if (status === 'approved') {
        updateData.approvedAt = new Date()
      } else if (status === 'rejected') {
        updateData.rejectedAt = new Date()
      }
    }
    
    if (moderatorNotes !== undefined) {
      updateData.moderatorNotes = moderatorNotes
    }
    
    if (tags && Array.isArray(tags)) {
      updateData.tags = tags
    }
    
    // Update the story
    await prisma.story.update({
      where: { id: storyId },
      data: updateData
    })
    
    // Log moderation action if status changed
    if (status && status !== story.moderationStatus) {
      await prisma.moderationLog.create({
        data: {
          storyId,
          action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'REVIEW',
          moderatorId: payload.moderatorId || 'sanity-webhook',
          notes: moderatorNotes || `Status changed to ${status} via Sanity`
        }
      })
    }
    
    console.log(`Story ${storyId} updated from Sanity: ${status}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Story ${storyId} updated`,
      status: updateData.moderationStatus 
    })
    
  } catch (error) {
    console.error('Sanity webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}