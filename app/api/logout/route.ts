import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/session/logout`, {
      method: 'POST',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    // Clear the cookie
    const cookieStore = await cookies();
    cookieStore.delete('jwt');

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
