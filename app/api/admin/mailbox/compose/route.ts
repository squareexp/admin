import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL || "https://rms.srv.squareexp.com";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get('jwt')?.value;
}

export async function POST(request: Request) {
  try {
    const jwtToken = await getAdminToken();

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const requestBody = await request.text();
    const response = await fetch(`${API_URL}/admin/mailbox/compose`, {
      method: 'POST',
      headers: {
        Cookie: `jwt=${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: requestBody || '{}',
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
    console.error('Mailbox compose error:', error);
    return NextResponse.json(
      { error: 'Failed to send mailbox email' },
      { status: 500 },
    );
  }
}
