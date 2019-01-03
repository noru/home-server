
import * as Router from 'koa-router'

let LocalStorage = require('node-localstorage').LocalStorage
const localStorage = new LocalStorage('./paste')

const httpRouter = new Router()
const wsRouter = new Router()

httpRouter.get('/', async (ctx) => {
    ctx.body = 'Server is running fine *★,°*:.☆(￣▽￣)/$:*.°★* 。'
})

wsRouter.all('/paste', ctx => {
    ctx.websocket.on('message', (message: string) => {
        let [type, data] = message.split('::')
        switch (type) {
            case 'set':
                localStorage.setItem('paste', data || '')
                // do fall through
            case 'get':
                ctx.websocket.send(type === 'get' ? localStorage.getItem('paste') : data)
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