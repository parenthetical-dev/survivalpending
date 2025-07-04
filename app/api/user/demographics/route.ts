import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ageRange, state, genderIdentity, racialIdentity, urbanicity } = body;

    // Validate required fields
    if (!ageRange || !state) {
      return NextResponse.json(
        { error: 'Age range and state are required' },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: 'Demographics saved successfully',
    });
  } catch (error) {
    console.error('Demographics save error:', error);
    return NextResponse.json(
      { error: 'Failed to save demographics' },
      { status: 500 }
    );
  }
}