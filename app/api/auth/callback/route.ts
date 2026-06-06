import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";
import { consumeState } from "@/lib/auth/state-store";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "/";

  if (!code) {
    return NextResponse.json({ error: "Authorization code missing" }, { status: 400 });
  }

  try {
    const stateEntry = await consumeState(searchParams.get("state"));
    if (!stateEntry?.codeVerifier) {
      return NextResponse.json(
        { error: "PKCE verifier missing from the OAuth session" },
        { status: 400 },
      );
    }
    const redirectUri = process.env.BASE_IDP_REDIRECT_URI;
    console.info("[ops.auth.callback] exchanging code", {
      hasCodeVerifier: true,
      hasState: Boolean(searchParams.get("state")),
      returnTo: stateEntry.returnTo,
    });
    const response = await fetch(`${API_URL}/auth/square/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        state,
        redirectUri,
        codeVerifier: stateEntry.codeVerifier,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errBody.message || "Failed to exchange authorization code with gateway" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const cookieStore = await cookies();

    // Set JWT cookie (same configuration as standard login)
    cookieStore.set("jwt", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
      sameSite: "lax",
    });

    if (data.idp?.accessToken) {
      cookieStore.set("base_idp_access_token", data.idp.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: Math.max(60, Number(data.idp.expiresIn) || 900),
        sameSite: "lax",
      });
    }

    if (data.idp?.refreshToken) {
      const refreshExpiresAt = data.idp.refreshTokenExpiresAt
        ? Date.parse(data.idp.refreshTokenExpiresAt)
        : Number.NaN;
      const refreshMaxAge = Number.isFinite(refreshExpiresAt)
        ? Math.max(60, Math.floor((refreshExpiresAt - Date.now()) / 1000))
        : 14 * 24 * 60 * 60;

      cookieStore.set("base_idp_refresh_token", data.idp.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: refreshMaxAge,
        sameSite: "lax",
      });
    }

    // Set admin name cookie for the client dashboard UI
    if (data.user?.name) {
      cookieStore.set("admin_name", data.user.name, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 24 * 60 * 60,
        sameSite: "lax",
      });
    }

    const returnTo = stateEntry?.returnTo || "/";
    return NextResponse.redirect(new URL(returnTo, request.nextUrl.origin));
  } catch (error) {
    console.error("Callback route error:", error);
    return NextResponse.json({ error: "Internal Server Error during callback handling" }, { status: 500 });
  }
}
