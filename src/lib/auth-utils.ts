import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function getUserId(request?: NextRequest): Promise<string | null> {
  if (request) {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (token?.id) return token.id as string;
  }
  return null;
}

export async function requireUserId(request?: NextRequest): Promise<string> {
  if (request) {
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    if (token?.id) return token.id as string;
  }
  throw new Error("Unauthorized");
}
