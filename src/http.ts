
import * as Router from 'koa-router'
import * as multer from 'koa-multer'
import { createReadStream, statSync, mkdirSync, existsSync, readdir, unlink as unlinkCb } from 'fs'
import config from './config'
import * as notp from 'notp'
import * as base32 from 'thirty-two'
import * as qs from 'qs'
import { promisify } from 'util'

const readDir = promisify(readdir)
const unlink = promisify(unlinkCb)

const TEMP_FILE_DIR = config.rootPath + config.tempFileDir

function getURI() {
  let encoded = base32.encode(config.OTPSecret)
  let encodedForGoogle = encoded.toString().replace(/=/g, '')
  let uri = 'otpauth://totp/nooooru@gmail.com?secret=' + encodedForGoogle
  return uri
}

async function authCheck(ctx, next) {
  let token = ctx.query.token
  if (notp.totp.verify(token, config.OTPSecret, { window: 1, time: 30 })) {
    await next()
  } else {
    ctx.body = 'go fxxk yourself'
    ctx.status = 401
  }
}

const httpRouter = new Router()

httpRouter.get('/', async (ctx) => {
  ctx.body = 'Server is running fine *★,°*:.☆(￣▽￣)/$:*.°★* 。' // todo, Cover page!
})

httpRouter.get('/poke', async (ctx) => {
  ctx.body = 'Server is running fine *★,°*:.☆(￣▽￣)/$:*.°★* 。'
})

httpRouter.get('/clipboard', async ctx => {
  let indexPath = config.rootPath + '/static/clipboard/index.html'
  let fileStat = statSync(indexPath)
  ctx.type = 'html'
  ctx.set('Content-Length', fileStat.size.toString())
  ctx.body = createReadStream(indexPath)
})

httpRouter.get('/filecase', async ctx => {
  let indexPath = config.rootPath + '/static/filecase/index.html'
  let fileStat = statSync(indexPath)
  ctx.type = 'html'
  ctx.set('Content-Length', fileStat.size.toString())
  ctx.body = createReadStream(indexPath)
})

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    let params = qs.parse(req._parsedUrl.query)
    let dir = JSON.parse(params.keep || 'false') ? config.volumn : TEMP_FILE_DIR
    if (!existsSync(dir)) {
      mkdirSync(dir)
    }
    cb(null, dir)
  },
  filename(_req, file, cb) {
    cb(null, file.fieldname)
  },
})
const upload = multer({ storage })

httpRouter.post('/files', authCheck, upload.any(), async (ctx) => {
  ctx.body = 'uploaded'
})

httpRouter.get('/files', async ctx => {

  let saved = new Array, temp = new Array
  let files = await readDir(config.volumn).catch(_ => [])
  files.forEach(file => {
    saved.push(file)
  })

  files = await readDir(TEMP_FILE_DIR).catch(_ => [])
  files.forEach(file => {
    temp.push(file)
  })

  ctx.body = {
    saved,
    temp,
  }
})

httpRouter.del('/files/:filename', authCheck, async ctx => {
  let filename = ctx.params.filename
  let deleted = 0
  await unlink(config.volumn + '/' + filename)
    .then(() => deleted += 1)
    .catch(_ => { /** do nothing */ })
  await unlink(config.rootPath + config.tempFileDir + '/' + filename)
    .then(() => deleted += 1)
    .catch(_ => { /** do nothing */ })

  if (deleted === 0) {
    ctx.status = 404
    ctx.body = 'Not found'
  } else {
    ctx.body = `${deleted} files deleted`
  }
})

httpRouter.get('/authQr', authCheck, async ctx => {
  ctx.redirect('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(getURI()))
})

export default httpRouter