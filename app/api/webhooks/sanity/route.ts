import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';

// Sanity webhook secret (set in Sanity dashboard and env)
const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Get raw body as string for signature verification
    const body = await req.text();
    const signature = req.headers.get(SIGNATURE_HEADER_NAME);

    // Verify webhook signature if secret is configured
    if (WEBHOOK_SECRET) {
      if (!signature) {
        console.error('No signature header found');
        return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
      }

      // Use the @sanity/webhook package for verification
      const isValid = await isValidSignature(body, signature, WEBHOOK_SECRET);

      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Parse the validated body
    const payload = JSON.parse(body);
    const { _type, storyId, status, moderatorNotes } = payload;

    // Only process story updates
    if (_type !== 'story' || !storyId) {
      return NextResponse.json({ message: 'Not a story update' }, { status: 200 });
    }

    // Find the story in our database
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      // Sanitize log output to prevent log injection
      const sanitizedId = storyId.replace(/[\n\r]/g, '_');
      console.error(`Story not found in database: ${sanitizedId}`);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Update story status in database
    const updateData: any = {};

    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      updateData.status = status.toUpperCase();

      if (status === 'approved') {
        updateData.approvedAt = new Date();
      }
    }

    if (moderatorNotes !== undefined) {
      updateData.moderationNotes = moderatorNotes;
    }

    // Note: tags and categories are stored in Sanity only, not in Neon

    // Update the story
    await prisma.story.update({
      where: { id: storyId },
      data: updateData,
    });

    // Log moderation action if status changed
    if (status && status.toUpperCase() !== story.status) {
      // Only log if we have a valid moderator ID (admin)
      if (payload.moderatorId) {
        await prisma.moderationLog.create({
          data: {
            storyId,
            action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'NOTE',
            moderatorId: payload.moderatorId,
            reason: moderatorNotes || `Status changed to ${status} via Sanity`,
          },
        });
      }
    }

    const sanitizedStoryId = storyId.replace(/[\n\r]/g, '_');
    const sanitizedStatus = status?.replace(/[\n\r]/g, '_') || 'unknown';
    console.log(`Story ${sanitizedStoryId} updated from Sanity: ${sanitizedStatus}`);

    return NextResponse.json({
      success: true,
      message: `Story ${storyId} updated`,
      status: updateData.status,
    });

  } catch (error) {
    console.error('Sanity webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}