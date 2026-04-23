import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { invoiceId } = await params;
    const requestBody = await request.text();
    const response = await fetch(`${API_URL}/admin/invoices/${invoiceId}/resend`, {
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
    console.error('Invoice resend error:', error);
    return NextResponse.json(
      { error: 'Failed to resend invoice' },
      { status: 500 },
    );
  }
}
