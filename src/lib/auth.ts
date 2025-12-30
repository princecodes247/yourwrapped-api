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

const isProduction = process.env.NODE_ENV === "production";

export const setOAuthCookies = (
  res: Response,
  input: { state: string; verifier: string }
) => {
  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: ".lvh.me",
    domain: isProduction ? ".flagcontrol.com" : "localhost",
    path: "/",
  } as const;

  res.cookie("oauth_state", input.state, options);
  res.cookie("oauth_verifier", input.verifier, options);
};

export const setSessionCookie = (res: Response, token: string) => {
  res.cookie("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: ".lvh.me",
    domain: isProduction ? ".flagcontrol.com" : "localhost",
    path: "/",
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie("session", {
    domain: isProduction ? ".flagcontrol.com" : "localhost",
    path: "/",
  });
};
