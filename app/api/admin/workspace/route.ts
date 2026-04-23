import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/admin/workspace`, {
      headers: {
        Cookie: `jwt=${jwtToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to load admin workspace' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Workspace fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load admin workspace' },
      { status: 500 },
    );
  }
}
