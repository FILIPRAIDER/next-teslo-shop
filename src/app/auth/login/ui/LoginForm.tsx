"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IoWarningOutline } from "react-icons/io5";
import { login } from "@/lib/login";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage("");

    const result = await login(email, password, callbackUrl);

    if (result.ok) {
      router.push(callbackUrl);
    } else {
      setErrorMessage(result.error || "Error al iniciar sesión");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <label htmlFor="email">Correo electrónico</label>
      <input
        name="email"
        className="px-5 py-2 border border-gray-300 bg-gray-200 rounded mb-5"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Contraseña</label>
      <input
        name="password"
        className="px-5 py-2 border border-gray-300 bg-gray-200 rounded mb-5"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <div className="flex mb-2">
            <IoWarningOutline className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>

      <button
        className={clsx({
          "btn-primary": !isPending,
          "btn-disabled": isPending,
        })}
        disabled={isPending}
      >
        Ingresar
      </button>

      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link href="/auth/new-account" className="btn-secondary text-center">
        Crear una nueva cuenta
      </Link>
    </form>
  );
};
