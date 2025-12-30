// import { fromNodeHeaders } from 'better-auth/node'
import type { NextFunction, Request, Response } from 'express'
import { extractFromCookie, extractTokenFromHeader } from '../lib/auth'
import env from '../config'
import jwt from 'jsonwebtoken'
import { collections } from '../db'
import { toObjectId } from 'monarch-orm'
import { UnauthorizedError } from '../lib/errors/http-errors'

// type AuthData = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>

// export interface AuthenticatedRequest extends Request {
//   session?: AuthData['session']
//   user?: AuthData['user']
// }
// export interface AuthenticatedRequest extends Request {
//   token?: string;
//   user?: UserInput
// }

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractFromCookie(req);

  if (!token) throw new UnauthorizedError('Unauthorized access: User is not authenticated');

  const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; };


  if (!decoded.id) throw new UnauthorizedError('Unauthorized access: User is not authenticated');

  if (env.ADMIN_USERNAME === decoded.id) throw new UnauthorizedError('Unauthorized access: User is not authenticated');

  // req.token = decoded;

  next();
};