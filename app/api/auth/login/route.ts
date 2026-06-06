import { NextRequest, NextResponse } from "next/server";
import { BaseIdPServerClient } from "base-idp/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get("return_to") || "/";

  const config = {
    key: process.env.BASE_IDP_KEY || "",
    issuer: process.env.BASE_IDP_ISSUER || "",
  };

  const client = new BaseIdPServerClient(config);
  await client.resolveConfig();

  const authorizeUrl = client.authorizeUrl({
    state: returnTo,
    redirectUri: process.env.BASE_IDP_REDIRECT_URI,
  });

  return NextResponse.redirect(authorizeUrl);
}
