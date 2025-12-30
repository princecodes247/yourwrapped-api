import { collections } from '../../db'
import { createTokens } from '../../lib/utils';
import type { Response } from 'express';

import logger from '../../lib/logger';
import env from '../../config';
import { BadRequestError, NotFoundError } from '../../lib/errors/http-errors';


export const login = async ({
  data,
}: {
  data: {
    username: string;
    password: string;
  };
}) => {


  if (data.username !== env.ADMIN_USERNAME || data.password !== env.ADMIN_PASSWORD) throw new BadRequestError('Username or Password Incorrect');

  const tokens = createTokens({ id: data.username })

  return {
    username: data.username,
    ...tokens
  };
};