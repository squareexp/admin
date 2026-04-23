import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get('jwt')?.value;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const jwtToken = await getAdminToken();

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const response = await fetch(`${API_URL}/admin/team/${userId}/request-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwt=${jwtToken}`,
      },
      body: JSON.stringify(body),
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
    console.error('Team progress request error:', error);
    return NextResponse.json(
      { error: 'Failed to request team progress' },
      { status: 500 },
    );
  }
}

