import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${API_URL}/admin/notifications${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      headers: { Cookie: `jwt=${jwtToken}` },
      cache: 'no-store',
    });

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}
