"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  username: z.string().min(2),
  email: z.email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message: "Password must include uppercase, lowercase, and a number",
    }),
});

const verifySchema = z.object({
  email: z.email(),
  code: z.string().length(6),
});

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
  requires2FA?: boolean;
  userId?: string;
  qrCode?: string;
  secret?: string;
  twoFactorEnabled?: boolean;
};

async function setSessionCookies(responseData: {
  token?: string | null;
  user?: { name?: string | null };
}) {
  if (responseData.token) {
    const cookieStore = await cookies();
    cookieStore.set('jwt', responseData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 24 * 60 * 60,
      sameSite: 'strict',
    });
  }

  if (responseData.user?.name) {
    const cookieStore = await cookies();
    cookieStore.set('admin_name', responseData.user.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 24 * 60 * 60,
      sameSite: 'strict',
    });
  }
}

async function getAuthorizedJsonHeaders() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value;

  if (!jwt) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
  };
}

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData);
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid email or password format" };
  }

  try {
    const res = await fetch(`${API_URL}/session/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "Login failed" };
    }

    const responseData = await res.json();

    if (responseData.requires2FA) {
      return {
        requires2FA: true,
        userId: responseData.user?.id,
        message: "2FA required"
      };
    }
    
    // Get the token from response body (NestJS returns it in the response)
    // and set it as a cookie on the Next.js side
    await setSessionCookies(responseData);

    // Also check Set-Cookie header as fallback
    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader && !responseData.token) {
      const cookieStore = await cookies();
      const parts = setCookieHeader.split(';')[0].split('=');
      if (parts.length === 2 && parts[0].trim() === 'jwt') {
        cookieStore.set('jwt', parts[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 24 * 60 * 60,
          sameSite: 'strict'
        });
      }
    }
  } catch (err) {
    console.error(err);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/");
}

export async function registerAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData);
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid registration data. Use a stronger password." };
  }

  try {
    // Map 'username' to 'name' for the backend
    const payload = {
      name: result.data.username,
      email: result.data.email,
      password: result.data.password,
    };

    const res = await fetch(`${API_URL}/session/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "Registration failed" };
    }
  } catch (err) {
    console.error(err);
    return { error: "Registration failed. Please try again." };
  }

  redirect(`/session/verify?email=${encodeURIComponent(result.data.email)}`);
}

export async function verifyAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData);
  const result = verifySchema.safeParse(data);

  if (!result.success) {
    return { error: "Invalid verification code" };
  }

  try {
    const res = await fetch(`${API_URL}/session/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "Verification failed" };
    }
  } catch (err) {
    console.error(err);
    return { error: "Verification failed. Please try again." };
  }

  redirect("/session/access");
}

export async function setup2FAAction(prevState: AuthState): Promise<AuthState> {
  try {
    const headers = await getAuthorizedJsonHeaders();
    const res = await fetch(`${API_URL}/session/2fa/setup`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "2FA setup failed" };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || "2FA setup started",
      qrCode: data.qrCode,
      secret: data.secret,
      twoFactorEnabled: false,
    };
  } catch (err) {
    console.error(err);
    return { error: "2FA setup failed" };
  }
}

export async function confirm2FASetupAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const code = String(formData.get("code") || "");

  if (code.length !== 6) {
    return { error: "Enter a valid 6-digit authenticator code" };
  }

  try {
    const headers = await getAuthorizedJsonHeaders();
    const res = await fetch(`${API_URL}/session/2fa/confirm`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || "2FA confirmation failed" };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || "2FA enabled successfully",
      twoFactorEnabled: true,
    };
  } catch (err) {
    console.error(err);
    return { error: "2FA confirmation failed" };
  }
}

export async function disable2FAAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const code = String(formData.get("code") || "");

  if (code.length !== 6) {
    return { error: "Enter a valid 6-digit authenticator code" };
  }

  try {
    const headers = await getAuthorizedJsonHeaders();
    const res = await fetch(`${API_URL}/session/2fa/disable`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || "2FA disable failed" };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || "2FA disabled",
      twoFactorEnabled: false,
    };
  } catch (err) {
    console.error(err);
    return { error: "2FA disable failed" };
  }
}

export async function verify2FAAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData);
  const code = data.code as string;
  const userId = data.userId as string;

  if (!code || code.length !== 6) {
    return { error: "Invalid 2FA code" };
  }

  try {
    const res = await fetch(`${API_URL}/session/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "2FA verification failed" };
    }

    const responseData = await res.json();

    await setSessionCookies(responseData);

    redirect("/");
  } catch (err) {
    console.error(err);
    return { error: "2FA verification failed" };
  }

  return {};
}

export async function passwordResetRequestAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    const res = await fetch(`${API_URL}/session/password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "Password reset request failed" };
    }

    const responseData = await res.json();
    return { success: true, message: responseData.message };
  } catch (err) {
    console.error(err);
    return { error: "Password reset request failed" };
  }
}

export async function passwordResetConfirmAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get("token") || "");
  const newPassword = String(formData.get("newPassword") || "");

  if (!token) {
    return { error: "Reset token is missing." };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  try {
    const res = await fetch(`${API_URL}/session/password-reset/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || "Password reset failed" };
    }

    return {
      success: true,
      message: "Password updated. You can now sign in.",
    };
  } catch (err) {
    console.error(err);
    return { error: "Password reset failed. Please try again." };
  }
}
