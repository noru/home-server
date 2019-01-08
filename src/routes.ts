
import wsRouter from './socket'
import httpRouter from './http'

export const http = httpRouter.routes()
export const ws = wsRouter.routes()

export default {
  http,
  ws,
}