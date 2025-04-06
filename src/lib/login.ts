"use client";

import { signIn } from "next-auth/react";

export const login = async (
  email: string,
  password: string,
  callbackUrl: string = "/"
): Promise<{ ok: boolean; error?: string }> => {
  const result = await signIn("credentials", {
    redirect: false,
    email,
    password,
    callbackUrl,
  });

  if (result?.ok) return { ok: true };
  return { ok: false, error: "Credenciales inválidas" };
};
