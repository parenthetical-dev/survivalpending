import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { trackStartTrial } from '@/lib/meta-capi';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Verify the token
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { ageRange, state, genderIdentity, racialIdentity, urbanicity } = body;

    // Validate required fields
    if (!ageRange || !state) {
      return NextResponse.json(
        { error: 'Age range and state are required' },
        { status: 400 },
      );
    }

    // Check if demographics already exist
    const existingDemographics = await prisma.userDemographics.findUnique({
      where: { userId: payload.userId },
    });

    if (existingDemographics) {
      // Update existing demographics
      await prisma.userDemographics.update({
        where: { userId: payload.userId },
        data: {
          ageRange,
          state,
          genderIdentity: genderIdentity || null,
          racialIdentity: racialIdentity || null,
          urbanicity: urbanicity || null,
        },
      });
    } else {
      // Create new demographics
      await prisma.userDemographics.create({
        data: {
          userId: payload.userId,
          ageRange,
          state,
          genderIdentity: genderIdentity || null,
          racialIdentity: racialIdentity || null,
          urbanicity: urbanicity || null,
        },
      });
    }

    // Mark onboarding as complete
    try {
      await prisma.user.update({
        where: { id: payload.userId },
        data: { hasCompletedOnboarding: true },
      });
    } catch (updateError) {
      console.error('Failed to update onboarding status:', updateError);
      // Continue anyway - demographics are saved
    }

    // Track onboarding completion with Meta CAPI
    await trackStartTrial(request, payload.userId, {
      ageRange,
      state,
      urbanicity,
    });

    return NextResponse.json({
      success: true,
      message: 'Demographics saved successfully',
    });
  } catch (error) {
    console.error('Demographics save error:', error);

    // More detailed error response for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to save demographics',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}