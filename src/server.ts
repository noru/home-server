import Koa from 'koa'

import { config } from './config'
import { logger } from './logging'
import { routes } from './routes'

const app = new Koa()

app.use(logger)
app.use(routes)

app.listen(config.port)

console.info(`Server running on port ${config.port}`)
