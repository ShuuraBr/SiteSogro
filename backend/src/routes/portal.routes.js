const { verifyJWT } = require('../middleware/auth.middleware')
const prisma = require('../config/database')

module.exports = async (fastify) => {

  // Dashboard do cliente
  fastify.get('/dashboard', { onRequest: [verifyJWT] }, async (req, reply) => {
    const userId = req.user.id
    const [docs, meetings, messages, compliance] = await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.meeting.count({ where: { userId, status: { in: ['SCHEDULED','CONFIRMED'] } } }),
      prisma.message.count({ where: { toId: userId, read: false } }),
      prisma.complianceItem.findMany({ where: { userId } }),
    ])
    const score = compliance.length
      ? Math.round(compliance.reduce((a, c) => a + (c.score / c.maxScore) * 100, 0) / compliance.length)
      : 0
    reply.send({ docs, meetings, unread: messages, complianceScore: score })
  })

  // Enviar mensagem para o admin
  fastify.post('/message', { onRequest: [verifyJWT] }, async (req, reply) => {
    const { subject, body } = req.body
    if (!body) return reply.status(400).send({ error: 'Mensagem obrigatória' })

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) return reply.status(404).send({ error: 'Admin não encontrado' })

    const msg = await prisma.message.create({
      data: { fromId: req.user.id, toId: admin.id, subject, body }
    })
    reply.status(201).send(msg)
  })

}