import { setupApp } from './app'
import env from './config'
import logger from './lib/logger'
import wrappedRoutes from './modules/wrapped/wrapped.routes'

async function init() {
  try {
    const app = setupApp(
      { path: '/wrapped', router: wrappedRoutes },
    )
    app.listen(env.PORT, () => {
      logger.info(`App Listening on Port ${env.PORT}`)
    })
  } catch (error) {
    console.log({ error })
    logger.error(`An error occurred: ${JSON.stringify(error)}`)
    process.exit(1)
  }
}

init()
