import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:2222";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value || cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const query = cursor ? `?cursor=${cursor}` : '';

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/threads/${threadId}/messages${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch thread messages" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value || cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;

  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/api/admin/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
