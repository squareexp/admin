/**
 * OPS OAuth state store using signed HttpOnly cookies.
 *
 * Stores OAuth state, return_to path, and optional PKCE code_verifier
 * in SameSite=Lax HttpOnly cookies with an HMAC signature for integrity.
 * Cookies expire after 15 minutes to match the OAuth authorization window.
 */

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  OPS_OAUTH_RETURN_TO_COOKIE,
  OPS_OAUTH_STATE_COOKIE,
  OPS_OAUTH_VERIFIER_COOKIE,
} from "./shared";

const STATE_TTL_SECONDS = 15 * 60; // 15 minutes

function oauthStateSecret() {
  return (
    process.env.OPS_OAUTH_STATE_SECRET ||
    process.env.BASE_IDP_CLIENT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "ops-local-oauth-state-secret")
  );
}

function sign(value: string): string {
  const secret = oauthStateSecret();
  if (!secret) {
    throw new Error("OPS_OAUTH_STATE_SECRET is required for OAuth state cookies");
  }
  const hmac = createHmac("sha256", secret);
  hmac.update(value);
  return `${value}.${hmac.digest("base64url")}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;

  const value = signed.slice(0, idx);
  const expected = sign(value);
  if (expected.length !== signed.length) return null;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signed);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return value;
  } catch {
    return null;
  }
}

export async function persistState(state: string, returnTo: string, codeVerifier?: string) {
  const cookieStore = await cookies();
  const signedState = sign(state);

  cookieStore.set(OPS_OAUTH_STATE_COOKIE, signedState, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_TTL_SECONDS,
    path: "/api/auth/callback",
  });

  cookieStore.set(OPS_OAUTH_RETURN_TO_COOKIE, sign(returnTo), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_TTL_SECONDS,
    path: "/api/auth/callback",
  });

  if (codeVerifier) {
    cookieStore.set(OPS_OAUTH_VERIFIER_COOKIE, sign(codeVerifier), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: STATE_TTL_SECONDS,
      path: "/api/auth/callback",
    });
  }
}

export interface StateEntry {
  returnTo: string;
  codeVerifier?: string;
}

export async function consumeState(receivedState: string | null): Promise<StateEntry | null> {
  const cookieStore = await cookies();
  const signedState = cookieStore.get(OPS_OAUTH_STATE_COOKIE)?.value;
  const signedReturnTo = cookieStore.get(OPS_OAUTH_RETURN_TO_COOKIE)?.value;
  const signedVerifier = cookieStore.get(OPS_OAUTH_VERIFIER_COOKIE)?.value;

  cookieStore.delete(OPS_OAUTH_STATE_COOKIE);
  cookieStore.delete(OPS_OAUTH_RETURN_TO_COOKIE);
  cookieStore.delete(OPS_OAUTH_VERIFIER_COOKIE);

  if (!signedState || !signedReturnTo || !receivedState) return null;

  const storedState = verify(signedState);
  if (!storedState || storedState !== receivedState) return null;

  const storedReturnTo = verify(signedReturnTo);
  if (!storedReturnTo) return null;

  const entry: StateEntry = {
    returnTo: storedReturnTo,
  };

  if (signedVerifier) {
    const verifier = verify(signedVerifier);
    if (verifier) {
      entry.codeVerifier = verifier;
    }
  }

  return entry;
}

