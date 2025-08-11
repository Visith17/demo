"use server";
import apiService from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
type LoginPayload = {
  emailOrPhone: string;
  password: string;
};

// TODO: implement login with email
export const login = async (payload: LoginPayload) => {
  return await apiService.post('/api/auth/signin', payload)
};

// TODO: implement login telegram
export const loginWithTelegram = async (payload: any) => {
  return await apiService.post("/api/auth/telegram-signin", payload)
};

// TODO: implement login with google
export const loginWithGoogle = async (credential: string) =>{
  const payload = { token: credential }
  return await apiService.post("/api/auth/g-sign-in", {token:credential})
}

// TODO: implement update
export const update_password = async (credentials: any) =>{
  return await apiService.put("/api/auth/update-pass", { password: credentials.password })
}

export const reset_password = async (email: string) => {
  return await apiService.post("/api/auth/request-reset-password", {emailOrPhone: email});
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.set('accessToken', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  cookieStore.set('favoriteClubs', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  cookieStore.set('favoriteSports', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  redirect('/login?logout=1')
}