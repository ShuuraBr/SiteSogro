const { verifyJWT } = require('../middleware/auth.middleware')
const prisma  = require('../config/database')
const { v4: uuid } = require('uuid')
const path  = require('path')
const fs    = require('fs')

module.exports = async (fastify) => {
  // Lista documentos do cliente
  fastify.get('/', { onRequest: [verifyJWT] }, async (req, reply) => {
    const docs = await prisma.document.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    reply.send(docs)
  })

  // Upload (admin envia para cliente)
  fastify.post('/upload', { onRequest: [verifyJWT] }, async (req, reply) => {
    const data = await req.file()
    if (!data) return reply.status(400).send({ error: 'Arquivo não enviado' })

    const { title, description, category, userId } = Object.fromEntries(
      Object.entries(req.body || {}).map(([k, v]) => [k, v.value || v])
    )

    const targetUser = userId || req.user.id
    const ext      = path.extname(data.filename)
    const fileName = `${uuid()}${ext}`
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName)

    await require('stream/promises').pipeline(data.file, fs.createWriteStream(filePath))
    const stat = fs.statSync(filePath)

    const doc = await prisma.document.create({
      data: {
        userId: targetUser, title: title || data.filename,
        description, category, fileName: data.filename,
        filePath: fileName, fileSize: stat.size, mimeType: data.mimetype,
        status: 'ACTIVE',
      },
    })
    reply.status(201).send(doc)
  })

  // Download
  fastify.get('/:id/download', { onRequest: [verifyJWT] }, async (req, reply) => {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })
    if (!doc) return reply.status(404).send({ error: 'Documento não encontrado' })
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', doc.filePath)
    return reply.sendFile(doc.filePath)
  })
}
