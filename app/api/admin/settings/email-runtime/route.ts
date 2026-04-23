import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get('jwt')?.value;
}

export async function GET() {
  try {
    const jwtToken = await getAdminToken();

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/admin/settings/email-runtime`, {
      headers: {
        Cookie: `jwt=${jwtToken}`,
      },
      cache: 'no-store',
    });

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Email runtime settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load email runtime settings' },
      { status: 500 },
    );
  }
}
