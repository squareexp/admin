import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwtToken = cookieStore.get('jwt')?.value;

    console.log('=== Profile API Debug ===');
    console.log('JWT token exists?', !!jwtToken);
    if (jwtToken) {
      console.log('JWT token (first 20 chars):', jwtToken.substring(0, 20) + '...');
    }

    if (!jwtToken) {
      console.log('❌ No JWT token found in cookies');
      return NextResponse.json(
        { error: 'No token' },
        { status: 401 }
      );
    }

    console.log('Calling backend:', `${API_URL}/session/me`);
    const response = await fetch(`${API_URL}/session/me`, {
      headers: {
        Cookie: `jwt=${jwtToken}`,
      },
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Backend error:', errorText);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success! User:', data.username || data.email);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
