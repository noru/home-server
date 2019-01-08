
import * as Router from 'koa-router'
import config from './config'

const wsRouter = new Router()
const localStorage = new (require('node-localstorage').LocalStorage)(config.rootPath + '/__clipboard')

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

export default wsRouter