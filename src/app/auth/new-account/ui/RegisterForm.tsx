"use client";

import { registerUser } from "@/actions";
import { login } from "@/lib/login";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type FormInputs = {
  name: string;
  email: string;
  password: string;
};

export const RegisterForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setErrorMessage("");
    const { name, email, password } = data;

    // Server action
    const resp = await registerUser(name, email, password);

    if (!resp.ok) {
      setErrorMessage(resp.message);
      return;
    }

    const loginResult = await login(email.toLowerCase(), password);

    if (loginResult.ok) {
      router.replace("/");
    } else {
      setErrorMessage("Error al iniciar sesión automáticamente");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      {/* {errors.name?.type === "required" && (
        <span className="text-red-500">* El nombre es obligatorio</span>
      )} */}
      <label htmlFor="name">Nombre completo</label>
      <input
        className={clsx(
          "px-5 py-2 border border-gray-300 bg-gray-200 rounded mb-5",
          {
            "border-red-500": errors.name,
          }
        )}
        type="text"
        autoFocus
        {...register("name", { required: true })}
      />

      <label htmlFor="email">Correo electrónico</label>
      <input
        className={clsx(
          "px-5 py-2 border border-gray-300 bg-gray-200 rounded mb-5",
          {
            "border-red-500": errors.email,
          }
        )}
        type="email"
        {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
      />
      <label htmlFor="email">Contraseña</label>
      <input
        className={clsx(
          "px-5 py-2 border border-gray-300 bg-gray-200 rounded mb-5",
          {
            "border-red-500": errors.password,
          }
        )}
        type="password"
        {...register("password", { required: true, minLength: 6 })}
      />

      <span className="text-red-500">{errorMessage}</span>

      <button className="btn-primary">Crear cuenta</button>

      {/* divisor l ine */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link href="/auth/login" className="btn-secondary text-center">
        Ingresar
      </Link>
    </form>
  );
};
