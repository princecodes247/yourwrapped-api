import { Router } from 'express';
import * as AuthController from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';

import { loginValidator } from './auth.validation';
import { createRouter } from '../../lib/router';

const authRoutes: Router = createRouter({
  name: "Auth"
});

authRoutes.post(
  '/login',
  validateRequest({ body: loginValidator }),
  AuthController.loginHandler
);
authRoutes.post('/logout', AuthController.logoutHandler);

export default authRoutes;
