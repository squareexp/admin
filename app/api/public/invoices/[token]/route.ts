import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const response = await fetch(`${API_URL}/public/invoices/${token}/status`, {
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
    console.error('Public invoice status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice status' },
      { status: 500 },
    );
  }
}

