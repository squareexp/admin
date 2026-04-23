import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:2222";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string; messageId: string }> },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value || cookieStore.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId, messageId } = await params;

  try {
    const body = await req.json();
    const response = await fetch(
      `${BACKEND_URL}/api/admin/threads/${threadId}/messages/${messageId}/reactions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 });
  }
}
