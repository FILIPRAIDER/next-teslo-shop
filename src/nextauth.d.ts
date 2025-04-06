import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      emailVerified?: boolean;
      role: string;
      image?: string;
    } & DefaultSession["user"];
  }
}
