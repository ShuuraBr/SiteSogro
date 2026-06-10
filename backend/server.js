'use strict'
require('dotenv').config()

const fastify = require('fastify')({ logger: true })
const path    = require('path')
const fs      = require('fs')

fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true,
})

fastify.register(require('@fastify/cookie'))

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  cookie: { cookieName: 'token', signed: false },
})

fastify.register(require('@fastify/rate-limit'), {
  max: 100, timeWindow: '1 minute',
})

fastify.register(require('@fastify/multipart'), {
  limits: { fileSize: 50 * 1024 * 1024 },
})

const uploadDir = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

fastify.register(require('@fastify/static'), {
  root: path.resolve(uploadDir),
  prefix: '/uploads/',
})

fastify.register(require('./src/routes/auth.routes'),       { prefix: '/api/auth' })
fastify.register(require('./src/routes/portal.routes'),     { prefix: '/api/portal' })
fastify.register(require('./src/routes/document.routes'),   { prefix: '/api/documents' })
fastify.register(require('./src/routes/meeting.routes'),    { prefix: '/api/meetings' })
fastify.register(require('./src/routes/message.routes'),    { prefix: '/api/messages' })
fastify.register(require('./src/routes/compliance.routes'), { prefix: '/api/compliance' })
fastify.register(require('./src/routes/admin.routes'),      { prefix: '/api/admin' })

fastify.get('/health', async () => ({ status: 'ok', version: '1.0.0' }))

const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 3002
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`\n✅ Backend C. Carvalho rodando em http://localhost:${port}`)
    console.log(`   Health: http://localhost:${port}/health\n`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()