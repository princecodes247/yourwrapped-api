import type { NextFunction, Request, Response } from 'express';
import {
  login,
} from './auth.service';
import { clearSessionCookie, setSessionCookie } from '../../lib/auth';

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const { accessToken, ...user } = await login({
      data: req.body,
    });

    setSessionCookie(res, accessToken);

    res.json({
      // accessToken, 
      ...user
    });
  } catch (e) {
    console.error(e);
    return next(e);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    clearSessionCookie(res);
    res.json({ message: "Logged out successfully" });
  } catch (e) {
    return next(e);
  }
}