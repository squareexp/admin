"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { API_URL } from "@/libs/config";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  username: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

const verifySchema = z.object({
  email: z.email(),
  code: z.string().length(6),
});

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
};

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
    
    // Get the token from response body (NestJS returns it in the response)
    // and set it as a cookie on the Next.js side
    if (responseData.token) {
      const cookieStore = await cookies();
      cookieStore.set('jwt', responseData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day
        sameSite: 'strict'
      });
    }
    
    // Store admin name in a non-httpOnly cookie so client JS can read it
    if (responseData.user?.name) {
      const cookieStore = await cookies();
      cookieStore.set('admin_name', responseData.user.name, {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day
        sameSite: 'strict'
      });
    }

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
    return { error: "Invalid registration data. Password must be at least 6 chars." };
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

  // For now, skip verification and go directly to login
  redirect("/session/access");
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
