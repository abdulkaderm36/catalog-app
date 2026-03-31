import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ALG = "HS256";
const EXPIRY = "7d";

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret);
  if (!payload.sub) throw new Error("Missing sub");
  return payload.sub;
}
