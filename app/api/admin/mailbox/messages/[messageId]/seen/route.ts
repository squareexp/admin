import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get('jwt')?.value;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const jwtToken = await getAdminToken();

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { messageId } = await params;
    const requestBody = await request.text();

    const response = await fetch(
      `${API_URL}/admin/mailbox/messages/${messageId}/seen`,
      {
        method: 'POST',
        headers: {
          Cookie: `jwt=${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: requestBody || '{}',
        cache: 'no-store',
      },
    );

    const payload = await response.text();
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Mailbox mark seen error:', error);
    return NextResponse.json(
      { error: 'Failed to update mailbox message' },
      { status: 500 },
    );
  }
}
