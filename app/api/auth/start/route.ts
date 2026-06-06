import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getOpsAuthClient, getOpsLoginScopes, getOpsRedirectUri, getStartReturnTo } from "@/lib/auth/base-idp";
import { persistState } from "@/lib/auth/state-store";
import { sanitizeReturnTo } from "@/lib/auth/shared";

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function computeCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

async function buildAuthorizeRedirect(request: NextRequest, returnTo: string) {
  const state = randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = computeCodeChallenge(codeVerifier);

  const client = getOpsAuthClient();
  await client.resolveConfig();

  const redirectUri = getOpsRedirectUri(request);
  const scope = getOpsLoginScopes();

  await persistState(state, returnTo, codeVerifier);

  const authorizeUrl = client.authorizeUrl({
    responseType: "code",
    redirectUri,
    scopes: scope,
    state,
    codeChallenge,
    codeChallengeMethod: "S256",
    additionalParameters: {
      prompt: "login",
    },
  });

  const response = NextResponse.redirect(authorizeUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const returnTo = getStartReturnTo(request.nextUrl.searchParams);
  const existingToken = request.cookies.get("jwt")?.value;

  if (existingToken) {
    return NextResponse.redirect(new URL(returnTo, request.url));
  }

  return buildAuthorizeRedirect(request, returnTo);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { return_to?: string };
  return buildAuthorizeRedirect(request, sanitizeReturnTo(body.return_to));
}
