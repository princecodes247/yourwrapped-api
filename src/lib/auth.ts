import type { Request, Response } from 'express';

export const extractTokenFromHeader = (
  request: Request
): string | undefined => {
  const [type, token] = request.headers?.authorization?.split(' ') || [];
  return type === 'Bearer' ? token : undefined;
};

export const extractFromCookie = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies['session'];
  }
  return token;
};

const isLocal = process.env.NODE_ENV === "local";

export const setSessionCookie = (res: Response, token: string) => {
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !isLocal,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: ".lvh.me",
    domain: !isLocal ? ".yourwrapped.com" : "localhost",
    path: "/",
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie("session", {
    domain: !isLocal ? ".yourwrapped.com" : "localhost",
    path: "/",
  });
};
