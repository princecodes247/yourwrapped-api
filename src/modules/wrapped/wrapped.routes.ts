import * as wrappedController from './wrapped.controller'
import { createRouter } from '../../lib/router'
import { validateRequest } from '../../middleware/validation.middleware'
import { createWrappedSchema } from './wrapped.validation'
import { devOnlyMiddleware } from '../../middleware/dev-only.middleware'

const router = createRouter({
    name: "Wrapped"
})

router.post('/', validateRequest({ body: createWrappedSchema }), wrappedController.createWrapped)
router.get('/:slug', wrappedController.getWrapped)
router.get('/', devOnlyMiddleware, wrappedController.getAllWrapped)

export default router
