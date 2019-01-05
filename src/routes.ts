
import * as Router from 'koa-router'
import config from './config'
import { createReadStream } from 'fs'

console.info(config.rootPath)
const localStorage = new (require('node-localstorage').LocalStorage)(config.rootPath + '/__clipboard')

const httpRouter = new Router()
const wsRouter = new Router()

httpRouter.get('/', async (ctx) => {
  ctx.body = 'Server is running fine *★,°*:.☆(￣▽￣)/$:*.°★* 。'
})

httpRouter.get('/clipboard', async ctx => {
  ctx.type = 'html'
  ctx.body = createReadStream(config.rootPath + '/static/clipboard/index.html')
})

wsRouter.all('/ws/clipboard', ctx => {
  ctx.websocket.on('message', (message: string) => {
    let [type, data] = message.split('::')
    switch (type) {
      case 'set':
        localStorage.setItem('clip', data || '')
        // do fall through
      case 'get':
        ctx.websocket.send(type === 'get' ? (localStorage.getItem('clip') || '') : data)
      default:
        break
    }
  })

})

export const http = httpRouter.routes()

export const ws = wsRouter.routes()

export default {
  http,
  ws,
}