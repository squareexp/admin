export const OPS_AUTH_COOKIE = "jwt";
export const OPS_ADMIN_NAME_COOKIE = "admin_name";
export const OPS_OAUTH_STATE_COOKIE = "ops_oauth_state";
export const OPS_OAUTH_RETURN_TO_COOKIE = "ops_oauth_return_to";
export const OPS_OAUTH_VERIFIER_COOKIE = "ops_oauth_code_verifier";

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export function toAbsoluteReturnTo(returnTo: string, requestUrl: string) {
  try {
    return new URL(returnTo).toString();
  } catch {
    return new URL(returnTo, requestUrl).toString();
  }
}

