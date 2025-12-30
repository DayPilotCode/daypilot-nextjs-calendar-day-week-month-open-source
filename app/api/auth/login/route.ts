import { NextRequest, NextResponse } from 'next/server';
import { verifyLogin, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Debug: Check if env var is loaded
    const hashExists = !!process.env.AUTH_PASSWORD_HASH;
    const hashValue = process.env.AUTH_PASSWORD_HASH;
    console.log('Login attempt:', {
      hashExists,
      hashLength: hashValue?.length,
      hashPrefix: hashValue?.substring(0, 10),
      passwordLength: password.length,
    });

    // Verify password
    const isValid = await verifyLogin(password);

    if (!isValid) {
      console.log('Login verification failed');
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session
    await createSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

