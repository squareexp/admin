import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:2222';

export function getApiUrl() {
  return API_URL;
}

export function isBackendDown(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed');
  }
  return false;
}

export function backendDownResponse() {
  return NextResponse.json(
    { error: 'Backend server is not running', code: 'BACKEND_DOWN' },
    { status: 503 },
  );
}

export function isBackendDownStatus(status: number) {
  return status === 503;
}
