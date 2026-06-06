import { BaseIdPClient, baseIdpConfigFromNodeEnv } from "base-idp";
import type { NextRequest } from "next/server";
import { getApiUrl } from "@/lib/proxy-helpers";
import { sanitizeReturnTo } from "./shared";

const DEFAULT_SCOPES = "openid profile";

export function getOpsBaseIdpConfig() {
  return baseIdpConfigFromNodeEnv(process.env, {
    key:
      process.env.BASE_IDP_KEY ||
      process.env.NEXT_PUBLIC_BASE_IDP_KEY ||
      "base_I25g03zAPoI7fB-J1bivIQ",
    issuer:
      process.env.BASE_IDP_ISSUER ||
      process.env.NEXT_PUBLIC_BASE_IDP_ISSUER ||
      "http://localhost:8080",
    secret: process.env.BASE_IDP_CLIENT_SECRET || process.env.BASE_IDP_SECRET,
  });
}

export function getOpsLoginScopes() {
  return (
    process.env.BASE_IDP_LOGIN_SCOPES ||
    process.env.NEXT_PUBLIC_BASE_IDP_LOGIN_SCOPES ||
    DEFAULT_SCOPES
  );
}

export function getOpsRedirectUri(request: NextRequest) {
  return (
    process.env.BASE_IDP_REDIRECT_URI ||
    process.env.NEXT_PUBLIC_BASE_IDP_REDIRECT_URI ||
    new URL("/api/auth/callback", request.url).toString()
  );
}

export function getOpsBackendCallbackUrl() {
  return new URL("/auth/square/callback", getApiUrl()).toString();
}

export function getOpsAuthClient() {
  return new BaseIdPClient(getOpsBaseIdpConfig());
}

export function getStartReturnTo(searchParams: URLSearchParams) {
  return sanitizeReturnTo(searchParams.get("return_to"));
}

