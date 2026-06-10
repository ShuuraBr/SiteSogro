const { verifyJWT } = require('../middleware/auth.middleware')
const prisma = require('../config/database')

module.exports = async (fastify) => {
  fastify.get('/', { onRequest: [verifyJWT] }, async (req, reply) => {
    const msgs = await prisma.message.findMany({
      where: { toId: req.user.id },
      include: { from: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    reply.send(msgs)
  })

  fastify.post('/', { onRequest: [verifyJWT] }, async (req, reply) => {
    const { toId, subject, body } = req.body
    const msg = await prisma.message.create({
      data: { fromId: req.user.id, toId, subject, body },
    })
    reply.status(201).send(msg)
  })

  fastify.patch('/:id/read', { onRequest: [verifyJWT] }, async (req, reply) => {
    await prisma.message.updateMany({ where: { id: req.params.id, toId: req.user.id }, data: { read: true } })
    reply.send({ ok: true })
  })
}
