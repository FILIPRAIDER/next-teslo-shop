import { auth } from "@/auth.config";
import { titleFont } from "@/config/fonts";
import { redirect } from "next/navigation";
import { RegisterForm } from "./ui/RegisterForm";

export default async function NewAccountPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }
  return (
    <main className="flex flex-col min-h-screen pt-32 sm:pt-52">
      <h1 className={`${titleFont.className} text-4xl mb-5`}>Nueva cuenta</h1>
      <RegisterForm />
    </main>
  );
}
