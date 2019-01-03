import * as Koa from 'koa'
import * as websockify from 'koa-websocket'

import { config } from './config'
import { logger } from './logging'
import routes from './routes'

const app = websockify(new Koa())

app.use(logger)
app.use(routes.http)
app.ws.use(routes.ws)

app.listen(config.port)

console.info(`Server running on port ${config.port}`)
