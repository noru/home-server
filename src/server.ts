import * as Koa from 'koa'
import * as websockify from 'koa-websocket'
import * as serve from 'koa-static'
import * as mount from 'koa-mount'
import { logger } from './logging'
import config from './config'
import routes from './routes'
import * as prettyjson from 'prettyjson'
import * as UrlPattern from 'url-pattern'

const ServiceWorkerPathPattern = new UrlPattern('*/:app/sw.js')
const staticServer = new Koa()
staticServer.use(serve(config.staticContentPath, {
  setHeaders: (res, path: string) => {
    let isSW = ServiceWorkerPathPattern.match(path)
    if (isSW) {
      res.setHeader('Service-Worker-Allowed', '/' + isSW.app)
    }
  },
}))

const fileStorage = new Koa()
fileStorage.use(serve(config.volumn))
fileStorage.use(serve(config.rootPath + config.tempFileDir))

const app = websockify(new Koa())
app.use(mount('/static', staticServer))
app.use(mount('/files/', fileStorage))
app.use(logger)
app.use(routes.http)
app.ws.use(routes.ws)

app.listen(config.port)

console.info(`Server running on port ${config.port}`)
console.info('With configuration:')
console.info(prettyjson.render(config))
