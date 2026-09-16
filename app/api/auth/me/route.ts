import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false, user: null, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
