import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { error: 'No token' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/session/me`, {
      headers: {
        Cookie: `jwt=${jwtToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const user = data.user ?? data;
    return NextResponse.json({
      id: user.id,
      username: user.name || user.username,
      email: user.email,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
