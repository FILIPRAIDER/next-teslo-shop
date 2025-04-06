import { titleFont } from "@/config/fonts";
import { LoginForm } from "./ui/LoginForm";
import { auth } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }
  return (
    <main className="flex flex-col min-h-screen pt-32 sm:pt-52">
      <h1 className={`${titleFont.className} text-4xl mb-5`}>Ingresar</h1>
      <LoginForm />
    </main>
  );
}
