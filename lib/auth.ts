import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function isAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail ? email.toLowerCase() === adminEmail.toLowerCase() : false;
}
