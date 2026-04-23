import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    if (!jwtToken) {
      return NextResponse.json({ error: 'No token' }, { status: 401 });
    }

    const { invoiceId } = await params;
    const response = await fetch(`${API_URL}/admin/invoices/${invoiceId}/restore`, {
      method: 'POST',
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
    console.error('Invoice restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore invoice' },
      { status: 500 },
    );
  }
}
