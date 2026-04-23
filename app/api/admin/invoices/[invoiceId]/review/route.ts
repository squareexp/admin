import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { invoiceId } = await params;
    const body = await request.json();

    const response = await fetch(`${API_URL}/admin/invoices/${invoiceId}/review`, {
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
    console.error('Invoice review error:', error);
    return NextResponse.json(
      { error: 'Failed to review invoice' },
      { status: 500 },
    );
  }
}
