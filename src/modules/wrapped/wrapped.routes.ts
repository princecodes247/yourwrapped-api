import * as wrappedController from './wrapped.controller'
import { createRouter } from '../../lib/router'
import { validateRequest } from '../../middleware/validation.middleware'
import { createWrappedSchema, getWrapsSchema } from './wrapped.validation'
import { devOnlyMiddleware } from '../../middleware/dev-only.middleware'
import { authMiddleware } from '../../middleware/auth.middleware';

import { upload } from '../../lib/upload'

const router = createRouter({
    name: "Wrapped"
})

router.post('/upload', upload.single('image'), wrappedController.uploadImage)
router.get('/image', wrappedController.getImage)
router.get('/stats', authMiddleware, wrappedController.getWrappedStats)
router.get('/list', authMiddleware, devOnlyMiddleware, validateRequest({ query: getWrapsSchema }), wrappedController.getWraps)
router.post('/', validateRequest({ body: createWrappedSchema }), wrappedController.createWrapped)
router.get('/:slug', wrappedController.getWrapped)

export default router
