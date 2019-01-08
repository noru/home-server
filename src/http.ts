
import * as Router from 'koa-router'
import { createReadStream, statSync } from 'fs'
import config from './config'

const httpRouter = new Router()

httpRouter.get('/', async (ctx) => {
  ctx.body = 'Server is running fine *★,°*:.☆(￣▽￣)/$:*.°★* 。'
})

httpRouter.get('/clipboard', async ctx => {
  let indexPath = config.rootPath + '/static/clipboard/index.html'
  let fileStat = statSync(indexPath)
  ctx.type = 'html'
  ctx.set('Content-Length', fileStat.size.toString())
  ctx.body = createReadStream(indexPath)
})

export default httpRouter