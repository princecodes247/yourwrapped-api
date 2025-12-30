import { z } from 'zod';

export const loginValidator = z.object({
  username: z.string({ error: 'username is required' }),
  password: z
    .string({ error: 'Password is required' })
    .min(4, 'Password too short - should be 6 chars minimum'),
});

export type ILogin = z.infer<typeof loginValidator>;
